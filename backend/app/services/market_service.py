import sys
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.models.lot import InspectionLot
from app.models.assessment import GradingResult
from app.schemas.market import MarketRecommendationResponse, ChannelRecommendation


# Government Agmarknet & DoCA Commodity Pricing Parameters
COMMODITY_GOVT_PRICING = {
    "Onion": {
        "base_spot_price": 26.50,
        "forecast_7d_price": 29.80,
        "doca_buffer_price": 32.00,
        "processing_price": 18.00,
        "buffer_channel_name": "DoCA Buffer Procurement (NAFED/NCCF)",
        "processing_channel_name": "Onion Dehydration & Processing Industry",
    },
    "Tomato": {
        "base_spot_price": 22.00,
        "forecast_7d_price": 25.50,
        "doca_buffer_price": 28.00,
        "processing_price": 13.00,
        "buffer_channel_name": "Institutional / Direct FPO Procurement",
        "processing_channel_name": "Tomato Puree & Processing Industry",
    },
    "Potato": {
        "base_spot_price": 15.00,
        "forecast_7d_price": 16.80,
        "doca_buffer_price": 19.00,
        "processing_price": 10.50,
        "buffer_channel_name": "Govt Cold Chain / Institutional Buffer",
        "processing_channel_name": "Potato Starch & Chips Processing Industry",
    },
}


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

        commodity = lot.commodity or "Onion"
        price_cfg = COMMODITY_GOVT_PRICING.get(commodity, COMMODITY_GOVT_PRICING["Onion"])

        base_price_per_kg = price_cfg["base_spot_price"]
        forecast_7d_price_per_kg = price_cfg["forecast_7d_price"]
        trend = "UPWARD"
        action = "WAIT_7_DAYS" if grading.grade_a_percentage >= 65.0 else "SELL_IMMEDIATELY"

        grade_a_price = price_cfg["doca_buffer_price"]
        spot_price = price_cfg["base_spot_price"]
        proc_price = price_cfg["processing_price"]

        channels = [
            ChannelRecommendation(
                channel=price_cfg["buffer_channel_name"],
                recommended_pct=round(grading.grade_a_percentage, 1),
                expected_price_per_kg=grade_a_price,
                net_return_inr=round((lot.total_weight_kg * (grading.grade_a_percentage / 100)) * grade_a_price, 2),
                description=f"Government procurement for Grade A sound {commodity.lower()}s at MSP/DoCA benchmark."
            ),
            ChannelRecommendation(
                channel=f"APMC Mandi Spot Market ({lot.procurement_center or 'Local Mandi'})",
                recommended_pct=round(max(0, 100 - grading.grade_a_percentage - grading.rotten_pct), 1),
                expected_price_per_kg=spot_price,
                net_return_inr=round((lot.total_weight_kg * (max(0, 100 - grading.grade_a_percentage - grading.rotten_pct) / 100)) * spot_price, 2),
                description=f"Direct wholesale auction in local Mandi for standard wholesale {commodity.lower()}s."
            ),
            ChannelRecommendation(
                channel=price_cfg["processing_channel_name"],
                recommended_pct=round(grading.urs_percentage, 1),
                expected_price_per_kg=proc_price,
                net_return_inr=round((lot.total_weight_kg * (grading.urs_percentage / 100)) * proc_price, 2),
                description=f"Bulk channel for sprouted/blemished {commodity.lower()}s suited for processing."
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
