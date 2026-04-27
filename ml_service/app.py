"""FastAPI app for predicting UrbanSahay service categories.

Run this file after training the model:
1. python train_model.py
2. uvicorn app:app --reload
"""

import pickle
from pathlib import Path
from typing import Dict, Optional, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "service_model.pkl"
VECTORIZER_PATH = BASE_DIR / "tfidf_vectorizer.pkl"


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="User problem description")


app = FastAPI(title="UrbanSahay Service Classifier API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# These globals are loaded once at startup.
model = None
vectorizer = None
MIN_CONFIDENCE = 0.35

KEYWORD_FALLBACK = {
    "Plumber": ["pipe", "leak", "tap", "drain", "toilet", "sink", "plumb"],
    "Electrician": ["switch", "switchboard", "switch board", "socket", "wiring", "wire", "fan", "light", "electric", "power", "sparking"],
    "Cleaner": ["clean", "dirty", "mopping", "dusting", "sanitize"],
    "Painter": ["paint", "repaint", "wall color", "peeling"],
    "Doctor": ["doctor", "medical", "fever", "headache", "pain", "sick", "nausea"],
    "AC Technician": ["ac", "air conditioner", "cooling", "compressor", "gas refill"],
    "Carpenter": ["wood", "door", "furniture", "cabinet", "table"],
    "Mechanic": ["bike", "car", "engine", "tyre", "vehicle", "battery"],
    "Salon & Spa": ["haircut", "salon", "spa", "makeup", "facial", "grooming"],
    "Pest Control": ["termite", "cockroach", "rat", "mosquito", "pest", "bug"],
    "AC & Appliance": ["appliance", "fridge", "washing machine", "microwave", "geyser"],
    "Bathroom Renovation": ["bathroom renovation", "tiling", "waterproofing", "washroom"],
    "Packers & Movers": ["shifting", "relocation", "move", "packers", "movers"],
    "Laundry & Ironing": ["laundry", "ironing", "dry clean", "press clothes"],
    "Gardening": ["garden", "plant", "lawn", "landscape", "tree trimming"],
    "Cook & Chef": ["cook", "chef", "meal", "catering", "kitchen help"],
    "Babysitter": ["babysitter", "baby sitting", "nanny", "child care"],
    "Pet Care": ["pet", "dog", "cat", "grooming", "pet walking"],
    "Fitness Trainer": ["fitness", "workout", "trainer", "yoga", "gym"],
    "Home Tutor": ["tutor", "tuition", "teacher", "exam preparation", "study"],
    "Emergency Services": ["emergency", "urgent", "sos", "critical", "immediate help"],
}


def infer_from_keywords(text: str) -> Optional[str]:
    """Fallback rule-based detector when ML confidence is low."""
    query = text.lower()
    for category, keywords in KEYWORD_FALLBACK.items():
        if any(keyword in query for keyword in keywords):
            return category
    return None


def predict_with_confidence(text: str) -> Tuple[str, float, str]:
    """Return category, confidence, and source (ml or rule_fallback)."""
    text_vector = vectorizer.transform([text])
    probabilities = model.predict_proba(text_vector)[0]
    best_idx = int(probabilities.argmax())
    best_category = str(model.classes_[best_idx])
    best_confidence = float(probabilities[best_idx])

    if best_confidence >= MIN_CONFIDENCE:
        return best_category, best_confidence, "ml"

    fallback_category = infer_from_keywords(text)
    if fallback_category:
        return fallback_category, best_confidence, "rule_fallback"

    return best_category, best_confidence, "ml_low_confidence"


def load_artifacts() -> None:
    """Load model and vectorizer from pickle files."""
    global model, vectorizer

    if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
        raise FileNotFoundError(
            "Model files not found. Run train_model.py first to generate pickle files."
        )

    with open(MODEL_PATH, "rb") as model_file:
        model = pickle.load(model_file)

    with open(VECTORIZER_PATH, "rb") as vectorizer_file:
        vectorizer = pickle.load(vectorizer_file)


@app.on_event("startup")
def startup_event() -> None:
    """Load ML artifacts when the API starts."""
    try:
        load_artifacts()
    except Exception as exc:
        # Stop startup with a clear message.
        raise RuntimeError(f"Startup failed: {exc}") from exc


@app.get("/")
def root() -> Dict[str, str]:
    return {"message": "UrbanSahay AI service classifier is running."}


@app.post("/predict")
def predict_category(payload: TextRequest) -> Dict[str, object]:
    """Predict one category label for a user text."""
    try:
        user_text = payload.text.strip()
        if not user_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty.")

        predicted_category, confidence, source = predict_with_confidence(user_text)

        return {
            "predicted_category": predicted_category,
            "confidence": round(confidence, 4),
            "source": source,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/confidence")
def prediction_confidence(payload: TextRequest) -> Dict[str, Dict[str, float]]:
    """Return probability score for each service category."""
    try:
        user_text = payload.text.strip()
        if not user_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty.")

        text_vector = vectorizer.transform([user_text])
        probabilities = model.predict_proba(text_vector)[0]

        confidence_scores = {
            label: float(round(prob, 4))
            for label, prob in zip(model.classes_, probabilities)
        }

        return {"confidence_scores": confidence_scores}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Confidence check failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
