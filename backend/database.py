from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.engine.url import make_url
import os
from dotenv import load_dotenv

load_dotenv()

_URL_CANDIDATES = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "NEON_DATABASE_URL",
]

# Prefer a production Postgres URL if present (Neon/Vercel integrations can use different names).
# If not present, fallback to local sqlite database.
DATABASE_URL = None
DATABASE_URL_SOURCE = None
for k in _URL_CANDIDATES:
    v = os.getenv(k)
    if v:
        DATABASE_URL = v
        DATABASE_URL_SOURCE = k
        break

if DATABASE_URL:
    # Handle "postgres://" vs "postgresql://" standard for SQLAlchemy
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # PostgreSQL connection (Production)
    try:
        safe_url = make_url(DATABASE_URL).render_as_string(hide_password=True)
    except Exception:
        safe_url = "<unparseable DATABASE_URL>"
    print(f"DEBUG: Using PostgreSQL Connection ({DATABASE_URL_SOURCE}): {safe_url}")
    engine = create_engine(DATABASE_URL)
else:
    # SQLite connection (Local Development)
    print("DEBUG: Using SQLite Connection (Fallback)")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, "elwakel.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
