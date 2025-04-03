# EEG Model Prediction App

A Flask-based web application to predict EEG data classifications using a pre-trained CNN-LSTM model.

## Setup
1. Clone the repository.
2. Install dependencies: `pip install -r requirements.txt`.
3. Ensure `models/cnn_lstm_model_4.h5` and `scaler.pkl` are in place.
4. Run the app: `python app.py`.
5. Open `http://127.0.0.1:5000/` in a browser.

## Structure
- `app.py`: Flask app and routes.
- `models/`: Pre-trained model files.
- `static/`: CSS and JS for frontend.
- `templates/`: HTML templates.
- `utils/`: Database and preprocessing utilities.