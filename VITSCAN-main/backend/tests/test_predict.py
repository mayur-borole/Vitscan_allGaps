from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.routes import prediction


class DummyService:
    def predict(self, image_bytes: bytes):
        del image_bytes

        class Result:
            label = "Vitamin A Deficiency"
            confidence = 0.91
            severity = "Moderate"

        return Result()


def create_test_image() -> bytes:
    image = Image.new("RGB", (32, 32), color=(255, 0, 0))
    buf = BytesIO()
    image.save(buf, format="PNG")
    return buf.getvalue()


def test_predict_success(monkeypatch) -> None:
    monkeypatch.setattr(prediction, "prediction_service", DummyService())

    client = TestClient(app)
    image = create_test_image()
    response = client.post("/predict", files={"file": ("test.png", image, "image/png")})

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["data"]["prediction"] == "Vitamin A Deficiency"


def test_predict_missing_file_rejected() -> None:
    client = TestClient(app)
    response = client.post("/predict")
    assert response.status_code == 422
