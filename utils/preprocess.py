import numpy as np

def preprocess_input(data, scaler):
    input_array = np.array(data).reshape(1, -1)  # Shape: (1, 54)
    input_scaled = scaler.transform(input_array)  # Normalize
    input_reshaped = input_scaled.reshape(1, 1, 54)  # Shape: (1, timesteps=1, features=54)
    return input_reshaped