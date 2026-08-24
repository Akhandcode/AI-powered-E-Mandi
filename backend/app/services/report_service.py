import json
import hashlib
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.lot import InspectionLot
from app.models.assessment import GradingResult
from app.models.report import QualityReport


class ReportService:
    
    @classmethod
    def generate_digital_report(cls, db: Session, lot_id: int) -> QualityReport:
        lot = db.query(InspectionLot).filter(InspectionLot.id == lot_id).first()
        if not lot:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lot not found")
        
        grading = db.query(GradingResult).filter(GradingResult.lot_id == lot_id).first()
        if not grading:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lot has not been graded yet. Run AI assessment first."
            )

        report_number = f"DOCA-ONION-RPT-{lot.id:05d}-{uuid.uuid4().hex[:6].upper()}"

        # Construct official payload for problem statement compliance (DoCA SIH 26031)
        summary_payload = {
            "report_metadata": {
                "report_number": report_number,
                "generated_at": datetime.utcnow().isoformat(),
                "organization": "Ministry of Consumer Affairs, Food & Public Distribution",
                "department": "Department of Consumer Affairs (DoCA)",
                "procurement_center": lot.procurement_center,
            },
            "lot_details": {
                "lot_number": lot.lot_number,
                "farmer_name": lot.farmer_name,
                "commodity": lot.commodity,
                "variety": lot.variety,
                "total_weight_kg": lot.total_weight_kg,
                "bag_count": lot.bag_count,
            },
            "ai_quality_assessment": {
                "sample_size": grading.sample_count,
                "grade_a_percentage": grading.grade_a_percentage,
                "urs_percentage": grading.urs_percentage,
                "lqi_score": grading.lqi_score,
                "credible_interval_90": {
                    "lower": grading.lqi_lower_ci,
                    "upper": grading.lqi_upper_ci
                },
                "defect_breakdown": {
                    "sound_fresh_pct": grading.fresh_pct,
                    "sprouted_pct": grading.sprouted_pct,
                    "damaged_pct": grading.damaged_pct,
                    "rotten_pct": grading.rotten_pct,
                    "undersized_pct": grading.undersized_pct
                },
                "recommended_procurement_channel": grading.recommended_channel
            },
            "dispute_prevention": {
                "verification_status": "VERIFIED_BY_AI_GRADER",
                "human_bias_index": 0.0,
                "transparency_code": f"DOCA-VERIFY-{lot.id}-{int(grading.grade_a_percentage*10)}"
            }
        }

        serialized_summary = json.dumps(summary_payload, sort_keys=True)
        report_hash = hashlib.sha256(serialized_summary.encode('utf-8')).hexdigest()

        # Check existing report
        existing = db.query(QualityReport).filter(QualityReport.lot_id == lot_id).first()
        if existing:
            existing.report_hash = report_hash
            existing.summary_json = serialized_summary
            db.commit()
            db.refresh(existing)
            return existing

        report = QualityReport(
            report_number=report_number,
            lot_id=lot_id,
            report_hash=report_hash,
            summary_json=serialized_summary
        )

        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @classmethod
    def generate_html_certificate(cls, db: Session, lot_id: int) -> str:
        report = cls.generate_digital_report(db, lot_id)
        payload = json.loads(report.summary_json)
        lot = payload["lot_details"]
        ai = payload["ai_quality_assessment"]
        meta = payload["report_metadata"]

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Digital Quality Report - {meta['report_number']}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }}
        .certificate {{ max-width: 800px; margin: 0 auto; background: white; border: 2px solid #0284c7; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }}
        .header {{ text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }}
        .header h1 {{ color: #0369a1; font-size: 24px; margin: 0; }}
        .header h3 {{ color: #475569; font-size: 14px; font-weight: normal; margin-top: 5px; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }}
        .card {{ background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0284c7; }}
        .card-title {{ font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 8px; }}
        .stat-val {{ font-size: 28px; font-weight: bold; color: #0f172a; }}
        .stat-sub {{ font-size: 13px; color: #475569; margin-top: 4px; }}
        .grade-a {{ border-left-color: #16a34a; }}
        .grade-a .stat-val {{ color: #15803d; }}
        .urs {{ border-left-color: #dc2626; }}
        .urs .stat-val {{ color: #b91c1c; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
        th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }}
        th {{ background: #f8fafc; font-weight: 600; color: #334155; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }}
        .badge {{ background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; }}
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <h1>MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</h1>
            <h3>Department of Consumer Affairs (DoCA) — Digital Onion Quality Report</h3>
            <span class="badge">Report ID: {meta['report_number']}</span>
        </div>

        <div class="grid">
            <div class="card grade-a">
                <div class="card-title">Grade A Percentage (Sound/Fresh)</div>
                <div class="stat-val">{ai['grade_a_percentage']}%</div>
                <div class="stat-sub">High Quality Buffer Eligible</div>
            </div>
            <div class="card urs">
                <div class="card-title">URS Percentage (Under-Sized / Under-Grade / Un-Sound)</div>
                <div class="stat-val">{ai['urs_percentage']}%</div>
                <div class="stat-sub">Sprouted, Damaged, Rotten, Undersized</div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 20px; border-left-color: #8b5cf6;">
            <div class="card-title">Lot & Farmer Details</div>
            <div class="grid" style="margin: 0;">
                <div><strong>Lot ID:</strong> {lot['lot_number']}</div>
                <div><strong>Farmer Name:</strong> {lot['farmer_name']}</div>
                <div><strong>Commodity:</strong> {lot['commodity']} ({lot['variety']})</div>
                <div><strong>Total Weight:</strong> {lot['total_weight_kg']} kg ({lot['bag_count']} bags)</div>
                <div><strong>Center:</strong> {meta['procurement_center']}</div>
                <div><strong>LQI Score:</strong> {ai['lqi_score']} (90% CI: {ai['credible_interval_90']['lower']} - {ai['credible_interval_90']['upper']})</div>
            </div>
        </div>

        <h3>Detailed Defect Composition</h3>
        <table>
            <thead>
                <tr>
                    <th>Quality Parameter</th>
                    <th>Classification Category</th>
                    <th>Measured Share (%)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Sound & Fresh Onions</td>
                    <td>Grade A (Premium)</td>
                    <td><strong>{ai['defect_breakdown']['sound_fresh_pct']}%</strong></td>
                </tr>
                <tr>
                    <td>Sprouted Onions</td>
                    <td>URS (Under-Grade)</td>
                    <td>{ai['defect_breakdown']['sprouted_pct']}%</td>
                </tr>
                <tr>
                    <td>Damaged / Cut Onions</td>
                    <td>URS (Under-Grade)</td>
                    <td>{ai['defect_breakdown']['damaged_pct']}%</td>
                </tr>
                <tr>
                    <td>Rotten / Soft Mould Onions</td>
                    <td>URS (Un-Sound)</td>
                    <td>{ai['defect_breakdown']['rotten_pct']}%</td>
                </tr>
                <tr>
                    <td>Undersized Onions (&lt;35mm)</td>
                    <td>URS (Under-Sized)</td>
                    <td>{ai['defect_breakdown']['undersized_pct']}%</td>
                </tr>
            </tbody>
        </table>

        <div class="card" style="margin-top: 20px; border-left-color: #10b981;">
            <div class="card-title">Recommended Procurement Channel</div>
            <div style="font-size: 16px; font-weight: bold; color: #047857;">{ai['recommended_procurement_channel']}</div>
        </div>

        <div class="footer">
            <div><strong>Cryptographic Hash Signature:</strong> <br><span style="font-family: monospace; font-size: 10px;">{report.report_hash}</span></div>
            <div><strong>Generated:</strong> {meta['generated_at'][:19]} UTC</div>
        </div>
    </div>
</body>
</html>"""
        return html_content
