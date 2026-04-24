from __future__ import annotations

import logging
from pathlib import Path
from threading import Lock

import torch
from torchvision import models

from app.config.settings import get_settings
from ml.preprocessing.transforms import build_eval_transforms, load_and_transform

logger = logging.getLogger(__name__)


class ModelUnavailableError(RuntimeError):
    """Raised when inference is requested before a trained model is available."""


class Predictor:
    _instance: Predictor | None = None
    _instance_lock = Lock()

    def __init__(self) -> None:
        settings = get_settings()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.class_names = settings.class_name_list
        self.transform = build_eval_transforms(settings.image_size, settings.mean, settings.std)
        self.model = self._build_model(settings.model_architecture, len(self.class_names))
        self.model_path = settings.model_path
        self.is_loaded = False
        self._load_lock = Lock()

    @classmethod
    def instance(cls) -> Predictor:
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def _build_model(self, architecture: str, num_classes: int) -> torch.nn.Module:
        if architecture == "mobilenet_v3_small":
            model = models.mobilenet_v3_small(weights=None)
            model.classifier[-1] = torch.nn.Linear(model.classifier[-1].in_features, num_classes)
            return model

        model = models.resnet18(weights=None)
        model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
        return model

    def load(self, force: bool = False) -> None:
        with self._load_lock:
            if self.is_loaded and not force:
                return

            if not Path(self.model_path).exists():
                logger.warning("Model file not found at %s. Predictor will remain unavailable.", self.model_path)
                self.is_loaded = False
                return

            state = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(state)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info("Model loaded from %s", self.model_path)

    @property
    def model_file_exists(self) -> bool:
        return Path(self.model_path).exists()

    def predict(self, image_bytes: bytes) -> tuple[str, float]:
        if not self.is_loaded:
            self.load()
        if not self.is_loaded:
            raise ModelUnavailableError("Model is not available. Train and save model first.")

        tensor = load_and_transform(image_bytes, self.transform).to(self.device)
        with torch.inference_mode():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
            confidence, index = torch.max(probs, dim=0)

        label = self.class_names[index.item()]
        return label, float(confidence.item())
