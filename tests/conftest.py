import pytest
from app.database import init_db, SessionLocal
from app.analytics import seed_sample_growth_data

@pytest.fixture(autouse=True)
def setup_test_db():
    """Ensure database tables and baseline demo records exist before running tests."""
    init_db()
    db = SessionLocal()
    try:
        seed_sample_growth_data(db)
    finally:
        db.close()
    yield

