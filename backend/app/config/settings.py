from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Powered E-Mandi API"
    app_version: str = "1.0.0"
    debug: bool = True

    database_url: str = "sqlite:///./emandI.db"

    jwt_secret: str = "e_mandi_super_secret_jwt_key_2026_doca"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()