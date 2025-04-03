import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Bidirectional, LSTM, Dense, Dropout
from tensorflow.keras.regularizers import l2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt

# Define the input file path
file_path = r"EE_PCA_1.csv"  # Update with the correct path

# Load the processed EEG data
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: The file at {file_path} was not found.")
    exit()

# Separate features and target
X = df.iloc[:, :-1].values  # Features
y = df.iloc[:, -1].values   # Target

# Normalize the features
scaler = MinMaxScaler()
X = scaler.fit_transform(X)

# Reshape data back to 3D format (samples, time_steps, features)
X = X.reshape(X.shape[0], 1, X.shape[1])  # Assuming time_steps = 1 for this example

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Apply SMOTE to the training data
smote = SMOTE(sampling_strategy='auto', random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train.reshape(X_train.shape[0], -1), y_train)

# Reshape back to 3D for CNN-LSTM
X_resampled = X_resampled.reshape(X_resampled.shape[0], 1, X_resampled.shape[1])

# Define the number of classes
num_classes = len(np.unique(y))  # Get the number of unique classes

# Define the CNN-LSTM model with Bidirectional LSTM
model = Sequential([
    Conv1D(filters=64, kernel_size=3, activation='relu', padding='same', input_shape=(X_resampled.shape[1], X_resampled.shape[2])),
    MaxPooling1D(pool_size=2, padding='same'),
    Conv1D(filters=128, kernel_size=3, activation='relu', padding='same'),  # Additional Conv1D layer
    MaxPooling1D(pool_size=2, padding='same'),  # Optional: Another pooling layer
    Bidirectional(LSTM(128, return_sequences=True)),  # Bidirectional LSTM
    Bidirectional(LSTM(64, return_sequences=True)),    # Another Bidirectional LSTM
    LSTM(32),                           # Existing LSTM layer
    Dense(32, activation='relu'),
    Dropout(0.3),
    Dense(num_classes, activation='softmax')  # Multi-class classification
])

# Compile the model with a lower learning rate
learning_rate = 0.0005
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate), 
              loss='sparse_categorical_crossentropy', 
              metrics=['accuracy'])

# Train the model with resampled data
epochs = 200  # Adjust as needed
batch_size = 32
history = model.fit(X_resampled, y_resampled, epochs=epochs, batch_size=batch_size, validation_data=(X_test, y_test))

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy * 100:.2f}%")

# Save the model
model_save_path = r"models\cnn_lstm_model_4.h5"  # Update with the desired save path
model.save(model_save_path)
print(f"Model saved to {model_save_path}")

# Predict on test data
y_pred = model.predict(X_test)
y_pred_classes = np.argmax(y_pred, axis=1)  # Convert probabilities to class labels

# Compute confusion matrix
cm = confusion_matrix(y_test, y_pred_classes)

# Plot the confusion matrix
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=np.unique(y_test), yticklabels=np.unique(y_test))
plt.xlabel('Predicted Label')
plt.ylabel('True Label')
plt.title('Confusion Matrix')
plt.show()

# Print classification report
print("Classification Report:\n", classification_report(y_test, y_pred_classes))

# Optionally, you can plot the training history
# Plot training & validation accuracy values
plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.legend(loc='upper left')

# Plot training & validation loss values
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.ylabel('Loss')
plt.xlabel('Epoch')
plt.legend(loc='upper left')

plt.tight_layout()
plt.show()

joblib.dump(scaler, 'scaler.pkl')
print("Scaler saved to scaler.pkl")