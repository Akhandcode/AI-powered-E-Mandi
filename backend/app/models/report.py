from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class QualityReport(Base):
    __tablename__ = "quality_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String, unique=True, index=True, nullable=False)
    lot_id = Column(Integer, ForeignKey("inspection_lots.id"), nullable=False)
    
    report_hash = Column(String, nullable=False, index=True)  # SHA-256 digital signature
    summary_json = Column(Text, nullable=False)  # Serialized instant report payload
    
    is_disputed = Column(Boolean, default=False)
    dispute_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lot = relationship("InspectionLot", back_populates="reports")
