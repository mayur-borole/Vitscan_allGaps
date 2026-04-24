from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "VitaScanAI ML Backend"
    app_version: str = "1.0.0"
    environment: str = "development"

    model_path: Path = BASE_DIR / "saved_models" / "vitascan_model.pth"
    model_architecture: str = "resnet18"
    class_names: str = "vitamin_a,vitamin_b,vitamin_c,vitamin_d,vitamin_e,vitamin_k,minerals,protein"

    image_size: int = 224
    normalize_mean: str = "0.485,0.456,0.406"
    normalize_std: str = "0.229,0.224,0.225"

    max_upload_bytes: int = 5 * 1024 * 1024
    allowed_extensions: str = "jpg,jpeg,png,webp"

    history_limit: int = 500

    log_level: str = "INFO"
    log_file: Path = BASE_DIR / "logs" / "backend.log"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def class_name_list(self) -> list[str]:
        return [item.strip() for item in self.class_names.split(",") if item.strip()]

    @property
    def allowed_extension_set(self) -> set[str]:
        return {item.strip().lower() for item in self.allowed_extensions.split(",") if item.strip()}

    @property
    def mean(self) -> tuple[float, float, float]:
        values = [float(item.strip()) for item in self.normalize_mean.split(",")]
        if len(values) != 3:
            raise ValueError("normalize_mean must contain 3 comma-separated float values")
        return values[0], values[1], values[2]

    @property
    def std(self) -> tuple[float, float, float]:
        values = [float(item.strip()) for item in self.normalize_std.split(",")]
        if len(values) != 3:
            raise ValueError("normalize_std must contain 3 comma-separated float values")
        return values[0], values[1], values[2]


@lru_cache
def get_settings() -> Settings:
    return Settings()
