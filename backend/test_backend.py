"""
End-to-end verification script for AI Powered E-Mandi Backend API.
Tests:
1. User registration & authentication.
2. Inspection Lot creation.
3. AI Onion Quality Assessment execution (Grade A % vs URS %, LQI score).
4. Instant Digital Quality Report generation (JSON & HTML certificate).
5. Mandi Price & Channel Routing recommendation.
"""
import sys
import os
from pathlib import Path

# Set PYTHONPATH to include backend
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.db.base import *
from app.models.user import User, RoleEnum
from app.schemas.auth import UserRegister
from app.services.auth_service import create_user, authenticate_user
from app.models.lot import InspectionLot, LotStatusEnum
from app.services.ai_service import AIService
from app.services.report_service import ReportService
from app.services.market_service import MarketService

def run_tests():
    print("=" * 60)
    print("RUNNING E-MANDI BACKEND VERIFICATION SUITE")
    print("=" * 60)

    # 1. Initialize Tables
    print("\n[1/5] Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    print("  -> Tables created successfully.")

    # 2. Test User Auth
    print("\n[2/5] Testing User Registration & Authentication...")
    test_email = "officer.nashik@doca.gov.in"
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user_in = UserRegister(
            email=test_email,
            name="Rakesh Sharma (Inspection Officer)",
            password="SecurePassword123!",
            role=RoleEnum.INSPECTION_OFFICER,
            organization="Department of Consumer Affairs",
            center_id="DOCA-NASHIK-01"
        )
        user = create_user(db, user_in)
        print(f"  -> Created user: {user.name} ({user.email})")

    auth_user = authenticate_user(db, test_email, "SecurePassword123!")
    assert auth_user is not None, "Authentication failed!"
    print(f"  -> User authenticated successfully: Role={auth_user.role}")

    # 3. Create Sample Inspection Lot
    print("\n[3/5] Creating Sample Onion Inspection Lot...")
    import uuid
    lot_num = f"LOT-ONION-2026-NASHIK-{uuid.uuid4().hex[:6].upper()}"
    lot = InspectionLot(
        lot_number=lot_num,
        procurement_center="Lasalgaon Mandi Procurement Center",
        commodity="Onion",
        variety="Red Onion (Kharif Batch)",
        total_weight_kg=2500.0,
        bag_count=50,
        farmer_name="Shri Kisanrao Patil",
        status=LotStatusEnum.PENDING,
        created_by_id=user.id
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)

    print(f"  -> Lot created: ID={lot.id}, Number={lot.lot_number}, Weight={lot.total_weight_kg}kg")

    # 4. Run AI Assessment & Quality Grading
    print("\n[4/5] Running AI Quality Assessment Model (Grade A vs URS %)...")
    result = AIService.assess_onion_lot(db=db, lot=lot, sample_size=40)
    print(f"  -> Assessment Complete!")
    print(f"     - Grade A (Fresh/Sound): {result.grade_a_percentage}%")
    print(f"     - URS (Under-Sized/Under-Grade/Un-Sound): {result.urs_percentage}%")
    print(f"     - Sprouted: {result.sprouted_pct}%, Damaged: {result.damaged_pct}%, Rotten: {result.rotten_pct}%, Undersized: {result.undersized_pct}%")
    print(f"     - Lot Quality Index (LQI): {result.lqi_score} (90% Credible Interval: {result.lqi_lower_ci} - {result.lqi_upper_ci})")
    print(f"     - Recommended Procurement Channel: {result.recommended_channel}")

    # 5. Generate Digital Quality Report & Market Recommendation
    print("\n[5/5] Generating Instant Digital Quality Report & Market Router Recommendations...")
    report = ReportService.generate_digital_report(db, lot.id)
    html_cert = ReportService.generate_html_certificate(db, lot.id)
    mkt_rec = MarketService.get_market_recommendations(db, lot.id)
    
    print(f"  -> Digital Report Generated: Number={report.report_number}")
    print(f"  -> Cryptographic Hash Signature: {report.report_hash[:24]}...")
    print(f"  -> HTML Certificate Generated: Length={len(html_cert)} characters")
    print(f"  -> Market Routing Action: {mkt_rec.optimal_action}")
    for ch in mkt_rec.channel_recommendations:
        print(f"     * {ch.channel}: {ch.recommended_pct}% @ INR {ch.expected_price_per_kg}/kg -> Est. Net Return: INR {ch.net_return_inr}")


    db.close()
    print("\n" + "=" * 60)
    print("ALL E-MANDI BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
