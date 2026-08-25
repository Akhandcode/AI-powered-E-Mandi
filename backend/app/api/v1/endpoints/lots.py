import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.lot import InspectionLot, LotImage, LotStatusEnum
from app.schemas.lot import LotCreate, LotResponse, LotImageResponse
from app.services.auth_service import get_current_user

router = APIRouter()
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=LotResponse, status_code=status.HTTP_201_CREATED)
def create_inspection_lot(
    lot_in: LotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new onion inspection lot at a procurement center."""
    lot_number = f"LOT-{lot_in.commodity.upper()}-{uuid.uuid4().hex[:8].upper()}"
    lot = InspectionLot(
        lot_number=lot_number,
        procurement_center=lot_in.procurement_center,
        commodity=lot_in.commodity,
        variety=lot_in.variety,
        total_weight_kg=lot_in.total_weight_kg,
        bag_count=lot_in.bag_count,
        farmer_name=lot_in.farmer_name,
        status=LotStatusEnum.PENDING,
        created_by_id=current_user.id
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot


@router.get("/", response_model=List[LotResponse])
def list_inspection_lots(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List inspection lots."""
    lots = db.query(InspectionLot).order_by(InspectionLot.id.desc()).offset(skip).limit(limit).all()
    return lots


@router.get("/{lot_id}", response_model=LotResponse)
def get_inspection_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single inspection lot details."""
    lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection lot not found")
    return lot


@router.post("/{lot_id}/images", response_model=List[LotImageResponse])
async def upload_lot_images(
    lot_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload sample onion images for quality assessment."""
    lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection lot not found")

    saved_images = []
    for file in files:
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"lot_{lot_id}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        image_rec = LotImage(
            lot_id=lot.id,
            file_name=file.filename,
            file_path=file_path
        )
        db.add(image_rec)
        saved_images.append(image_rec)

    db.commit()
    for img in saved_images:
        db.refresh(img)

    return saved_images
