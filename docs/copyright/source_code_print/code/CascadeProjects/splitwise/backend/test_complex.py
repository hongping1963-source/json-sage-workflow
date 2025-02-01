import requests
import json

test_json = {
    "json": {
        "users": [
            {
                "id": 1,
                "name": "John Doe",
                "preferences": {
                    "theme": "dark",
                    "notifications": True
                }
            },
            {
                "id": 2,
                "name": "Jane Smith",
                "preferences": {
                    "theme": "light",
                    "notifications": False
                }
            }
        ],
        "settings": {
            "global": {
                "language": "en",
                "timezone": "UTC"
            },
            "features": ["chat", "share", "export"]
        }
    }
}

response = requests.post('http://localhost:5000/api/analyze', json=test_json)
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))
