import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config.settings import get_settings
from app.schemas.prediction import HistorySuccessResponse, PredictionData, PredictionSuccessResponse
from app.services.history_service import HistoryService
from app.services.prediction_service import PredictionService
from ml.inference.predictor import ModelUnavailableError, Predictor

logger = logging.getLogger(__name__)
router = APIRouter(tags=["prediction"])
settings = get_settings()
history_service = HistoryService(limit=settings.history_limit)
prediction_service = PredictionService(Predictor.instance())


@router.post("/predict", response_model=PredictionSuccessResponse)
async def predict(file: UploadFile = File(...)) -> PredictionSuccessResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")

    extension = Path(file.filename).suffix.lower().lstrip(".")
    if extension not in settings.allowed_extension_set:
        raise HTTPException(status_code=400, detail="Invalid input image format")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    if len(image_bytes) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="File is too large")

    try:
        result = prediction_service.predict(image_bytes)
    except ModelUnavailableError as exc:
        logger.warning("Prediction requested without a trained model: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=(
                f"Model not loaded. Train and save model to '{settings.model_path}', "
                "then restart backend."
            ),
        ) from exc
    except ValueError as exc:
        logger.exception("Prediction validation error")
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.exception("Model inference failed")
        raise HTTPException(status_code=500, detail="Model inference failed") from exc

    history_service.add(
        filename=file.filename,
        prediction=result.label,
        confidence=result.confidence,
        severity=result.severity,
    )

    return PredictionSuccessResponse(
        data=PredictionData(
            prediction=result.label,
            confidence=round(result.confidence, 4),
            severity=result.severity,
        )
    )


@router.get("/history", response_model=HistorySuccessResponse)
def history() -> HistorySuccessResponse:
    return HistorySuccessResponse(data=history_service.list())
