import { useState } from 'react';
import { ArrowLeft, Download, Share2, CheckCircle, AlertTriangle, CheckCircle2, FileCheck } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';

export default function ReportDetailsScreen() {
  const { navigate, inspectionData } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadPDF = () => {
    const batchId = 'APMC-NAS-4721';
    const reportHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>APMC Inspection Report - ${batchId}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 30px; background: #f8faf9; color: #1a2f23; }
  .cert { max-width: 650px; margin: 0 auto; background: white; border-radius: 20px; border: 2px solid #1B6B3A; padding: 30px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #E8F5EE; padding-bottom: 16px; margin-bottom: 20px; }
  .title { font-size: 20px; font-weight: 800; color: #1B6B3A; margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat { background: #F4F7F5; padding: 14px; border-radius: 12px; text-align: center; }
  .stat-val { font-size: 26px; font-weight: 800; color: #1B6B3A; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { text-align: left; padding: 10px; border-bottom: 1px solid #E8EDE9; font-size: 13px; }
  th { color: #5E7468; }
</style>
</head>
<body>
<div class="cert">
  <div class="header">
    <div>
      <h1 class="title">APMC INSPECTION DETAILED REPORT</h1>
      <p style="font-size:12px; color:#5E7468;">OnionGuard AI · Report ID: OG-20260823-047</p>
    </div>
    <div style="background:#DCFCE7; color:#15803D; font-weight:800; padding:6px 14px; border-radius:16px; font-size:12px;">PASSED</div>
  </div>

  <div class="grid">
    <div class="stat"><div class="stat-val">88 / 100</div><div style="font-size:11px; color:#5E7468;">Overall Score</div></div>
    <div class="stat"><div class="stat-val">85%</div><div style="font-size:11px; color:#5E7468;">Grade A</div></div>
    <div class="stat"><div class="stat-val" style="color:#E8650A;">15%</div><div style="font-size:11px; color:#5E7468;">URS</div></div>
  </div>

  <table>
    <tr><th>Batch ID:</th><td>APMC-NAS-4721</td></tr>
    <tr><th>Report Date:</th><td>23 Aug 2026, 11:42 AM IST</td></tr>
    <tr><th>Procurement Center:</th><td>${inspectionData.center || 'APMC Nashik — Center 3'}</td></tr>
    <tr><th>Inspector:</th><td>${inspectionData.inspector || 'Rajesh Kumar (INS-0492)'}</td></tr>
    <tr><th>Onion Variety:</th><td>Nasik Red</td></tr>
    <tr><th>Sample Quantity:</th><td>75 kg</td></tr>
    <tr><th>Size Compliance:</th><td>91%</td></tr>
    <tr><th>Sprouted Onions:</th><td>18% (2 onions)</td></tr>
  </table>

  <div style="background:#E8F5EE; padding:14px; border-radius:12px; font-size:12px; line-height:1.5;">
    <strong>Key Findings:</strong> Majority within Grade A size range (≥45mm). Low rotten percentage — batch is safe for APMC procurement.
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `APMC_Inspection_Report_${batchId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('history')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white" style={{ fontSize: 18 }}>Report Details</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
              OG-20260823-047
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <Share2 size={18} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Sample image with detections or AI Vector Banner */}
        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm" style={{ height: 160, background: 'linear-gradient(135deg, #0B2515 0%, #134D2B 100%)' }}>
          {inspectionData.capturedImage ? (
            <>
              <img
                src={inspectionData.capturedImage}
                alt="Sample inspection image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-between p-5 bg-[#0B2515]/95">
              <div>
                <p className="text-[#4ADE80] font-mono text-[10px] font-bold tracking-wider mb-1">
                  AI DEFECT DETECTION MATRIX
                </p>
                <h4 className="text-white font-extrabold text-base">Batch APMC-NAS-4721</h4>
                <p className="text-white/70 text-xs mt-1">9 Onions Assessed · Nasik Red</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#15803D] text-white text-xs font-bold shadow-md">
                PASSED (85% A)
              </div>
            </div>
          )}
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-xl font-bold"
            style={{ background: 'rgba(0,0,0,0.65)', color: '#4ADE80', fontSize: 11 }}
          >
            9 Detected
          </div>
        </div>

        {/* Grade summary */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>Quality Grade</h3>
            <div
              className="px-3 py-1 rounded-full font-bold"
              style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12 }}
            >
              PASSED
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Overall Score', value: '88', unit: '/100', color: '#1B6B3A', bg: '#E8F5EE' },
              { label: 'Grade A', value: '85', unit: '%', color: '#1B6B3A', bg: '#E8F5EE' },
              { label: 'URS', value: '15', unit: '%', color: '#E8650A', bg: '#FFF3EB' },
            ].map(({ label, value, unit, color, bg }) => (
              <div key={label} className="flex-1 rounded-2xl p-3 text-center" style={{ background: bg }}>
                <p className="font-bold" style={{ fontSize: 22, color, lineHeight: 1 }}>
                  {value}<span style={{ fontSize: 13 }}>{unit}</span>
                </p>
                <p style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report metadata */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>Report Metadata</h3>
          {[
            ['Batch ID', 'APMC-NAS-4721'],
            ['Report ID', 'OG-20260823-047'],
            ['Date', '23 Aug 2026'],
            ['Time', '11:42 AM IST'],
            ['Procurement Center', inspectionData.center || 'APMC Nashik — Center 3'],
            ['Inspector', inspectionData.inspector || 'Rajesh Kumar (INS-0492)'],
            ['Variety', 'Nasik Red'],
            ['Sample Quantity', '75 kg'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid #F4F7F5' }}>
              <span style={{ fontSize: 13, color: '#5E7468' }}>{k}</span>
              <span
                className="font-semibold text-right"
                style={{
                  fontSize: 13,
                  color: '#1A2F23',
                  maxWidth: '58%',
                  fontFamily: k === 'Report ID' ? 'var(--font-mono)' : 'inherit',
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* Quality breakdown */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>Quality Breakdown</h3>
          {[
            { label: 'Size Compliance', value: 91, color: '#1B6B3A', bg: '#E8F5EE' },
            { label: 'Surface Damage', value: 9, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Rotten Onions', value: 9, color: '#C0392B', bg: '#FDECEA' },
            { label: 'Sprouted Onions', value: 18, color: '#B45309', bg: '#FEF3C7' },
            { label: 'Undersized', value: 9, color: '#1D4ED8', bg: '#DBEAFE' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 13.5, color: '#1A2F23' }}>{label}</span>
                <span className="font-bold" style={{ fontSize: 13.5, color }}>{value}%</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: bg }}>
                <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Key findings */}
        <div
          className="mx-4 mt-4 mb-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-3" style={{ fontSize: 15, color: '#1A2F23' }}>Key Findings</h3>
          {[
            { text: 'Majority within Grade A size range (≥45mm)', ok: true },
            { text: 'Surface damage within acceptable limits', ok: true },
            { text: 'Low rotten percentage — batch is safe', ok: true },
            { text: '2 sprouted onions detected — marginal risk', ok: false },
          ].map(({ text, ok }) => (
            <div key={text} className="flex items-start gap-2.5 mb-2.5">
              {ok
                ? <CheckCircle size={16} strokeWidth={2.2} style={{ color: '#15803D', flexShrink: 0, marginTop: 1 }} />
                : <AlertTriangle size={16} strokeWidth={2.2} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
              }
              <span style={{ fontSize: 13.5, color: '#1A2F23', lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: '#F4F7F5', borderTop: '1px solid #D4E4DA' }}
      >
        {downloaded && (
          <div className="mb-2 p-2 rounded-xl bg-[#DCFCE7] text-[#15803D] text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} />
            <span>Inspection Report File Downloaded!</span>
          </div>
        )}

        <button
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all active:scale-[0.98]"
          style={{
            height: 54,
            fontSize: 15,
            background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
            boxShadow: '0 4px 16px rgba(27,107,58,0.28)',
          }}
        >
          {downloaded ? <FileCheck size={19} /> : <Download size={18} strokeWidth={2.2} />}
          <span>{downloaded ? 'Download Report File Again' : 'Download PDF / Analysis File'}</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
