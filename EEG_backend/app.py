from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import joblib
import tensorflow as tf

app = Flask(__name__, static_folder="dist", static_url_path="/")
CORS(app)

# Load model and scaler
model = tf.keras.models.load_model("../models/cnn_lstm_model_4.h5")
scaler = joblib.load("../scaler.pkl")

# Prediction route
@app.route("/")
def serve_react():
    return send_from_directory(app.static_folder, "index.html")

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
