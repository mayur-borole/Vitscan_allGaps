from fastapi import APIRouter

from app.config.settings import get_settings
from app.schemas.health import HealthData, HealthResponse
from ml.inference.predictor import Predictor

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    settings = get_settings()
    predictor = Predictor.instance()
    model_loaded = predictor.is_loaded
    return HealthResponse(
        data=HealthData(
            app=settings.app_name,
            version=settings.app_version,
            environment=settings.environment,
            model_loaded=model_loaded,
            model_file_exists=predictor.model_file_exists,
            model_path=str(settings.model_path),
        )
    )
