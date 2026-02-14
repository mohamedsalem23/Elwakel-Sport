from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import crud, models, schemas, auth, database

router = APIRouter(
    tags=["authentication"]
)

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    print(f"DEBUG: Login attempt for user: {form_data.username}")
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user:
        user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        print(f"DEBUG: User {form_data.username} not found")
    else:
        print(f"DEBUG: User found. Verifying password...")
        
    if not user or not auth.pwd_context.verify(form_data.password, user.hashed_password):
        print(f"DEBUG: Authentication failed for {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"DEBUG: Authentication successful for {form_data.username}")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if not user.phone_number or not user.phone_number.strip():
        raise HTTPException(status_code=400, detail="Phone number is required")
    if not user.password or len(user.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user_username = crud.get_user_by_username(db, username=user.username)
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    return crud.create_user(db=db, user=user)

@router.post("/users/complete-google-profile", response_model=schemas.User)
def complete_google_profile(
    request: schemas.CompleteGoogleProfileRequest,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if not request.phone_number or not request.phone_number.strip():
        raise HTTPException(status_code=400, detail="Phone number is required")
    if not request.password or len(request.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    return crud.update_user_phone_and_password(
        db=db,
        user=current_user,
        phone_number=request.phone_number.strip(),
        new_password=request.password.strip(),
    )

@router.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        # We return 200 even if user not found to prevent email enumeration
        return {"message": "If this email is registered, you will receive a reset link."}
    
    token = auth.generate_reset_token()
    expires = auth.datetime.utcnow() + auth.timedelta(minutes=15)
    crud.update_user_reset_token(db, user, token, expires)
    
    try:
        await auth.send_reset_password_email(user.email, token)
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Error sending email")
        
    return {"message": "If this email is registered, you will receive a reset link."}

@router.post("/reset-password")
async def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_reset_token(db, token=request.token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    crud.update_user_password(db, user, request.new_password)
    return {"message": "Password updated successfully"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await auth.oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(database.get_db)):
    try:
        token = await auth.oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Google authentication failed")
    
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")
    
    email = user_info.get('email')
    username = user_info.get('name') or email.split('@')[0]
    
    user = crud.get_user_by_email(db, email=email)
    if not user:
        # Create user if it doesn't exist
        # We need a random password since it's required in some schemas or logic
        random_password = auth.generate_reset_token()
        user_create = schemas.UserCreate(
            username=username,
            email=email,
            password=random_password,
            phone_number=None
        )
        user = crud.create_user(db, user_create)
    
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Redirect to frontend with token (or handle as preferred)
    # For simplicity, returning the token, but usually you redirect to a frontend callback page
    from fastapi.responses import RedirectResponse
    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    if frontend_url.endswith("/"):
        frontend_url = frontend_url[:-1]
    
    login_url = f"{frontend_url}/login"

    if not user.phone_number:
        signup_url = login_url.replace("/login", "/signup")
        return RedirectResponse(url=f"{signup_url}?token={access_token}&google_setup=1")

    return RedirectResponse(url=f"{login_url}?token={access_token}")
