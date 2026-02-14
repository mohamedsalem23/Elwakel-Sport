from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text

# Vercel often deploys `backend/` as the project root (so imports are local like `import models`).
# Local dev can also run as a package (so imports are `from backend import ...`).
try:
    from backend import models, database, crud  # type: ignore
    from backend.routers import auth, bookings, admin, events, tournaments  # type: ignore
except ModuleNotFoundError:
    import models, database, crud  # type: ignore
    from routers import auth, bookings, admin, events, tournaments  # type: ignore

from contextlib import asynccontextmanager

def init_app():
    """Initialize DB schema and seed required data.

    Some serverless runtimes can be finicky about lifespan hooks; we call this from both
    the lifespan context manager and a startup event to ensure it runs.
    """
    try:
        print("DEBUG: Initializing application...")
        models.Base.metadata.create_all(bind=database.engine)
        print("DEBUG: Tables created/verified.")
        migrate_site_settings()
        create_default_admin()
        print("DEBUG: Initialization completed.")
    except Exception as e:
        print(f"Startup Error: {e}")

def migrate_site_settings():
    try:
        with database.engine.connect() as conn:
            cols = conn.execute(text("PRAGMA table_info(site_settings)")).fetchall()
            col_names = {row[1] for row in cols}
            if "show_tournaments_page" not in col_names:
                conn.execute(text("ALTER TABLE site_settings ADD COLUMN show_tournaments_page BOOLEAN DEFAULT 0 NOT NULL"))
                conn.commit()
    except Exception as e:
        print(f"Migration Warning: {e}")

def create_default_admin():
    try:
        db = database.SessionLocal()
        try:
            admin_user = crud.get_user_by_username(db, username="admin")
            if not admin_user:
                admin_data = {"username": "admin", "email": "admin@elwakel-sport.com", "password": "Admin@123", "phone_number": None}
                try:
                    from backend.schemas import UserCreate  # type: ignore
                except ModuleNotFoundError:
                    from schemas import UserCreate  # type: ignore
                admin_obj = UserCreate(**admin_data)
                admin_user = crud.create_user(db, admin_obj)
                admin_user.is_admin = True
                db.commit()
                print("✅ Default Admin User Created")
            else:
                admin_user.hashed_password = crud.get_password_hash("Admin@123")
                admin_user.is_admin = True
                db.commit()
                print("✅ Admin User Verified")
        finally:
            db.close()
    except Exception as e:
        print(f"Admin Creation Warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("DEBUG: Starting application lifespan...")
    init_app()
    yield
    # Shutdown
    pass

app = FastAPI(title="ELWAKEL-SPORT Booking System", lifespan=lifespan)

import os

@app.on_event("startup")
def on_startup():
    # Extra safety for runtimes that don't reliably run lifespan.
    init_app()

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.100.77:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url)
    if frontend_url.endswith("/"):
        ALLOWED_ORIGINS.append(frontend_url[:-1])

# Trust Vercel/Proxy Headers for HTTPS
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Session Middleware for OAuth
cookie_secure = os.getenv("COOKIE_SECURE")
https_only = (os.getenv("VERCEL") is not None) if cookie_secure is None else (cookie_secure == "1")
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "some-very-secret-key-for-oauth"),
    https_only=https_only,
    same_site="lax",
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin")
    print(f"DEBUG: Incoming {request.method} request from Origin: {origin} to {request.url.path}")
    response = await call_next(request)
    return response

app.include_router(auth.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(events.router)
app.include_router(tournaments.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ELWAKEL-SPORT API"}
