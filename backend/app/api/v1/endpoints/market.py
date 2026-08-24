from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.market import MarketRecommendationResponse
from app.services.market_service import MarketService
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/lots/{lot_id}/market-recommendation", response_model=MarketRecommendationResponse)
def get_market_recommendation(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get market price forecast & optimal buyer channel recommendations for an assessed onion lot."""
    return MarketService.get_market_recommendations(db, lot_id)
