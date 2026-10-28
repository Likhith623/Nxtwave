from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
# SQLAlchemy 2.0 requires postgresql:// instead of postgres://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure connection args
connect_args = {}
pool_kwargs = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Postgres configuration (e.g. Supabase connection pooler)
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 300
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,
    future=True,
    **pool_kwargs
)

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
