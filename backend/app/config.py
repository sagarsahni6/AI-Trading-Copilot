"""
Application Configuration — Pydantic Settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # NVIDIA NIM
    NIM_API_KEY: str = "nvapi-your-key-here"
    NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NIM_MODEL: str = "meta/llama-3.3-70b-instruct"

    # Kite Connect
    KITE_API_KEY: str = ""
    KITE_API_SECRET: str = ""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://trading:trading@localhost:5432/trading_copilot"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET: str = "change-this-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: list[str] = ["chrome-extension://*", "http://localhost:*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
