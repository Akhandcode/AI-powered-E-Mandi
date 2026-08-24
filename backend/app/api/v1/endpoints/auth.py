from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.services.auth_service import create_user, authenticate_user, get_current_user
from app.utils.security import create_access_token
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (Inspection Officer, Farmer, Procurement Officer, Admin)."""
    return create_user(db, user_in)


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Login with JSON payload."""
    user = authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": user.email, "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.from_orm(user))


@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password flow compatible login endpoint."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": user.email, "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.from_orm(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of logged-in user."""
    return current_user
