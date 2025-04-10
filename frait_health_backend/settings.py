import enum
from pathlib import Path
from tempfile import gettempdir
from typing import Optional

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
    cors_allow_origins: list[str] = ["http://localhost:3000", "https://dev.efrait.com:9443"]

    # Current environment
    environment: str = "dev"

    log_level: LogLevel = LogLevel.INFO

    # LDAP Authentication settings
    ldap_auth_enabled: bool = True

    # LDAP Settings
    ldap_server_url: str = "ldap://34.229.200.54"
    ldap_domain: str = "FRAITHEALTH"
    ldap_search_base: str = "DC=fraithealth,DC=local"
    ldap_groups_base: str = "CN=Users,DC=fraithealth,DC=local"
    ldap_service_account: str = "service_user@fraithealth.local"  # or "FRAITHEALTH\\service_user"
    ldap_service_password: str = "service_account_password"

    # LDAP Role Mappings - maps UserRole to LDAP group names
    ldap_role_groups: dict[str, str] = {
        "Admin": "Admins",
        "Manager": "Managers",
        "Health Visitor": "HealthVisitors",
        "Assistant Health Visitor": "AssistantHealthVisitors",
    }

    # Windows Authentication Settings
    windows_auth_enabled: bool = False
    windows_auth_provider: str = "windows_ad"

    # JWT settings
    jwt_secret_key: str = "your_secret_key_here"  # Change in production
    jwt_algorithm: str = "HS256"
    jwt_token_expire_minutes: int = 60 * 24  # 24 hours

    @property
    def get_ldap_group_dn(self, group_name: str) -> str:
        """
        Get the full Distinguished Name (DN) for a LDAP group.

        :param group_name: Name of the group
        :return: Full DN path for the group
        """
        return f"CN={group_name},{self.ldap_groups_base}"

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
