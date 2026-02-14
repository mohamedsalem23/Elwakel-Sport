from datetime import datetime, timedelta
from typing import Optional
import secrets
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import schemas, crud, models, database

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: models.User = Depends(get_current_active_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=400, detail="The user doesn't have enough privileges")
    return current_user

def generate_reset_token():
    return str(uuid.uuid4())

# Email Configuration (will be loaded from .env)
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from dotenv import load_dotenv
import os

# Load .env from the backend directory (same directory as this file)
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(_env_path)

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME") or "temp@example.com",
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD") or "temp_password",
    MAIL_FROM = os.getenv("MAIL_FROM") or "temp@example.com",
    MAIL_PORT = int(os.getenv("MAIL_PORT") or 587),
    MAIL_SERVER = os.getenv("MAIL_SERVER") or "smtp.gmail.com",
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME") or "Elwakel-Sport Support",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_reset_password_email(email: str, token: str):
    # Build reset link from FRONTEND_URL (production/Vercel) with a safe localhost fallback.
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    html = f"""
    <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في Elwakel-Sport.</p>
    <p>انقر على الرابط أدناه لإعادة التعيين:</p>
    <a href="{reset_link}">{reset_link}</a>
    <p>هذا الرابط سينتهي صلاحيته خلال 15 دقيقة.</p>
    <p>إذا لم تطلب هذا، يرجى تجاهل هذا البريد.</p>
    """

    message = MessageSchema(
        subject="إعادة تعيين كلمة المرور - Elwakel-Sport",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

# Google OAuth Configuration
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)
