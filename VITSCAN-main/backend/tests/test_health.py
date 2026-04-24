from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_status() -> None:
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert "model_loaded" in payload["data"]
