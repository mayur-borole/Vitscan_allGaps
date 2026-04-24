import logging

from fastapi import FastAPI, Request
from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.logging import configure_logging
from app.config.settings import get_settings
from app.routes.health import router as health_router
from app.routes.prediction import router as prediction_router
from ml.inference.predictor import Predictor

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    predictor = Predictor.instance()
    predictor.load()
    logger.info("Startup complete. Model loaded=%s", predictor.is_loaded)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"status": "error", "message": str(exc)})


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(status_code=exc.status_code, content={"status": "error", "message": message})


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception")
    return JSONResponse(status_code=500, content={"status": "error", "message": str(exc)})


# Primary neat API namespace used by frontend integration.
app.include_router(health_router, prefix="/api/v1")
app.include_router(prediction_router, prefix="/api/v1")

# Backward-compatible unversioned endpoints.
app.include_router(health_router)
app.include_router(prediction_router)
