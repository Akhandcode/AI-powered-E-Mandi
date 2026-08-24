import sys
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from router import route_lot, LotQuality
    HAS_ROUTER = True
except ImportError:
    HAS_ROUTER = False

from app.models.lot import InspectionLot
from app.models.assessment import GradingResult
from app.schemas.market import MarketRecommendationResponse, ChannelRecommendation


class MarketService:

    @classmethod
    def get_market_recommendations(cls, db: Session, lot_id: int) -> MarketRecommendationResponse:
        lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")

        grading = db.query(GradingResult).filter(GradingResult.lot_id == lot_id).first()
        if not grading:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lot has not been graded yet. Run AI assessment first."
            )

        # Base Mandi benchmark price for onions (INR per kg)
        base_price_per_kg = 28.50
        forecast_7d_price_per_kg = 31.20
        trend = "UPWARD"
        action = "WAIT_7_DAYS" if grading.grade_a_percentage >= 65.0 else "SELL_IMMEDIATELY"

        channels = [
            ChannelRecommendation(
                channel="DoCA Buffer Procurement (NAFED/NCCF)",
                recommended_pct=round(grading.grade_a_percentage, 1),
                expected_price_per_kg=32.00,
                net_return_inr=round((lot.total_weight_kg * (grading.grade_a_percentage / 100)) * 32.00, 2),
                description="Government procurement for Grade A sound onions at MSP benchmark."
            ),
            ChannelRecommendation(
                channel="APMC Mandi Spot Market",
                recommended_pct=round(max(0, 100 - grading.grade_a_percentage - grading.rotten_pct), 1),
                expected_price_per_kg=26.50,
                net_return_inr=round((lot.total_weight_kg * (max(0, 100 - grading.grade_a_percentage - grading.rotten_pct) / 100)) * 26.50, 2),
                description="Direct wholesale sale in local Mandi for Grade B/C onions."
            ),
            ChannelRecommendation(
                channel="Onion Dehydration & Processing Industry",
                recommended_pct=round(grading.urs_percentage, 1),
                expected_price_per_kg=18.00,
                net_return_inr=round((lot.total_weight_kg * (grading.urs_percentage / 100)) * 18.00, 2),
                description="Bulk channel for sprouted/undersized onions suited for powder & paste."
            )
        ]

        return MarketRecommendationResponse(
            lot_id=lot.id,
            commodity=lot.commodity,
            grade_a_pct=grading.grade_a_percentage,
            urs_pct=grading.urs_percentage,
            lqi_score=grading.lqi_score,
            current_mandi_price_per_kg=base_price_per_kg,
            forecasted_7day_price_per_kg=forecast_7d_price_per_kg,
            price_trend=trend,
            optimal_action=action,
            channel_recommendations=channels
        )
