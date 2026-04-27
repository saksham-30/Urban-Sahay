"""FastAPI app for predicting UrbanSahay service pricing.

Run this file after training the price model:
1. python train_price_model.py
2. uvicorn price_app:app --reload --port 8001
"""

import pickle
from pathlib import Path
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "price_model.pkl"
ENCODER_SERVICE_PATH = BASE_DIR / "encoder_service.pkl"
ENCODER_LOCATION_PATH = BASE_DIR / "encoder_location.pkl"
ENCODER_URGENCY_PATH = BASE_DIR / "encoder_urgency.pkl"


class PriceRequest(BaseModel):
    service: str = Field(..., example="Plumber", description="Service type")
    location: str = Field(..., example="Downtown", description="Service location")
    urgency: str = Field(..., example="High", description="Urgency level")


app = FastAPI(title="UrbanSahay Price Predictor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global variables for model and encoders.
model = None
encoder_service = None
encoder_location = None
encoder_urgency = None


def load_artifacts() -> None:
    """Load model and encoders from pickle files."""
    global model, encoder_service, encoder_location, encoder_urgency

    if not (
        MODEL_PATH.exists()
        and ENCODER_SERVICE_PATH.exists()
        and ENCODER_LOCATION_PATH.exists()
        and ENCODER_URGENCY_PATH.exists()
    ):
        raise FileNotFoundError(
            "Model files not found. Run train_price_model.py first to generate pickle files."
        )

    with open(MODEL_PATH, "rb") as model_file:
        model = pickle.load(model_file)

    with open(ENCODER_SERVICE_PATH, "rb") as enc_file:
        encoder_service = pickle.load(enc_file)

    with open(ENCODER_LOCATION_PATH, "rb") as enc_file:
        encoder_location = pickle.load(enc_file)

    with open(ENCODER_URGENCY_PATH, "rb") as enc_file:
        encoder_urgency = pickle.load(enc_file)


@app.on_event("startup")
def startup_event() -> None:
    """Load ML artifacts when the API starts."""
    try:
        load_artifacts()
    except Exception as exc:
        raise RuntimeError(f"Startup failed: {exc}") from exc


@app.get("/")
def root() -> Dict[str, str]:
    return {"message": "UrbanSahay Price Predictor API is running."}


@app.post("/predict-price")
def predict_price(payload: PriceRequest) -> Dict[str, object]:
    """Predict service price based on service type, location, and urgency."""
    try:
        service = payload.service.strip()
        location = payload.location.strip()
        urgency = payload.urgency.strip()

        if not (service and location and urgency):
            raise HTTPException(status_code=400, detail="All fields are required.")

        # Encode the input using the trained encoders.
        try:
            service_encoded = encoder_service.transform([service])[0]
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown service type: {service}. Supported types: {', '.join(encoder_service.classes_)}",
            )

        try:
            location_encoded = encoder_location.transform([location])[0]
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown location: {location}. Supported locations: {', '.join(encoder_location.classes_)}",
            )

        try:
            urgency_encoded = encoder_urgency.transform([urgency])[0]
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown urgency: {urgency}. Supported levels: {', '.join(encoder_urgency.classes_)}",
            )

        # Predict the price.
        features = [[service_encoded, location_encoded, urgency_encoded]]
        predicted_price = float(model.predict(features)[0])

        # Calculate price range (min/max with 20% variance).
        min_price = max(predicted_price * 0.8, 0)
        max_price = predicted_price * 1.2

        return {
            "service": service,
            "location": location,
            "urgency": urgency,
            "predicted_price": round(predicted_price, 2),
            "price_range": {
                "min": round(min_price, 2),
                "max": round(max_price, 2),
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("price_app:app", host="0.0.0.0", port=8001, reload=True)
