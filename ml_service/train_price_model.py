"""Train a price prediction model for UrbanSahay service pricing.

This script:
1. Creates an in-code dataset with service, location, urgency, and price.
2. Encodes categorical variables using LabelEncoder.
3. Trains a Linear Regression model.
4. Saves the model and encoders using pickle.
"""

import pickle
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "price_model.pkl"
ENCODER_SERVICE_PATH = BASE_DIR / "encoder_service.pkl"
ENCODER_LOCATION_PATH = BASE_DIR / "encoder_location.pkl"
ENCODER_URGENCY_PATH = BASE_DIR / "encoder_urgency.pkl"


def get_dataset() -> pd.DataFrame:
    """Return a sample dataset for price prediction.

    Includes realistic pricing for different services, locations, and urgency levels.
    """
    data = {
        "service_type": [
            "Plumber",
            "Plumber",
            "Plumber",
            "Plumber",
            "Electrician",
            "Electrician",
            "Electrician",
            "Electrician",
            "Cleaner",
            "Cleaner",
            "Cleaner",
            "Cleaner",
            "Painter",
            "Painter",
            "Painter",
            "Painter",
            "Doctor",
            "Doctor",
            "Doctor",
            "Doctor",
            "AC Technician",
            "AC Technician",
            "AC Technician",
            "AC Technician",
            "Carpenter",
            "Carpenter",
            "Carpenter",
            "Carpenter",
            "Pet Care",
            "Pet Care",
            "Pet Care",
            "Pet Care",
        ],
        "location": [
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
            "Downtown",
            "Downtown",
            "Suburbs",
            "Suburbs",
        ],
        "urgency": [
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
            "Low",
            "High",
        ],
        "price": [
            500,
            800,
            400,
            600,
            600,
            1000,
            500,
            800,
            800,
            1200,
            600,
            900,
            1500,
            2000,
            1200,
            1600,
            500,
            800,
            400,
            600,
            1500,
            2000,
            1200,
            1600,
            1000,
            1500,
            800,
            1200,
            300,
            500,
            250,
            400,
        ],
    }

    return pd.DataFrame(data)


def train_and_save_model() -> None:
    """Train the price prediction model and save artifacts to disk."""
    df = get_dataset()

    print(f"Dataset shape: {df.shape}")
    print(f"Price range: {df['price'].min()} - {df['price'].max()}")

    # Initialize encoders for categorical columns.
    encoder_service = LabelEncoder()
    encoder_location = LabelEncoder()
    encoder_urgency = LabelEncoder()

    # Encode categorical columns.
    df["service_encoded"] = encoder_service.fit_transform(df["service_type"])
    df["location_encoded"] = encoder_location.fit_transform(df["location"])
    df["urgency_encoded"] = encoder_urgency.fit_transform(df["urgency"])

    # Prepare features (X) and target (y).
    X = df[["service_encoded", "location_encoded", "urgency_encoded"]].values
    y = df["price"].values

    # Train the Linear Regression model.
    model = LinearRegression()
    model.fit(X, y)

    # Evaluate the model.
    y_pred = model.predict(X)
    mse = mean_squared_error(y, y_pred)
    r2 = r2_score(y, y_pred)

    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.4f}")

    # Save the model.
    with open(MODEL_PATH, "wb") as model_file:
        pickle.dump(model, model_file)
    print(f"Model saved to: {MODEL_PATH}")

    # Save encoders.
    with open(ENCODER_SERVICE_PATH, "wb") as enc_file:
        pickle.dump(encoder_service, enc_file)
    print(f"Service encoder saved to: {ENCODER_SERVICE_PATH}")

    with open(ENCODER_LOCATION_PATH, "wb") as enc_file:
        pickle.dump(encoder_location, enc_file)
    print(f"Location encoder saved to: {ENCODER_LOCATION_PATH}")

    with open(ENCODER_URGENCY_PATH, "wb") as enc_file:
        pickle.dump(encoder_urgency, enc_file)
    print(f"Urgency encoder saved to: {ENCODER_URGENCY_PATH}")


if __name__ == "__main__":
    try:
        train_and_save_model()
    except Exception as exc:
        print(f"Training failed: {exc}")
        raise
