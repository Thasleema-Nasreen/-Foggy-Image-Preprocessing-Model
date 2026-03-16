import os
from typing import List

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # where model .pt files live
    MODELS_DIR: str = os.getenv("MODELS_DIR", os.path.join(os.getcwd(), "models"))

    # where output images are written
    FILES_DIR: str = os.getenv("FILES_DIR", os.path.join(os.getcwd(), "files"))

    # optional base (kept for compatibility)
    PUBLIC_BASE: str = os.getenv("PUBLIC_BASE", "/")

    # CORS
    CORS_ALLOW_ORIGINS: List[str] = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

settings = Settings()
