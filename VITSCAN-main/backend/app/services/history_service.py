from collections import deque
from datetime import datetime
from threading import Lock
from uuid import uuid4

from app.schemas.prediction import PredictionRecord


class HistoryService:
    def __init__(self, limit: int = 500) -> None:
        self._records: deque[PredictionRecord] = deque(maxlen=limit)
        self._lock = Lock()

    def add(self, filename: str, prediction: str, confidence: float, severity: str) -> PredictionRecord:
        record = PredictionRecord(
            id=str(uuid4()),
            filename=filename,
            created_at=datetime.utcnow(),
            prediction=prediction,
            confidence=confidence,
            severity=severity,
        )
        with self._lock:
            self._records.appendleft(record)
        return record

    def list(self) -> list[PredictionRecord]:
        with self._lock:
            return list(self._records)
