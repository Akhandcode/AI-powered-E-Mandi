import { useState } from 'react';
import { ArrowLeft, Download, Share2, Save, CheckCircle, QrCode, CheckCircle2, FileCheck } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';
import OnionLogo from '../components/OnionLogo';
import BottomNav from '../components/BottomNav';

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

export default function FinalReportScreen() {
  const { navigate, inspectionData } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const batchId = inspectionData.batchId || 'APMC-NAS-4722';
  const center = inspectionData.center || 'APMC Nashik — Center 3';
  const inspector = inspectionData.inspector || 'Rajesh Kumar (ID: INS-0492)';
  const variety = inspectionData.variety || 'Nasik Red';

  const handleDownloadReport = () => {
    setIsDownloading(true);

    const reportHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>APMC Quality Certificate - ${batchId}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 40px 20px; background: #F4F7F5; color: #1A2F23; }
  .cert { max-width: 680px; margin: 0 auto; background: white; border-radius: 24px; border: 2px solid #1B6B3A; padding: 36px; box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #E8F5EE; padding-bottom: 20px; margin-bottom: 24px; }
  .title { font-size: 22px; font-weight: 800; color: #1B6B3A; margin: 0; }
  .sub { font-size: 13px; color: #5E7468; margin-top: 4px; }
  .badge { background: #DCFCE7; color: #15803D; font-weight: 800; padding: 8px 18px; border-radius: 20px; font-size: 13px; border: 1px solid #BBF7D0; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat { background: #F8FAF9; padding: 16px; border-radius: 16px; text-align: center; border: 1px solid #E8EDE9; }
  .stat-val { font-size: 30px; font-weight: 800; color: #1B6B3A; line-height: 1; }
  .stat-label { font-size: 12px; color: #5E7468; font-weight: 600; margin-top: 6px; }
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
      <h1 class="title">APMC ONION QUALITY CERTIFICATE</h1>
      <p class="sub">Ministry of Agriculture & Farmers Welfare · Smart India Hackathon 2026</p>
    </div>
    <div class="badge">PASSED (GRADE A)</div>
  </div>

  <div class="grid">
    <div class="stat">
      <div class="stat-val">82%</div>
      <div class="stat-label">Grade A Ratio</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color: #E8650A;">18%</div>
      <div class="stat-label">URS Ratio</div>
    </div>
    <div class="stat">
      <div class="stat-val" style="color: #15803D;">87 / 100</div>
      <div class="stat-label">Overall Score</div>
    </div>
  </div>

  <table>
    <tr><th>Certificate ID:</th><td>OQA-2026-00124</td></tr>
    <tr><th>Batch ID:</th><td>${batchId}</td></tr>
    <tr><th>Procurement Center:</th><td>${center}</td></tr>
    <tr><th>Assigned Inspector:</th><td>${inspector}</td></tr>
    <tr><th>Onion Variety:</th><td>${variety}</td></tr>
    <tr><th>Sample Quantity:</th><td>20 Onions Sampled</td></tr>
    <tr><th>Timestamp:</th><td>${new Date().toLocaleString()}</td></tr>
    <tr><th>Defect Summary:</th><td>Damaged: 2, Rotten: 1, Sprouted: 1, Undersized: 1</td></tr>
    <tr><th>Blockchain Hash:</th><td>0x8F92A1C94B02E847 (NIC Verified)</td></tr>
  </table>

  <div class="summary-box">
    <strong>AI Assessment Summary:</strong> Batch ${batchId} demonstrates acceptable quality for Grade A procurement. 82% of assessed onions meet size and surface standards. Recommended for immediate APMC procurement dispatch.
  </div>

  <div class="footer">
    <p>Issued by OnionGuard AI Platform · Verified via MSAMB Blockchain Registry</p>
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

    setTimeout(() => {
      setIsDownloading(false);
      setDownloaded(true);
    }, 700);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('quality-assessment')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontSize: 20 }}>Inspection Report</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Digital Certificate</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-36">
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
                  <p className="font-bold text-white" style={{ fontSize: 14 }}>OnionGuard AI</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10.5 }}>APMC Quality Certificate</p>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)' }}
              >
                <CheckCircle size={13} style={{ color: '#4ADE80' }} strokeWidth={2.5} />
                <span className="font-bold" style={{ color: '#4ADE80', fontSize: 11 }}>PASSED</span>
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
                <p className="font-bold text-white" style={{ fontSize: 12 }}>23 Aug 2026, 11:58 AM</p>
              </div>
            </div>
          </div>

          {/* Certificate body */}
          <div className="bg-white px-5 py-5">
            {/* Grade scores */}
            <div className="flex gap-3 mb-5">
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#E8F5EE', border: '1px solid #C4DDD0' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#1B6B3A', lineHeight: 1 }}>82%</p>
                <p style={{ fontSize: 11.5, color: '#2E7D32', fontWeight: 600, marginTop: 3 }}>Grade A</p>
              </div>
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#FFF3EB', border: '1px solid #FECDAB' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#E8650A', lineHeight: 1 }}>18%</p>
                <p style={{ fontSize: 11.5, color: '#C4520A', fontWeight: 600, marginTop: 3 }}>URS</p>
              </div>
              <div
                className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <p className="font-bold" style={{ fontSize: 28, color: '#15803D', lineHeight: 1 }}>87</p>
                <p style={{ fontSize: 11.5, color: '#15803D', fontWeight: 600, marginTop: 3 }}>Score</p>
              </div>
            </div>

            {/* Details table */}
            {[
              ['Batch ID', batchId],
              ['Procurement Center', center],
              ['Inspector', inspector],
              ['Onion Variety', variety],
              ['Sample Size', '20 onions assessed'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3" style={{ borderBottom: '1px solid #F4F7F5' }}>
                <span style={{ fontSize: 13, color: '#5E7468' }}>{label}</span>
                <span className="font-semibold text-right" style={{ fontSize: 13, color: '#1A2F23', maxWidth: '55%' }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Inspection image (Live uploaded or clean AI vector banner) */}
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
                    <p style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>20 Onions Assessed · {variety}</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>{center}</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#1B6B3A] border border-[#4ADE80]/40 text-[#4ADE80] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>82% Grade A</span>
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
                    <p style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>20 onions · {variety}</p>
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
                  { label: 'Damaged',   val: '2', color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Rotten',    val: '1', color: '#C0392B', bg: '#FDECEA' },
                  { label: 'Sprouted',  val: '1', color: '#B45309', bg: '#FEF3C7' },
                  { label: 'Undersized',val: '1', color: '#2563EB', bg: '#DBEAFE' },
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
                AI Assessment Summary
              </p>
              <p style={{ fontSize: 12.5, color: '#1A2F23', lineHeight: 1.6 }}>
                Batch {batchId} demonstrates acceptable quality for Grade A procurement. 82% of assessed onions meet size and surface standards. Minor sprouting and undersized defects detected (5% each) — recommend dispatch within 48 hours.
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
            <div className="text-center pt-3" style={{ borderTop: '1px solid #F4F7F5' }}>
              <p style={{ fontSize: 10.5, color: '#5E7468' }}>
                Generated by OnionGuard AI · Smart India Hackathon 2026
              </p>
              <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                Ministry of Agriculture & Farmers Welfare, Govt. of India
              </p>
            </div>
          </div>
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
            <span>Official APMC Quality Certificate Downloaded!</span>
          </div>
        )}

        <div className="flex gap-2.5 mb-3">
          <button
            onClick={() => alert('Certificate share link copied to clipboard!')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold"
            style={{
              height: 46,
              fontSize: 13,
              background: '#E8F5EE',
              color: '#1B6B3A',
              border: '1.5px solid #C4DDD0',
            }}
          >
            <Share2 size={16} strokeWidth={2} />
            Share
          </button>
          <button
            onClick={() => alert('Certificate saved to offline records!')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold"
            style={{
              height: 46,
              fontSize: 13,
              background: '#E8F5EE',
              color: '#1B6B3A',
              border: '1.5px solid #C4DDD0',
            }}
          >
            <Save size={16} strokeWidth={2} />
            Save
          </button>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all active:scale-[0.98]"
          style={{
            height: 52,
            fontSize: 15,
            background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
            boxShadow: '0 4px 16px rgba(27,107,58,0.28)',
          }}
        >
          {isDownloading ? (
            <span>Generating Certificate PDF…</span>
          ) : (
            <>
              <FileCheck size={19} strokeWidth={2.2} />
              <span>{downloaded ? 'Download Certificate Again' : 'Download Official PDF Report'}</span>
            </>
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
