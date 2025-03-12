import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from keras.models import Sequential
from keras.layers import Dense


data = pd.read_csv('./Data/filtered_data.csv')


data['class'] = (data['class'] != "normal").astype(int)


X = data.drop(columns=['class'])
y = data['class']


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)


scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


model = Sequential([
    Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])


model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])


model.fit(X_train_scaled, y_train, epochs=20, batch_size=32, validation_split=0.2)


loss, accuracy = model.evaluate(X_test_scaled, y_test)
print("Test Accuracy:", accuracy)
