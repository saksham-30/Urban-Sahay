"""Train a robust text classification model for UrbanSahay service routing.

This script:
1. Builds a larger synthetic dataset for many UrbanSahay services.
2. Uses both word and character-level TF-IDF features.
3. Trains a multi-class Logistic Regression classifier.
4. Saves the trained model and vectorizer using pickle.

The design stays beginner-friendly while giving better real-world robustness.
"""

import pickle
from pathlib import Path
from typing import Dict, List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion


# Save model files in the same directory as this script.
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "service_model.pkl"
VECTORIZER_PATH = BASE_DIR / "tfidf_vectorizer.pkl"


def get_service_keywords() -> Dict[str, List[str]]:
    """Return service categories with common complaint keywords."""
    return {
        "Plumber": ["water leaking from pipe", "tap dripping", "sink blocked", "toilet clog", "drain choke"],
        "Electrician": ["fan not working", "switch board not working", "socket sparking", "power trip", "light flickering"],
        "Cleaner": ["deep home cleaning", "bathroom cleaning", "kitchen cleaning", "dusting and mopping", "sanitize house"],
        "Painter": ["wall repaint", "paint peeling", "ceiling paint", "wall color touchup", "interior painting"],
        "Doctor": ["high fever", "headache", "stomach pain", "need doctor consultation", "medical emergency"],
        "AC Technician": ["AC not cooling", "air conditioner repair", "ac gas refill", "ac making noise", "split ac water leakage"],
        "Carpenter": ["door repair", "furniture fixing", "cabinet work", "wooden shelf installation", "table broken"],
        "Mechanic": ["bike not starting", "car engine issue", "vehicle breakdown", "flat tyre help", "battery problem"],
        "Salon & Spa": ["home haircut", "facial service", "bridal makeup", "spa at home", "grooming service"],
        "Pest Control": ["cockroach problem", "termite treatment", "mosquito control", "rat issue", "bed bug treatment"],
        "AC & Appliance": ["washing machine repair", "fridge not cooling", "microwave not heating", "geyser repair", "appliance service"],
        "Bathroom Renovation": ["bathroom tiling", "shower fitting", "bathroom waterproofing", "washroom renovation", "fitting replacement"],
        "Packers & Movers": ["house shifting", "move furniture", "pack and move", "relocation service", "office shifting"],
        "Laundry & Ironing": ["clothes washing", "dry cleaning", "ironing service", "laundry pickup", "press clothes"],
        "Gardening": ["lawn maintenance", "plant care", "garden cleanup", "tree trimming", "landscaping help"],
        "Cook & Chef": ["home cook required", "daily meal cooking", "party catering", "chef needed", "tiffin preparation"],
        "Babysitter": ["child care", "baby sitting", "nanny required", "newborn care", "kids supervision"],
        "Pet Care": ["dog grooming", "pet walking", "pet sitting", "cat care", "pet bath service"],
        "Fitness Trainer": ["personal trainer", "home workout coach", "yoga trainer", "weight loss training", "fitness session"],
        "Home Tutor": ["math tuition", "science tutor", "english teacher", "home tuition", "exam preparation"],
        "Emergency Services": ["urgent help needed", "emergency support", "immediate assistance", "critical issue", "SOS service"],
    }


def get_dataset() -> Tuple[List[str], List[str]]:
    """Generate a larger in-code dataset using templates and keywords."""
    templates = [
        "{kw}",
        "need help with {kw}",
        "urgent {kw}",
        "please send someone for {kw}",
        "looking for {kw} service",
        "{kw} at home",
    ]

    samples: List[Tuple[str, str]] = []
    for category, keywords in get_service_keywords().items():
        for keyword in keywords:
            for template in templates:
                samples.append((template.format(kw=keyword), category))

    # Keep the exact examples used in your requirement.
    samples.extend(
        [
            ("water leaking from pipe", "Plumber"),
            ("fan not working", "Electrician"),
            ("AC not cooling", "AC Technician"),
        ]
    )

    texts = [text for text, _ in samples]
    labels = [label for _, label in samples]
    return texts, labels


def build_vectorizer() -> FeatureUnion:
    """Combine word and character TF-IDF features for better robustness."""
    return FeatureUnion(
        [
            (
                "word_tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                ),
            ),
            (
                "char_tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    sublinear_tf=True,
                ),
            ),
        ]
    )


def train_and_save_model() -> None:
    """Train the classifier and save artifacts to disk."""
    texts, labels = get_dataset()

    # Split data only to get a rough quality check.
    X_train, X_test, y_train, y_test = train_test_split(
        texts,
        labels,
        test_size=0.25,
        random_state=42,
        stratify=labels,
    )

    # Convert raw text to numeric vectors with hybrid TF-IDF.
    vectorizer = build_vectorizer()
    X_train_vectors = vectorizer.fit_transform(X_train)
    X_test_vectors = vectorizer.transform(X_test)

    # Train a multi-class Logistic Regression model.
    model = LogisticRegression(max_iter=2000, random_state=42, class_weight="balanced", C=2.0)
    model.fit(X_train_vectors, y_train)

    # Simple evaluation for learning/demo purposes.
    predictions = model.predict(X_test_vectors)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Validation accuracy: {accuracy:.2f}")

    # Save both model and vectorizer with pickle.
    with open(MODEL_PATH, "wb") as model_file:
        pickle.dump(model, model_file)

    with open(VECTORIZER_PATH, "wb") as vectorizer_file:
        pickle.dump(vectorizer, vectorizer_file)

    print(f"Model saved to: {MODEL_PATH}")
    print(f"Vectorizer saved to: {VECTORIZER_PATH}")


if __name__ == "__main__":
    try:
        train_and_save_model()
    except Exception as exc:
        print(f"Training failed: {exc}")
        raise
