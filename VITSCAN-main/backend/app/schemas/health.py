from pydantic import BaseModel


class HealthData(BaseModel):
    app: str
    version: str
    environment: str
    model_loaded: bool
    model_file_exists: bool
    model_path: str


class HealthResponse(BaseModel):
    status: str = "success"
    data: HealthData
