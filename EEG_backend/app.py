from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
from auth_routes import auth  # <-- updated import
from flask_pymongo import PyMongo
import os
import numpy as np
import joblib
import tensorflow as tf

# Serve frontend from React dist folder
app = Flask(__name__, static_folder="dist", static_url_path="/")
CORS(app)

# MongoDB + JWT config
app.config['MONGO_URI'] = os.getenv("MONGO_URI", "mongodb+srv://U9hpfSjwdZH9a78L:<db_password>@cluster0.mu6avf7.mongodb.net/")
app.config['JWT_SECRET'] = os.getenv("JWT_SECRET", "supersecretkey")
mongo = PyMongo(app)
app.mongo = mongo

# Register auth blueprint
app.register_blueprint(auth)

# Load ML model and scaler
model = tf.keras.models.load_model("../models/cnn_lstm_model_4.h5")
scaler = joblib.load("../scaler.pkl")

@app.route("/")
def serve_react():
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    else:
        abort(404, description="React frontend not built or index.html missing.")

@app.errorhandler(404)
def not_found(e):
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    else:
        return jsonify({"error": "Resource not found"}), 404

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or len(data) != 54:
            return jsonify({'error': 'Exactly 54 features are required.'}), 400

        features = [float(data[f'feature{i}']) for i in range(54)]
        scaled = scaler.transform([features])
        input_reshaped = np.array(scaled).reshape(1, 1, 54)

        prediction = model.predict(input_reshaped)
        predicted_class = int(np.argmax(prediction))

        label_map = {
            0: "Addictive disorder",
            1: "Anxiety disorder",
            2: "Healthy control",
            3: "Mood disorder",
            4: "Obsessive compulsive disorder",
            5: "Schizophrenia",
            6: "Trauma and stress related disorder"
        }

        return jsonify({
            'prediction': label_map[predicted_class],
            'confidences': {
                label_map[i]: float(score) for i, score in enumerate(prediction[0])
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
