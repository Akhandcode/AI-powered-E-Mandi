import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship

from app.db.database import Base


class RoleEnum(str, enum.Enum):
    FARMER = "FARMER"
    INSPECTION_OFFICER = "INSPECTION_OFFICER"
    PROCUREMENT_MANAGER = "PROCUREMENT_MANAGER"
    BUYER = "BUYER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.INSPECTION_OFFICER, nullable=False)
    organization = Column(String, nullable=True, default="Department of Consumer Affairs")
    center_id = Column(String, nullable=True, default="DOCA-PROC-01")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lots = relationship("InspectionLot", back_populates="created_by_user")
