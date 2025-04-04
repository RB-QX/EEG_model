from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# Load model and scaler
model = tf.keras.models.load_model("../models/cnn_lstm_model_4.h5")
scaler = joblib.load("../scaler.pkl")

# Prediction route
@app.route('/predict', methods=['POST'])

@app.route('/')
def home():
    return "✅ Flask is running!"
def predict():
    try:
        data = request.get_json()
        if not data or len(data) != 54:
            return jsonify({'error': 'Exactly 54 features are required.'}), 400

        # Convert and scale
        features = [float(data[f'feature{i}']) for i in range(54)]
        scaled = scaler.transform([features])

        # Reshape for CNN-LSTM model (assuming 1D sequence with 54 timesteps and 1 channel)
        input_reshaped = np.array(scaled).reshape(1, 54, 1)

        # Predict
        prediction = model.predict(input_reshaped)
        predicted_class = int(np.argmax(prediction))

        return jsonify({'prediction': predicted_class})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
