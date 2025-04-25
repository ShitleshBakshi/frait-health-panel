import enum
from pathlib import Path
from tempfile import gettempdir
from typing import Optional, List

from pydantic_settings import BaseSettings, SettingsConfigDict
from yarl import URL

TEMP_DIR = Path(gettempdir())


class LogLevel(str, enum.Enum):
    """Possible log levels."""

    NOTSET = "NOTSET"
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    FATAL = "FATAL"


class Settings(BaseSettings):
    """
    Application settings.

    These parameters can be configured
    with environment variables.
    """

    host: str = "127.0.0.1"
    port: int = 8000
    # quantity of workers for uvicorn
    workers_count: int = 1
    # Enable uvicorn reloading
    reload: bool = False

    # CORS Settings
    cors_allow_origins: list[str] = ["*"]

    # Current environment
    environment: str = "dev"

    log_level: LogLevel = LogLevel.INFO

    # JWT settings
    jwt_secret_key: str = "your_secret_key_here"  # Change in production
    jwt_algorithm: str = "HS256"
    jwt_token_expire_minutes: int = 60 * 24  # 24 hours
    
    # Azure AD / MSAL settings
    azure_tenant_id: str = ""  # Azure AD tenant ID
    azure_client_id: str = ""  # Azure AD client ID (application ID)
    azure_client_secret: str = ""  # Azure AD client secret
    azure_redirect_uri: str = "http://localhost:8000/api/auth/msal/callback"  # Redirect URI after authentication
    azure_authority: str = ""  # Will be constructed from tenant_id if not provided
    azure_scopes: List[str] = ["User.Read"]  # Default scopes to request
    azure_validate_authority: bool = True  # Whether to validate the authority
    
    # If true, automatically create users that don't exist in the database
    auto_provision_users: bool = True
    
    # Default role for new users provisioned from Azure AD
    default_user_role: str = "Health Visitor"

    # Variables for the database
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "frait_health_backend"
    db_pass: str = "frait_health_backend"
    db_base: str = "frait_health_backend"
    db_echo: bool = False

    # Variables for Redis
    redis_host: str = "frait_health_backend-redis"
    redis_port: int = 6379
    redis_user: Optional[str] = None
    redis_pass: Optional[str] = None
    redis_base: Optional[int] = None
    
    @property
    def azure_authority_url(self) -> str:
        """
        Get the Azure AD authority URL.
        
        :return: Authority URL constructed from tenant ID if not explicitly provided
        """
        if self.azure_authority:
            return self.azure_authority
        return f"https://login.microsoftonline.com/{self.azure_tenant_id}"

    @property
    def db_url(self) -> URL:
        """
        Assemble database URL from settings.

        :return: database URL.
        """
        return URL.build(
            scheme="postgresql+asyncpg",
            host=self.db_host,
            port=self.db_port,
            user=self.db_user,
            password=self.db_pass,
            path=f"/{self.db_base}",
        )

    @property
    def redis_url(self) -> URL:
        """
        Assemble REDIS URL from settings.

        :return: redis URL.
        """
        path = ""
        if self.redis_base is not None:
            path = f"/{self.redis_base}"
        return URL.build(
            scheme="redis",
            host=self.redis_host,
            port=self.redis_port,
            user=self.redis_user,
            password=self.redis_pass,
            path=path,
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="FRAIT_HEALTH_BACKEND_",
        env_file_encoding="utf-8",
    )


settings = Settings()






