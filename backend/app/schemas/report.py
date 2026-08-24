from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel


class DisputeCreateRequest(BaseModel):
    dispute_reason: str


class ReportResponse(BaseModel):
    id: int
    report_number: str
    lot_id: int
    report_hash: str
    summary: Dict[str, Any]
    is_disputed: bool
    dispute_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
