import logging
from dataclasses import dataclass

from app.models.label_mapping import to_display_label
from app.services.severity_service import confidence_to_severity
from ml.inference.predictor import Predictor


logger = logging.getLogger(__name__)


@dataclass
class PredictionResult:
    label: str
    confidence: float
    severity: str


class PredictionService:
    def __init__(self, predictor: Predictor) -> None:
        self.predictor = predictor

    def predict(self, image_bytes: bytes) -> PredictionResult:
        raw_label, confidence = self.predictor.predict(image_bytes)
        display_label = to_display_label(raw_label)
        severity = confidence_to_severity(confidence)
        logger.info("Prediction completed: label=%s confidence=%.4f", raw_label, confidence)
        return PredictionResult(label=display_label, confidence=confidence, severity=severity)
