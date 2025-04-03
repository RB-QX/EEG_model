import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import joblib

# Define the input file path
file_path = r"EE_PCA_1.csv"  # Update to your actual path

# Load the processed EEG data
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: The file at {file_path} was not found.")
    exit()

# Separate features (assuming 54 columns)
X = df.iloc[:, :-1].values  # Features (all columns except the last one)

# Fit the scaler
scaler = MinMaxScaler()
scaler.fit(X)

# Save the scaler
joblib.dump(scaler, 'scaler.pkl')
print("Scaler saved to scaler.pkl")