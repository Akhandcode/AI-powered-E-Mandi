from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.lot import InspectionLot
from app.models.assessment import GradingResult
from app.schemas.assessment import AssessmentRunRequest, GradingResultResponse
from app.services.ai_service import AIService
from app.services.auth_service import get_current_user

router = APIRouter()


@router.post("/lots/{lot_id}/assess", response_model=GradingResultResponse)
def assess_lot_quality(
    lot_id: int,
    req: AssessmentRunRequest = AssessmentRunRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run AI onion image processing & Bayesian Dirichlet quality estimation.
    Calculates Grade A %, URS % (Under-Sized / Under-Grade / Un-Sound), LQI score, and error bounds.
    """
    lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection lot not found")

    result = AIService.assess_onion_lot(
        db=db,
        lot=lot,
        sample_size=req.sample_size,
        use_debias=req.use_debias
    )
    return result


@router.get("/lots/{lot_id}/assessment", response_model=GradingResultResponse)
def get_lot_assessment(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI grading result for an inspection lot."""
    grading = db.query(GradingResult).filter(GradingResult.lot_id == lot_id).first()
    if not grading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment result not found for this lot. Run /assess first."
        )
    return grading
