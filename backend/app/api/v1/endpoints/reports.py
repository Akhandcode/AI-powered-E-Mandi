import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.lot import InspectionLot, LotStatusEnum
from app.models.report import QualityReport
from app.schemas.report import ReportResponse, DisputeCreateRequest
from app.services.report_service import ReportService
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/lots/{lot_id}/report", response_model=ReportResponse)
def get_digital_quality_report(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate or retrieve digital quality report for an onion lot (JSON format)."""
    report = ReportService.generate_digital_report(db, lot_id)
    summary_dict = json.loads(report.summary_json)
    return ReportResponse(
        id=report.id,
        report_number=report.report_number,
        lot_id=report.lot_id,
        report_hash=report.report_hash,
        summary=summary_dict,
        is_disputed=report.is_disputed,
        dispute_reason=report.dispute_reason,
        created_at=report.created_at
    )


@router.get("/lots/{lot_id}/report/html", response_class=Response)
def download_report_html(
    lot_id: int,
    db: Session = Depends(get_db)
):
    """Download/View instant digital quality certificate in HTML format (printable/PDF ready)."""
    html_content = ReportService.generate_html_certificate(db, lot_id)
    return Response(content=html_content, media_type="text/html")


@router.post("/lots/{lot_id}/dispute", response_model=ReportResponse)
def flag_lot_dispute(
    lot_id: int,
    dispute_in: DisputeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Flag an onion quality assessment for dispute resolution."""
    report = ReportService.generate_digital_report(db, lot_id)
    lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()

    report.is_disputed = True
    report.dispute_reason = dispute_in.dispute_reason
    if lot:
        lot.status = LotStatusEnum.DISPUTED

    db.commit()
    db.refresh(report)
    db.refresh(lot)

    summary_dict = json.loads(report.summary_json)
    return ReportResponse(
        id=report.id,
        report_number=report.report_number,
        lot_id=report.lot_id,
        report_hash=report.report_hash,
        summary=summary_dict,
        is_disputed=report.is_disputed,
        dispute_reason=report.dispute_reason,
        created_at=report.created_at
    )
