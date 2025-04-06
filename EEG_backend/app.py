from flask import Flask, jsonify, request, send_from_directory, abort
import os
from flask_cors import CORS
from auth_routes import auth_bp
from flask_pymongo import PyMongo
import numpy as np
import joblib
import tensorflow as tf

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# MongoDB setup
app.config["MONGO_URI"] = "mongodb+srv://rachit242rb:U9hpfSjwdZH9a78L@cluster0.mu6avf7.mongodb.net/"
app.config["JWT_SECRET"] = "supersecretkey"
mongo = PyMongo(app)
app.mongo = mongo

# Debug: Verify MONGO_URI
print("MONGO_URI:", app.config["MONGO_URI"])

# Debug: Verify MongoDB instance creation
if mongo.cx is None:
    print("MongoDB connection failed. Check your MONGO_URI or server status.")
else:
    print("MongoDB connection successful.")

# Debug: Verify MongoDB instance
print("MongoDB instance created:", mongo)

# Import blueprints after MongoDB setup
from auth_routes import auth_bp
from prediction_routes import predict_bp

# Inject MongoDB instance into blueprints
auth_bp.mongo = mongo  # Inject MongoDB instance into auth_bp
predict_bp.mongo = mongo  # Inject MongoDB instance into predict_bp (if needed)

# Debug: Verify MongoDB injection
print("MongoDB instance injected into auth_bp:", auth_bp.mongo)
print("MongoDB instance injected into predict_bp:", predict_bp.mongo)

# ML model/scaler setup
model = tf.keras.models.load_model("../models/cnn_lstm_model_4.h5")
scaler = joblib.load("../scaler.pkl")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(predict_bp)

# Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Get absolute path to the Vite-built frontend directory
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../EEG_frontend/dist"))
    
    # Check if frontend directory exists
    if not os.path.isdir(dist_dir):
        app.logger.error(f"Frontend directory not found: {dist_dir}")
        return jsonify({"error": "Frontend directory not found"}), 500
    
    # Check if requested path exists
    full_path = os.path.join(dist_dir, path)
    if path and os.path.exists(full_path):
        return send_from_directory(dist_dir, path)
    
    # Serve index.html if it exists
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(dist_dir, "index.html")
    else:
        app.logger.error(f"index.html not found in: {dist_dir}")
        return jsonify({"error": "Frontend not properly installed"}), 500

@app.errorhandler(404)
def not_found(e):
    # Get absolute path to frontend directory
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../EEG_frontend"))
    index_path = os.path.join(dist_dir, "index.html")
    
    # Serve index.html if it exists, otherwise return a 404 error
    if os.path.exists(index_path):
        return send_from_directory(dist_dir, "index.html")
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

if __name__ == "__main__":
    app.run(debug=True)