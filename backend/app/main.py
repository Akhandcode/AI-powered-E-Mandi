from fastapi import FastAPI

from app.config.settings import settings


app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered agricultural quality grading, "
        "lot estimation, price forecasting and "
        "channel recommendation system."
    ),
    version=settings.app_version,
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI E-Mandi Backend API is running",
        "version": settings.app_version,
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": settings.app_name,
    }