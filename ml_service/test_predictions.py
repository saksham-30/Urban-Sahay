"""Simple test client for UrbanSahay AI API.

Usage:
1. Start API server in another terminal:
   uvicorn app:app --reload
2. Run this script:
   python test_predictions.py
"""

import requests


API_BASE_URL = "http://127.0.0.1:8000"


def test_predict_endpoint(text: str) -> None:
    response = requests.post(f"{API_BASE_URL}/predict", json={"text": text}, timeout=10)
    print("/predict input:", text)
    print("/predict response:", response.status_code, response.json())
    print("-" * 60)


def test_confidence_endpoint(text: str) -> None:
    response = requests.post(f"{API_BASE_URL}/confidence", json={"text": text}, timeout=10)
    print("/confidence input:", text)
    print("/confidence response:", response.status_code, response.json())
    print("-" * 60)


if __name__ == "__main__":
    example_inputs = [
        "water leaking from pipe",
        "fan not working",
        "AC not cooling",
        "need urgent house cleaning",
        "door hinge repair needed",
        "car engine not starting",
        "need home tutor for maths",
        "urgent pest control for cockroaches",
        "looking for babysitter tonight",
        "need packers and movers for house shifting",
    ]

    print("Testing /predict endpoint")
    for sample in example_inputs:
        test_predict_endpoint(sample)

    print("Testing /confidence endpoint")
    for sample in example_inputs:
        test_confidence_endpoint(sample)
