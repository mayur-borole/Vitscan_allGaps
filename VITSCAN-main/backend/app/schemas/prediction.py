from datetime import datetime

from pydantic import BaseModel, Field


class PredictionData(BaseModel):
    prediction: str
    confidence: float = Field(ge=0.0, le=1.0)
    severity: str


class PredictionRecord(PredictionData):
    id: str
    created_at: datetime
    filename: str


class PredictionSuccessResponse(BaseModel):
    status: str = "success"
    data: PredictionData


class HistorySuccessResponse(BaseModel):
    status: str = "success"
    data: list[PredictionRecord]
