from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL
# SQLAlchemy 2.0 requires postgresql:// instead of postgres://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure connection args
connect_args = {}
pool_kwargs = {}
_is_sqlite = db_url.startswith("sqlite")

if _is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    # Postgres / Supabase pooler configuration
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,
    future=True,
    **pool_kwargs
)

# ── SQLite: Enable WAL mode + synchronous=NORMAL for reliable multi-process access ──
# WAL (Write-Ahead Logging) ensures that a commit from one connection is immediately
# visible to all other connections reading the same file — even under --reload.
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        # WAL mode: allows concurrent reads while write is in progress
        cursor.execute("PRAGMA journal_mode=WAL;")
        # synchronous=NORMAL: durable enough for development, no fsync on every commit
        cursor.execute("PRAGMA synchronous=NORMAL;")
        # Prevent "database is locked" on concurrent requests
        cursor.execute("PRAGMA busy_timeout=5000;")
        # Cache size: 64 MB for fast repeated reads
        cursor.execute("PRAGMA cache_size=-65536;")
        cursor.close()
        logger.debug("[DB] SQLite WAL pragmas applied to new connection.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    import app.models  # Ensure models are registered
    Base.metadata.create_all(bind=engine)
    logger.info("[DB] Database tables verified / created.")

