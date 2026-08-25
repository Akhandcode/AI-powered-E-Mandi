import sys
import os
import uvicorn
from pathlib import Path

# Add backend directory to python path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Add root directory to python path for ML modules (grader, estimator, forecast, router)
ROOT_DIR = BACKEND_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if __name__ == "__main__":
    print("=" * 60)
    print("STARTING AI-POWERED E-MANDI FASTAPI BACKEND SERVER")
    print("  * API Base URL: http://localhost:8000/api/v1")
    print("  * Interactive Swagger Docs: http://localhost:8000/docs")
    print("  * AI Grader & Bayesian Estimator ML Models Loaded")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
