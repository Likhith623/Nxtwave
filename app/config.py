import os
from pathlib import Path
from typing import Optional

# Base directory of the repository
BASE_DIR = Path(__file__).resolve().parent.parent

def load_dotenv(env_path: Path):
    """Simple zero-dependency .env parser."""
    if not env_path.exists():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

# Load .env if present
load_dotenv(BASE_DIR / ".env")

class Settings:
    """Application Settings for Project Compass."""
    APP_NAME: str = "Project Compass"
    APP_TAGLINE: str = "Choose. Test. Prove."
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./local_compass.db")

    # Security
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "compass_growth_admin_secret_2026")

    # Workshop Destination:
    # If empty, runs in Mode B (Local Demonstration Mode)
    # If set, runs in Mode A (External NxtWave Workshop Page)
    WORKSHOP_REGISTRATION_URL: str = os.getenv("WORKSHOP_REGISTRATION_URL", "").strip()

    # Optional AI Integration (Zero cost default is False)
    ENABLE_OPTIONAL_LLM: bool = os.getenv("ENABLE_OPTIONAL_LLM", "False").lower() in ("true", "1", "yes")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").strip().lower()
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "").strip() or None
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()

    # WhatsApp Integration (Dry-run by default)
    WHATSAPP_DRY_RUN: bool = os.getenv("WHATSAPP_DRY_RUN", "True").lower() in ("true", "1", "yes")
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "compass_whatsapp_webhook_token_2026")
    WHATSAPP_ACCESS_TOKEN: Optional[str] = os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip() or None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip() or None

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def has_external_workshop(self) -> bool:
        return bool(self.WORKSHOP_REGISTRATION_URL and self.WORKSHOP_REGISTRATION_URL.startswith("http"))

settings = Settings()
