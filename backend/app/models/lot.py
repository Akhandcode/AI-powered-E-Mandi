import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class LotStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ASSESSING = "ASSESSING"
    GRADED = "GRADED"
    DISPUTED = "DISPUTED"
    APPROVED = "APPROVED"


class InspectionLot(Base):
    __tablename__ = "inspection_lots"

    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String, unique=True, index=True, nullable=False)
    procurement_center = Column(String, nullable=False, default="Lasalgaon Procurement Center")
    commodity = Column(String, nullable=False, default="Onion")
    variety = Column(String, nullable=True, default="Red Onion (Kharif/Rabi)")
    total_weight_kg = Column(Float, nullable=False, default=1000.0)
    bag_count = Column(Integer, nullable=False, default=20)
    farmer_name = Column(String, nullable=True, default="Sample Farmer")
    status = Column(Enum(LotStatusEnum), default=LotStatusEnum.PENDING, nullable=False)
    
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by_user = relationship("User", back_populates="lots")
    images = relationship("LotImage", back_populates="lot", cascade="all, delete-orphan")
    grading_result = relationship("GradingResult", back_populates="lot", uselist=False, cascade="all, delete-orphan")
    reports = relationship("QualityReport", back_populates="lot", cascade="all, delete-orphan")


class LotImage(Base):
    __tablename__ = "lot_images"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("inspection_lots.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lot = relationship("InspectionLot", back_populates="images")
