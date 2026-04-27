"""Test client for UrbanSahay Price Predictor API.

Usage:
1. Start API server in another terminal:
   uvicorn price_app:app --reload --port 8001
2. Run this script:
   python test_price_predictions.py
"""

import requests


API_BASE_URL = "http://127.0.0.1:8001"


def test_price_prediction(service: str, location: str, urgency: str) -> None:
    """Test the price prediction endpoint."""
    payload = {
        "service": service,
        "location": location,
        "urgency": urgency,
    }

    try:
        response = requests.post(
            f"{API_BASE_URL}/predict-price", json=payload, timeout=10
        )
        print(f"Service: {service} | Location: {location} | Urgency: {urgency}")
        print(f"Response Status: {response.status_code}")
        print(f"Prediction: {response.json()}")
        print("-" * 80)
    except requests.exceptions.RequestException as exc:
        print(f"Error: {exc}")
        print("-" * 80)


if __name__ == "__main__":
    test_cases = [
        ("Plumber", "Downtown", "Low"),
        ("Plumber", "Downtown", "High"),
        ("Electrician", "Suburbs", "Low"),
        ("Electrician", "Suburbs", "High"),
        ("Cleaner", "Downtown", "Low"),
        ("Cleaner", "Downtown", "High"),
        ("Doctor", "Suburbs", "Low"),
        ("Doctor", "Suburbs", "High"),
        ("AC Technician", "Downtown", "Low"),
        ("AC Technician", "Downtown", "High"),
        ("Carpenter", "Suburbs", "Low"),
        ("Pet Care", "Downtown", "High"),
    ]

    print("Testing Price Prediction API")
    print("=" * 80)

    for service, location, urgency in test_cases:
        test_price_prediction(service, location, urgency)
