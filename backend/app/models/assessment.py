from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class GradingResult(Base):
    __tablename__ = "grading_results"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("inspection_lots.id"), unique=True, nullable=False)
    
    sample_count = Column(Integer, nullable=False, default=40)
    
    # Primary Metrics required by Problem Statement (DoCA / SIH 26031)
    grade_a_percentage = Column(Float, nullable=False, default=0.0)
    urs_percentage = Column(Float, nullable=False, default=0.0)  # Under-Sized / Under-grade / Un-sound
    
    # Detailed Defect Breakdown
    fresh_pct = Column(Float, nullable=False, default=0.0)
    sprouted_pct = Column(Float, nullable=False, default=0.0)
    damaged_pct = Column(Float, nullable=False, default=0.0)
    rotten_pct = Column(Float, nullable=False, default=0.0)
    undersized_pct = Column(Float, nullable=False, default=0.0)

    # Statistical Quality Index & Credible Intervals (Stage B Estimator)
    lqi_score = Column(Float, nullable=False, default=0.0)
    lqi_lower_ci = Column(Float, nullable=False, default=0.0)
    lqi_upper_ci = Column(Float, nullable=False, default=0.0)
    
    # Market & Procurement Recommendation
    recommended_channel = Column(String, nullable=True, default="DoCA Procurement Center")
    
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lot = relationship("InspectionLot", back_populates="grading_result")
