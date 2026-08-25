from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
import os

from app.config.settings import settings
from app.db.database import engine, Base
from app.db.base import *  # Ensure all ORM models are registered
from app.api.v1.router import api_router

# Create database tables automatically on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-Powered E-Mandi Backend API — Onion Quality Assessment & Grading System "
        "for Department of Consumer Affairs (DoCA / SIH Problem Statement 26031). "
        "Provides image-processing classification, Grade A vs URS statistical estimation, "
        "instant digital quality reports, and Mandi price router recommendations."
    ),
    version=settings.app_version,
    docs_url=None,   # Custom handler below to avoid jsdelivr CDN SSL blocking
    redoc_url=None,  # Custom handler below
)

# Enable CORS for mobile apps and web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded static files if directory exists
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Mount API v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.css",
    )


@app.get("/redoc", include_in_schema=False)
async def custom_redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{app.title} - ReDoc",
        redoc_js_url="https://cdnjs.cloudflare.com/ajax/libs/redoc/2.1.3/redoc.standalone.js",
    )


@app.get("/")
@app.get("/api/v1")
@app.get("/api/v1/")
def root():
    return {
        "success": True,
        "message": "AI-Powered E-Mandi Onion Quality Assessment API v1 is active",
        "problem_statement": "SIH 26031 - Quality assessment & grading of onions",
        "version": settings.app_version,
        "docs_url": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "lots": "/api/v1/lots",
            "reports": "/api/v1/reports",
            "market": "/api/v1/market"
        }
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": settings.app_name,
    }