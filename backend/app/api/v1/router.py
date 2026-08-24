from fastapi import APIRouter

from app.api.v1.endpoints import auth, lots, assessment, reports, market

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Profile"])
api_router.include_router(lots.router, prefix="/lots", tags=["Inspection Lots & Uploads"])
api_router.include_router(assessment.router, tags=["AI Onion Quality Assessment"])
api_router.include_router(reports.router, tags=["Instant Digital Quality Reports & Disputes"])
api_router.include_router(market.router, tags=["Mandi Price & Channel Recommendations"])
