from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel


class AssessmentRunRequest(BaseModel):
    sample_size: int = 40
    use_debias: bool = True


class GradingResultResponse(BaseModel):
    id: int
    lot_id: int
    sample_count: int
    
    # Primary Metrics required by Problem Statement ID 26031
    grade_a_percentage: float
    urs_percentage: float
    
    # Defect Breakdown Proportions (%)
    fresh_pct: float
    sprouted_pct: float
    damaged_pct: float
    rotten_pct: float
    undersized_pct: float

    # Statistical Quality Index & Credible Intervals
    lqi_score: float
    lqi_lower_ci: float
    lqi_upper_ci: float
    
    recommended_channel: str
    evaluated_at: datetime

    class Config:
        from_attributes = True
