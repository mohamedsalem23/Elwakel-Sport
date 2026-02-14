from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import text
from backend import models, database, crud
from backend.routers import auth, bookings, admin, events, tournaments

# Create tables
models.Base.metadata.create_all(bind=database.engine)

def migrate_site_settings():
    with database.engine.connect() as conn:
        cols = conn.execute(text("PRAGMA table_info(site_settings)")).fetchall()
        col_names = {row[1] for row in cols}
        if "show_tournaments_page" not in col_names:
            conn.execute(text("ALTER TABLE site_settings ADD COLUMN show_tournaments_page BOOLEAN DEFAULT 0 NOT NULL"))
            conn.commit()

migrate_site_settings()

# Create default admin user
def create_default_admin():
    db = database.SessionLocal()
    try:
        admin_user = crud.get_user_by_username(db, username="admin")
        if not admin_user:
            admin_data = {"username": "admin", "email": "admin@elwakel-sport.com", "password": "Admin@123", "phone_number": None}
            from backend.schemas import UserCreate
            admin_obj = UserCreate(**admin_data)
            admin_user = crud.create_user(db, admin_obj)
            admin_user.is_admin = True
            db.commit()
            print("✅ Default Admin User Created: username='admin', password='Admin@123'")
        else:
            # Always ensure admin has correct privileges and reset password on startup
            admin_user.hashed_password = crud.get_password_hash("Admin@123")
            admin_user.is_admin = True
            db.commit()
            print("✅ Default Admin User Verified/Updated: username='admin', password='Admin@123'")
    finally:
        db.close()

create_default_admin()

app = FastAPI(title="ELWAKEL-SPORT Booking System")

import os

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Session Middleware for OAuth
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "some-very-secret-key-for-oauth"))

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
