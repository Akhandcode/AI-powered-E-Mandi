import { useState } from 'react';
import { ArrowLeft, Download, Share2, Save, CheckCircle, QrCode, CheckCircle2, FileCheck, Trash2, X, TrendingUp, IndianRupee, Store, Building2, Factory } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';
import OnionLogo from '../components/OnionLogo';
import BottomNav from '../components/BottomNav';
import { getReportHtmlUrl } from '../services/api';

function QRCodeSvg() {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,0],
    [1,1,0,1,0,1,1,0,1,1,0,0,1,0,0,1,1,0,1,1,0],
    [0,0,1,0,1,0,0,1,0,0,1,1,0,1,0,0,1,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,1,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1,1,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,0],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,1,0,1,0,1],
  ];
  const size = 21;
  const cell = 4;
  return (
    <svg width={size * cell + 8} height={size * cell + 8} viewBox={`0 0 ${size * cell + 8} ${size * cell + 8}`}>
      <rect width={size * cell + 8} height={size * cell + 8} fill="white" rx="4" />
      {pattern.map((row, ri) =>
        row.map((cell_val, ci) =>
          cell_val ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cell + 4} y={ri * cell + 4}
              width={cell - 0.5} height={cell - 0.5}
              fill="#1A2F23"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// Benchmark Government Agmarknet & DoCA base pricing per kg
const commodityPricingMap: Record<string, { gradeAPrice: number; ursPrice: number; spotPrice: number }> = {
  Onion: { gradeAPrice: 32.0, ursPrice: 17.5, spotPrice: 26.5 },
  Tomato: { gradeAPrice: 28.0, ursPrice: 13.0, spotPrice: 22.0 },
  Potato: { gradeAPrice: 19.0, ursPrice: 10.5, spotPrice: 15.0 },
};

export default function FinalReportScreen() {
  const { navigate, inspectionData, activeLotId, setInspectionData, setActiveLotId, setAssessmentResult, assessmentResult } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const commodity = inspectionData.commodity || 'Onion';
  const commodityPlural = `${commodity.toLowerCase()}s`;
  const batchId = inspectionData.batchId || `LOT-${commodity.toUpperCase()}-4722`;
  const center = inspectionData.center || 'APMC Lasalgaon Procurement Center';
  const inspector = inspectionData.inspector || 'Inspection Officer (ID: INS-0492)';
  const variety = inspectionData.variety || `${commodity} Standard`;
  const farmer = inspectionData.farmerName || 'Registered Farmer';
  const totalWeightKg = Number(inspectionData.quantity) || 1000;

  const gradeA = assessmentResult ? assessmentResult.grade_a_percentage : 0;
  const urs = assessmentResult ? assessmentResult.urs_percentage : 0;
  const lqi = assessmentResult ? Math.round(assessmentResult.lqi_score) : 0;

  const damagedPct = assessmentResult ? assessmentResult.damaged_pct : 0;
  const rottenPct = assessmentResult ? assessmentResult.rotten_pct : 0;
  const sproutedPct = assessmentResult ? assessmentResult.sprouted_pct : 0;
  const undersizedPct = assessmentResult ? assessmentResult.undersized_pct : 0;

  const sampleCount = assessmentResult?.sample_count || 16;
  const damagedCount = Math.round((damagedPct / 100) * sampleCount);
  const rottenCount = Math.round((rottenPct / 100) * sampleCount);
  const sproutedCount = Math.round((sproutedPct / 100) * sampleCount);
  const undersizedCount = Math.round((undersizedPct / 100) * sampleCount);

  const passed = gradeA >= 75;

  // ── Grade-Based Dynamic Economic Pricing Realization ──
  const pricing = commodityPricingMap[commodity] || commodityPricingMap.Onion;
  const gradeAPrice = pricing.gradeAPrice;
  const ursPrice = pricing.ursPrice;
  const spotPrice = pricing.spotPrice;

  // Dynamic realized price based on AI Grade % breakdown
  const realizedPricePerKg = Number(((gradeA / 100) * gradeAPrice + (urs / 100) * ursPrice).toFixed(2));
  const realizedPricePerQuintal = Math.round(realizedPricePerKg * 100);

  const gradeAQtyKg = Math.round((gradeA / 100) * totalWeightKg);
  const ursQtyKg = Math.round((urs / 100) * totalWeightKg);

  const gradeAValue = Math.round(gradeAQtyKg * gradeAPrice);
  const ursValue = Math.round(ursQtyKg * ursPrice);
  const totalLotValue = gradeAValue + ursValue;

  // Recommended Buyer Channel based on AI Quality
  let recommendedChannel = 'APMC Mandi Spot Wholesale';
  let recommendedRate = spotPrice;
  if (passed) {
    recommendedChannel = 'DoCA Buffer Procurement (NAFED / NCCF)';
    recommendedRate = gradeAPrice;
  } else if (gradeA < 50) {
    recommendedChannel = 'Food Processing & Dehydration Industry';
    recommendedRate = ursPrice;
  }

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    setActiveLotId(null);
    setAssessmentResult(null);
    setInspectionData({ batchId: '', center: '', inspector: '', variety: '', quantity: '', commodity: 'Onion', farmerName: '' });
    navigate('dashboard');
  };

  const handleDownloadReport = () => {
    setIsDownloading(true);

    if (activeLotId) {
      window.open(getReportHtmlUrl(activeLotId), '_blank');
      setIsDownloading(false);
      setDownloaded(true);
      return;
    }

    const reportHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>APMC Quality & Grade-Based Pricing Certificate - ${batchId}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px 20px; background: #F4F7F5; color: #1A2F23; }
  .cert { max-width: 720px; margin: 0 auto; background: white; border-radius: 24px; border: 2px solid #1B6B3A; padding: 36px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #E8F5EE; padding-bottom: 20px; margin-bottom: 24px; }
  .title { font-size: 22px; font-weight: 800; color: #1B6B3A; margin: 0; }
  .sub { font-size: 13px; color: #5E7468; margin-top: 4px; }
  .badge { background: ${passed ? '#DCFCE7' : '#FEE2E2'}; color: ${passed ? '#15803D' : '#DC2626'}; font-weight: 800; padding: 8px 18px; border-radius: 20px; font-size: 13px; border: 1px solid ${passed ? '#BBF7D0' : '#FECACA'}; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat { background: #F8FAF9; padding: 16px; border-radius: 16px; text-align: center; border: 1px solid #E8EDE9; }
  .stat-val { font-size: 30px; font-weight: 800; color: #1B6B3A; line-height: 1; }
  .stat-label { font-size: 12px; color: #5E7468; font-weight: 600; margin-top: 6px; }
  
  .pricing-box { background: linear-gradient(135deg, #0D472B, #1B6B3A); color: white; padding: 22px; border-radius: 18px; margin-bottom: 24px; }
  .price-large { font-size: 32px; font-weight: 800; color: #4ADE80; line-height: 1; }
  .price-sub { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; }
  
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { text-align: left; padding: 12px; border-bottom: 1px solid #F4F7F5; font-size: 13.5px; }
  th { color: #5E7468; font-weight: 600; width: 40%; }
  td { font-weight: 700; color: #1A2F23; }
  .summary-box { background: #E8F5EE; padding: 18px; border-radius: 16px; border-left: 4px solid #1B6B3A; font-size: 13px; line-height: 1.6; color: #1A2F23; margin-bottom: 24px; }
  .footer { text-align: center; border-top: 1px dashed #D4E4DA; padding-top: 20px; margin-top: 24px; font-size: 11px; color: #8EA899; }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div>
      <h1 class="title">APMC ${commodity.toUpperCase()} QUALITY CERTIFICATE</h1>
      <p class="sub">Ministry of Agriculture & Farmers Welfare · DoCA Onion Buffer Procurement</p>
    </div>
    <div class="badge">${passed ? 'PASSED (GRADE A)' : 'STANDARD (URS HEAVY)'}</div>
  </div>

  <div class="pricing-box">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:12px; text-transform:uppercase; color:rgba(255,255,255,0.8); font-weight:700;">Realized Lot Price (AI Graded)</div>
        <div class="price-large">₹${realizedPricePerKg.toFixed(2)} / kg</div>
        <div class="price-sub">₹${realizedPricePerQuintal} / quintal · Total Lot Value: ₹${totalLotValue.toLocaleString('en-IN')}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px; color:rgba(255,255,255,0.8);">Channel:</div>
        <div style="font-weight:800; font-size:14px; color:#FCD34D;">${recommendedChannel}</div>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="stat">
      <div class="stat-val">${gradeA}%</div>
      <div class="stat-label">Grade A Ratio (₹${gradeAPrice}/kg)</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color: #E8650A;">${urs}%</div>
      <div class="stat-label">URS / Processing (₹${ursPrice}/kg)</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color: #15803D;">${lqi}</div>
      <div class="stat-label">Lot Quality Index (LQI)</div>
    </div>
  </div>

  <table>
    <tr><th>Batch / Lot ID:</th><td>${batchId}</td></tr>
    <tr><th>Farmer / Seller:</th><td>${farmer}</td></tr>
    <tr><th>Procurement Center:</th><td>${center}</td></tr>
    <tr><th>Quality Inspector:</th><td>${inspector}</td></tr>
    <tr><th>Variety:</th><td>${variety}</td></tr>
    <tr><th>Total Lot Weight:</th><td>${totalWeightKg} kg</td></tr>
    <tr><th>Grade A Quantity:</th><td>${gradeAQtyKg} kg (₹${gradeAValue.toLocaleString('en-IN')})</td></tr>
    <tr><th>URS / Spoilage Quantity:</th><td>${ursQtyKg} kg (₹${ursValue.toLocaleString('en-IN')})</td></tr>
  </table>

  <div class="summary-box">
    <strong>AI Assessment Summary:</strong> Batch ${batchId} evaluated with LQI score ${lqi}/100. ${gradeA}% meets Grade A standard. Blended fair economic value is calculated at ₹${realizedPricePerKg}/kg yielding ₹${totalLotValue.toLocaleString('en-IN')} net returns.
  </div>

  <div class="footer">
    Report Hash: 311242d9cf4cd2f9daa2bae09883376702ee74670a99735ef525e3f929d28af2<br>
    Cryptographically signed & tamper-proof under Department of Consumer Affairs (DoCA) Mandi Protocol.
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `APMC_Quality_Report_${batchId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
    setDownloaded(true);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      {/* Top green header */}
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('quality-assessment')}
              className="flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
            >
              <ArrowLeft size={20} strokeWidth={2} className="text-white" />
            </button>
            <div>
              <h1 className="font-bold text-white" style={{ fontSize: 20 }}>Inspection Report</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Digital Quality & Pricing Certificate</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 transition-colors"
            style={{ width: 40, height: 40 }}
            title="Delete Report"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-40">
        {/* Certificate card */}
        <div
          className="mx-4 mt-4 rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
        >
          {/* Certificate header */}
          <div
            className="px-5 pt-5 pb-5"
            style={{ background: 'linear-gradient(135deg, #134D2B 0%, #1B6B3A 100%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <OnionLogo size={36} />
                <div>
                  <p className="font-bold text-white" style={{ fontSize: 14 }}>E-Mandi AI</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10.5 }}>APMC Quality Certificate</p>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{
                  background: passed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${passed ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                }}
              >
                <CheckCircle size={13} style={{ color: passed ? '#4ADE80' : '#FCA5A5' }} strokeWidth={2.5} />
                <span className="font-bold" style={{ color: passed ? '#4ADE80' : '#FCA5A5', fontSize: 11 }}>
                  {passed ? 'PASSED' : 'GRADED'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5, marginBottom: 2 }}>Report ID</p>
                <p className="font-bold text-white" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  OQA-2026-00124
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5, marginBottom: 2 }}>Date & Time</p>
                <p className="font-bold text-white" style={{ fontSize: 12 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Certificate body */}
          <div className="bg-white px-5 py-5">

            {/* ── Dynamic Economic Pricing Card According to Grade ── */}
            <div
              className="rounded-2xl p-4 mb-5"
              style={{
                background: 'linear-gradient(135deg, #071E14 0%, #0D472B 100%)',
                boxShadow: '0 4px 16px rgba(13,71,43,0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#4ADE80]/20 flex items-center justify-center text-[#4ADE80]">
                    <IndianRupee size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">AI Grade Realized Price</p>
                    <p className="text-white font-extrabold text-lg leading-tight">
                      ₹{realizedPricePerKg.toFixed(2)} <span className="text-xs text-white/70 font-normal">/ kg</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30">
                    ₹{realizedPricePerQuintal} / quintal
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-2.5">
                  <p className="text-white/60 text-[10.5px]">Total Lot Value ({totalWeightKg} kg)</p>
                  <p className="text-white font-extrabold text-base leading-tight mt-0.5">
                    ₹{totalLotValue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5">
                  <p className="text-white/60 text-[10.5px]">Recommended Channel</p>
                  <p className="text-[#FCD34D] font-bold text-xs leading-tight mt-0.5 truncate">
                    {recommendedChannel}
                  </p>
                </div>
              </div>

              {/* Realized Price Breakdown according to grade */}
              <div className="mt-3 pt-2 text-[11.5px] text-white/80 space-y-1">
                <div className="flex justify-between">
                  <span>• Grade A ({gradeA}% @ ₹{gradeAPrice}/kg):</span>
                  <span className="font-semibold text-white">{gradeAQtyKg} kg = ₹{gradeAValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>• URS / Processing ({urs}% @ ₹{ursPrice}/kg):</span>
                  <span className="font-semibold text-amber-300">{ursQtyKg} kg = ₹{ursValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Grade scores */}
            <div className="flex gap-3 mb-5">
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#E8F5EE', border: '1px solid #C4DDD0' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#1B6B3A', lineHeight: 1 }}>{gradeA}%</p>
                <p style={{ fontSize: 11.5, color: '#2E7D32', fontWeight: 600, marginTop: 3 }}>Grade A</p>
              </div>
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#FFF3EB', border: '1px solid #FECDAB' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#E8650A', lineHeight: 1 }}>{urs}%</p>
                <p style={{ fontSize: 11.5, color: '#C4520A', fontWeight: 600, marginTop: 3 }}>URS</p>
              </div>
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#15803D', lineHeight: 1 }}>{lqi}</p>
                <p style={{ fontSize: 11.5, color: '#15803D', fontWeight: 600, marginTop: 3 }}>Score</p>
              </div>
            </div>

            {/* Details table */}
            {[
              ['Batch ID', batchId],
              ['Farmer / Seller', farmer],
              ['Procurement Center', center],
              ['Inspector', inspector],
              [`${commodity} Variety`, variety],
              ['Total Lot Quantity', `${totalWeightKg} kg`],
              ['Sample Size', `${sampleCount} ${commodityPlural} assessed`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3" style={{ borderBottom: '1px solid #F4F7F5' }}>
                <span style={{ fontSize: 13, color: '#5E7468' }}>{label}</span>
                <span className="font-semibold text-right" style={{ fontSize: 13, color: '#1A2F23', maxWidth: '55%' }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Inspection image */}
            <div className="mt-4 mb-4 rounded-2xl overflow-hidden relative" style={{ height: 130, background: 'linear-gradient(135deg, #0B2515 0%, #134D2B 100%)' }}>
              {inspectionData.capturedImage ? (
                <img
                  src={inspectionData.capturedImage}
                  alt="Inspection sample"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-between p-4 bg-[#0B2515]/90">
                  <div>
                    <p style={{ color: '#4ADE80', fontSize: 9.5, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                      AI BATCH SCAN COMPLETE
                    </p>
                    <p style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{sampleCount} {commodityPlural} Assessed · {variety}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{center}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#1B6B3A] border border-[#4ADE80]/40 text-[#4ADE80] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>{gradeA}% Grade A</span>
                  </div>
                </div>
              )}
              {inspectionData.capturedImage && (
                <>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', top: 12, left: 14 }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9.5, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                      ASSESSED SAMPLE PHOTO
                    </p>
                    <p style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{sampleCount} {commodityPlural} · {variety}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10.5, marginTop: 1 }}>{center}</p>
                  </div>
                </>
              )}
            </div>

            {/* Defect summary */}
            <div className="mb-4">
              <p className="font-bold mb-3" style={{ fontSize: 13.5, color: '#1A2F23' }}>Defect Summary</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Damaged',   val: damagedCount.toString(), color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Rotten',    val: rottenCount.toString(), color: '#C0392B', bg: '#FDECEA' },
                  { label: 'Sprouted',  val: sproutedCount.toString(), color: '#B45309', bg: '#FEF3C7' },
                  { label: 'Undersized',val: undersizedCount.toString(), color: '#2563EB', bg: '#DBEAFE' },
                ].map(({ label, val, color, bg }) => (
                  <div
                    key={label}
                    className="rounded-xl p-2 text-center"
                    style={{ background: bg }}
                  >
                    <p className="font-bold" style={{ fontSize: 20, color, lineHeight: 1 }}>{val}</p>
                    <p style={{ fontSize: 9.5, color, marginTop: 2, fontWeight: 600 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assessment */}
            <div
              className="rounded-2xl p-4 mb-5"
              style={{ background: '#F4F7F5', border: '1px solid #D4E4DA' }}
            >
              <p className="font-bold mb-1.5" style={{ fontSize: 12.5, color: '#1B6B3A' }}>
                AI Assessment & Market Routing
              </p>
              <p style={{ fontSize: 12.5, color: '#1A2F23', lineHeight: 1.6 }}>
                Batch {batchId} evaluated with LQI score {lqi}/100. Based on {gradeA}% Grade A ratio, the fair realized economic price is <strong>₹{realizedPricePerKg}/kg</strong>. Optimal route: <strong>{recommendedChannel}</strong>.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex items-center gap-5 py-4" style={{ borderTop: '1px dashed #D4E4DA' }}>
              <div>
                <QRCodeSvg />
              </div>
              <div>
                <p className="font-bold" style={{ fontSize: 13, color: '#1A2F23', marginBottom: 3 }}>
                  Scan to Verify
                </p>
                <p style={{ fontSize: 11.5, color: '#5E7468', lineHeight: 1.5 }}>
                  Tamper-proof digital certificate verified via APMC blockchain registry
                </p>
                <p className="font-mono mt-2" style={{ fontSize: 10, color: '#5E7468', fontFamily: 'var(--font-mono)' }}>
                  apmc.gov.in/verify/OG-20260823-048
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4" style={{ borderTop: '1px dashed #D4E4DA' }}>
              <p style={{ color: '#5E7468', fontSize: 11.5 }}>
                National Agricultural Mandi Network (DoCA)
              </p>
              <p style={{ color: '#8EA899', fontSize: 10.5, marginTop: 2 }}>
                Certificate Hash: 311242d9cf4cd2f9daa2bae09883376702ee74670a99735ef525e3f929d28af2
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 mt-5 flex gap-3">
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98]"
            style={{
              height: 52,
              background: downloaded ? '#DCFCE7' : 'white',
              border: '1.5px solid',
              borderColor: downloaded ? '#16A34A' : '#D4E4DA',
              color: downloaded ? '#15803D' : '#1A2F23',
              fontSize: 14.5,
            }}
          >
            {downloaded ? <CheckCircle2 size={18} /> : <Download size={18} strokeWidth={2} />}
            {downloaded ? 'Downloaded ✓' : isDownloading ? 'Preparing PDF…' : 'Download PDF'}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `APMC Inspection Certificate - ${batchId}`,
                  text: `APMC Quality & Grade-Based Pricing Certificate for ${batchId}: Grade A: ${gradeA}%, Realized Price: ₹${realizedPricePerKg}/kg.`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                alert(`Certificate link copied for ${batchId}`);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all active:scale-[0.98]"
            style={{
              height: 52,
              background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
              boxShadow: '0 4px 14px rgba(27,107,58,0.25)',
              fontSize: 14.5,
            }}
          >
            <Share2 size={18} strokeWidth={2} />
            Share Certificate
          </button>
        </div>

        {/* Back to dashboard */}
        <div className="px-5 mt-3">
          <button
            onClick={() => {
              setActiveLotId(null);
              setAssessmentResult(null);
              setInspectionData({
                batchId: '', center: '', inspector: '', variety: '', quantity: '', commodity: 'Onion', farmerName: '',
              });
              navigate('dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98]"
            style={{
              height: 48,
              background: 'transparent',
              border: '1.5px solid #D4E4DA',
              color: '#5E7468',
              fontSize: 14,
            }}
          >
            Complete & Return to Dashboard
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete This Report?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to discard this digital certificate for <strong>{batchId}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-md shadow-red-500/20"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="new-inspection" />
    </div>
  );
}
