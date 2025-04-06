
from flask import Blueprint, request, jsonify
import numpy as np
import tensorflow as tf
import joblib
from flask import current_app as app

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or len(data) != 54:
            return jsonify({'error': 'Exactly 54 features are required.'}), 400

        features = [float(data[f'feature{i}']) for i in range(54)]
        scaled = app.scaler.transform([features])
        input_reshaped = np.array(scaled).reshape(1, 1, 54)

        prediction = app.model.predict(input_reshaped)
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
