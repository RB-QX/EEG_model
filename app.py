from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_session import Session
import tensorflow as tf
import joblib
from authlib.integrations.flask_client import OAuth
from utils.db import init_db, insert_data, fetch_data, insert_user, fetch_user, get_db_connection
from utils.preprocess import preprocess_input
from datetime import timedelta
from functools import wraps
from utils.db import insert_prediction
from utils.db import get_user_predictions  # Add this import if not already present
from utils.db import update_user_profile
import csv
from io import StringIO
from flask import Response
import os

# ------------------------------------------------------------------------------
# Flask App Setup
# ------------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("APP_SECRET_KEY", 'very-strong-secret-key-1234')

app.config.update(
    SESSION_TYPE='filesystem',
    SESSION_PERMANENT=True,
    SESSION_USE_SIGNER=True,
    SESSION_FILE_DIR='./.flask_session/',
    SESSION_COOKIE_NAME='eeg_session',
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=True  # Use HTTPS for secure cookies
)

Session(app)

# ------------------------------------------------------------------------------
# Auth0 Configuration
# ------------------------------------------------------------------------------
AUTH0_CALLBACK_URL = 'https://localhost:5000/callback'

app.config.update(
    AUTH0_CLIENT_ID='fqZEkkOW6Ry6n5T94snVDBNT5Plp4FLI',
    AUTH0_CLIENT_SECRET='DgjlSfZ8y6SBTzpG-cQjKh7j-Lu6EEEc_5TUvM6XzXwYt6bBFE0ldUdAEAlAO9fm',
    AUTH0_DOMAIN='dev-2tfwhpxhm4oqn6xq.us.auth0.com'
)

oauth = OAuth(app)
auth0 = oauth.register(
    name='auth0',
    client_id=app.config['AUTH0_CLIENT_ID'],
    client_secret=app.config['AUTH0_CLIENT_SECRET'],
    server_metadata_url=f'https://{app.config["AUTH0_DOMAIN"]}/.well-known/openid-configuration',
    api_base_url=f'https://{app.config["AUTH0_DOMAIN"]}/',  # ✅ This line is critical
    client_kwargs={
        'scope': 'openid profile email'
    }
)

# ------------------------------------------------------------------------------
# Load Model and Scaler
# ------------------------------------------------------------------------------
MODEL_PATH = 'models/cnn_lstm_model_4.h5'
SCALER_PATH = 'scaler.pkl'

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model or scaler: {e}")
    raise

# ------------------------------------------------------------------------------
# Helper: Login Required Decorator
# ------------------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return wrapped

# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    print("🟢 SESSION at /login:", dict(session))  # DEBUG
    return auth0.authorize_redirect(redirect_uri=AUTH0_CALLBACK_URL)

@app.route('/callback')
def callback_handling():
    print("🟡 SESSION at /callback:", dict(session))  # DEBUG
    token = auth0.authorize_access_token()
    user_info = auth0.get('userinfo').json()

    # Check if user exists in our database
    db_user = fetch_user(user_info['email'])

    # If not, create the user
    if not db_user:
        insert_user({
            'name': user_info['name'],
            'email': user_info['email'],
            'password': None,  # Auth0 handles authentication
            'role': 'user'
        })
        db_user = fetch_user(user_info['email'])

    session['user'] = {
        'name': user_info['name'],
        'email': user_info['email'],
        'picture': user_info.get('picture'),  # 👈 Add this line to include the profile picture
        'bio': db_user.get('bio', '') if db_user else ''
    }

    return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(
        f"https://{app.config['AUTH0_DOMAIN']}/v2/logout?returnTo={url_for('index', _external=True)}&client_id={app.config['AUTH0_CLIENT_ID']}"
    )

@app.route('/dashboard')
@login_required
def dashboard():
    user = session.get('user')
    predictions = get_user_predictions(user['email'])
    return render_template('dashboard.html', user=user, predictions=predictions)

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signup', methods=['POST'])
def handle_signup():
    data = request.form
    insert_user({
        'name': data['name'],
        'email': data['email'],
        'password': data['password']
    })
    return redirect(url_for('login'))

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    try:
        data = request.get_json()
        if not data or len(data) != 54:
            return jsonify({'error': 'Invalid input: 54 features required'}), 400

        input_data = [float(data[f'feature{i}']) for i in range(54)]
        record_id = insert_data(input_data)
        fetched_data = fetch_data(record_id)
        if not fetched_data:
            return jsonify({'error': 'Failed to retrieve data from database'}), 500

        input_processed = preprocess_input(fetched_data, scaler)
        prediction = model.predict(input_processed, verbose=0)
        predicted_class = int(prediction.argmax(axis=1)[0])
        # Store prediction in DB
        insert_prediction(
            email=session['user']['email'],
            input_data=input_data,
            predicted_class=predicted_class
        )
        return jsonify({'prediction': predicted_class})

    except ValueError:
        return jsonify({'error': 'Invalid input: All values must be numerical'}), 400
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'An error occurred during prediction'}), 500

@app.route('/export-predictions')
@login_required
def export_predictions():
    user = session.get('user')
    predictions = get_user_predictions(user['email'])

    # Create CSV in memory
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(['ID', 'Predicted Class', 'Input Data', 'Created At'])

    for row in predictions:
        writer.writerow([
            row['id'],
            row['predicted_class'],
            row['input_data'],
            row['created_at']
        ])

    # Send as downloadable file
    output = si.getvalue()
    response = Response(output, mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=predictions.csv'
    return response

@app.route('/profile')
@login_required
def profile():
    user = session.get('user')
    return render_template('profile.html', user=user)

@app.route('/profile/edit', methods=['GET'])
@login_required
def edit_profile():
    user = fetch_user(session['user']['email'])
    return render_template('edit_profile.html', user=user)

@app.route('/profile/edit', methods=['POST'])
@login_required
def save_profile():
    name = request.form['name']
    bio = request.form['bio']
    update_user_profile(session['user']['email'], name, bio)
    session['user']['name'] = name  # Update session cache
    session['user']['bio'] = bio    # Update bio in session
    return redirect(url_for('profile'))

@app.route('/admin')
@login_required
def admin_dashboard():
    user = fetch_user(session['user']['email'])
    if user['role'] != 'admin':  # Check if the user is an admin
        return "Unauthorized", 403

    conn = get_db_connection()
    c = conn.cursor()

    # Fetch all users
    c.execute('SELECT id, name, email, role FROM users')
    all_users = c.fetchall()

    # Fetch all predictions
    c.execute('SELECT * FROM predictions ORDER BY created_at DESC')
    all_predictions = c.fetchall()

    conn.close()
    return render_template('admin.html', users=all_users, predictions=all_predictions)

# ------------------------------------------------------------------------------
# Start Server
# ------------------------------------------------------------------------------
if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
