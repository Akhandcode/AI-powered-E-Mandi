from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ChannelRecommendation(BaseModel):
    channel: str
    recommended_pct: float
    expected_price_per_kg: float
    net_return_inr: float
    description: str


class MarketRecommendationResponse(BaseModel):
    lot_id: int
    commodity: str
    grade_a_pct: float
    urs_pct: float
    lqi_score: float
    current_mandi_price_per_kg: float
    forecasted_7day_price_per_kg: float
    price_trend: str  # "UPWARD", "STABLE", "DOWNWARD"
    optimal_action: str  # "SELL_IMMEDIATELY", "WAIT_7_DAYS", "SPLIT_CHANNELS"
    channel_recommendations: List[ChannelRecommendation]
