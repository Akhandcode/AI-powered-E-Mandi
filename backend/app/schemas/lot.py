from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.lot import LotStatusEnum


class LotCreate(BaseModel):
    procurement_center: str = "Lasalgaon Procurement Center"
    commodity: str = "Onion"
    variety: Optional[str] = "Red Onion (Rabi)"
    total_weight_kg: float = 1000.0
    bag_count: int = 20
    farmer_name: Optional[str] = "Ramesh Patil"


class LotImageResponse(BaseModel):
    id: int
    lot_id: int
    file_name: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class LotResponse(BaseModel):
    id: int
    lot_number: str
    procurement_center: str
    commodity: str
    variety: Optional[str] = None
    total_weight_kg: float
    bag_count: int
    farmer_name: Optional[str] = None
    status: LotStatusEnum
    created_at: datetime
    images: List[LotImageResponse] = []

    class Config:
        from_attributes = True
