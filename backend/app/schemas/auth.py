from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.user import RoleEnum


class UserRegister(BaseModel):
    email: str
    name: str
    password: str
    role: RoleEnum = RoleEnum.INSPECTION_OFFICER
    organization: Optional[str] = "Department of Consumer Affairs"
    center_id: Optional[str] = "DOCA-PROC-01"


class UserLogin(BaseModel):
    email: str
    password: str



class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: RoleEnum
    organization: Optional[str] = None
    center_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
