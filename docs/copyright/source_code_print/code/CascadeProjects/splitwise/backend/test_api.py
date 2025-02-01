import requests
import json

test_json = {
    "json": {
        "name": "JsonSage",
        "version": "1.0",
        "features": ["analysis", "insights"],
        "config": {
            "language": "en",
            "mode": "auto"
        }
    }
}

response = requests.post('http://localhost:5000/api/analyze', json=test_json)
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
