import { ArrowLeft, ChevronRight, Ruler } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';

export default function SizeMeasurementScreen() {
  const { navigate, inspectionData, assessmentResult } = useApp();

  const commodity = inspectionData.commodity || 'Onion';
  const batchId = inspectionData.batchId || 'APMC-NAS-4722';
  const totalCount = assessmentResult?.sample_count || 16;
  const avgDiam = assessmentResult?.avg_diam || 5.4;
  const compliance = assessmentResult?.size_compliance ?? (assessmentResult?.grade_a_percentage || 85);
  const undersizedPct = assessmentResult?.undersized_pct ?? 5;
  const gradeAPct = compliance;
  const oversizePct = Math.max(0, 100 - gradeAPct - undersizedPct);

  const distribution = [
    { range: 'Below 4.5 cm', pct: undersizedPct, color: '#60A5FA', bg: '#DBEAFE', label: 'Undersized' },
    { range: '4.5 – 6.5 cm', pct: gradeAPct, color: '#16A34A', bg: '#DCFCE7', label: 'Grade A' },
    { range: 'Above 6.5 cm', pct: oversizePct, color: '#D97706', bg: '#FEF3C7', label: 'Oversize' },
  ];

  // Dynamic 7-bar histogram distribution scaled to sample sizes
  const bars = [
    { x: 12, pct: Math.min(30, undersizedPct * 0.4), color: '#60A5FA' },
    { x: 60, pct: Math.min(45, undersizedPct * 0.8), color: '#60A5FA' },
    { x: 108, pct: Math.min(95, gradeAPct * 0.65), color: '#16A34A' },
    { x: 156, pct: Math.min(100, gradeAPct * 0.95), color: '#16A34A' },
    { x: 204, pct: Math.min(85, gradeAPct * 0.70), color: '#16A34A' },
    { x: 252, pct: Math.min(35, oversizePct * 0.8), color: '#D97706' },
    { x: 300, pct: Math.min(20, oversizePct * 0.4), color: '#D97706' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('ai-detection-results')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white" style={{ fontSize: 20, letterSpacing: '-0.3px' }}>
              Size & Caliber Sizing
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {batchId} · Computer Vision Caliber Analysis
            </p>
          </div>
          <div
            style={{
              background: 'rgba(74,222,128,0.18)',
              border: '1px solid rgba(74,222,128,0.35)',
              borderRadius: 10,
              padding: '4px 10px',
            }}
          >
            <span style={{ color: '#4ADE80', fontSize: 11, fontWeight: 700 }}>AI ✓</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">

        {/* Reference image with measurement overlay */}
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
          style={{ height: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg, #0B2515 0%, #134D2B 100%)' }}
        >
          {inspectionData.capturedImage ? (
            <img
              src={inspectionData.capturedImage}
              alt={`${commodity} size measurement`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B2515]/90 text-center p-4">
              <div>
                <p className="text-[#4ADE80] font-mono text-[10px] font-bold mb-1">AI DIAMETER CALIBRATION</p>
                <p className="text-white font-extrabold text-sm">Average Diameter: {avgDiam} cm</p>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

          {/* Measurement SVG overlay */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 390 200"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Selected produce item circle */}
            <circle cx="195" cy="100" r="44" fill="transparent"
              stroke="#4ADE80" strokeWidth="2.5" strokeDasharray="8 4" />
            {/* Diameter measurement line */}
            <line x1="151" y1="100" x2="239" y2="100"
              stroke="#FACC15" strokeWidth="2" />
            <line x1="151" y1="92" x2="151" y2="108"
              stroke="#FACC15" strokeWidth="2" />
            <line x1="239" y1="92" x2="239" y2="108"
              stroke="#FACC15" strokeWidth="2" />
            {/* Diameter label */}
            <rect x="167" y="82" width="56" height="16" rx="4" fill="rgba(250,204,21,0.9)" />
            <text x="195" y="93" textAnchor="middle" fontSize="9" fontWeight="800"
              fontFamily="JetBrains Mono,monospace" fill="#1A1A0A">
              {avgDiam} cm
            </text>

            {/* Reference coin / caliber */}
            <circle cx="330" cy="155" r="16" fill="transparent" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <text x="330" y="159" textAnchor="middle" fontSize="7.5" fill="white" fontWeight="700" fontFamily="Outfit,sans-serif">REF</text>

            {/* REF label */}
            <rect x="312" y="135" width="38" height="14" rx="4" fill="rgba(0,0,0,0.6)" />
            <text x="331" y="145" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.85)" fontFamily="JetBrains Mono,monospace">50 mm</text>
          </svg>

          {/* Scan badge */}
          <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ruler size={14} color="#FACC15" strokeWidth={2} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              MEASURING — {totalCount} {commodity.toUpperCase()}S
            </span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3">
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Average Diameter</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#1A2F23', lineHeight: 1 }}>{avgDiam}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 3 }}>cm per unit</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: compliance >= 75 ? '#DCFCE7' : '#FEE2E2',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: 12, color: compliance >= 75 ? '#15803D' : '#DC2626', marginBottom: 4, fontWeight: 600 }}>
              Size Compliance
            </p>
            <p className="font-bold" style={{ fontSize: 30, color: compliance >= 75 ? '#15803D' : '#DC2626', lineHeight: 1 }}>
              {compliance}%
            </p>
            <p style={{ fontSize: 11.5, color: compliance >= 75 ? '#15803D' : '#DC2626', marginTop: 3 }}>
              meet Grade A size (≥ 4.5 cm)
            </p>
          </div>
        </div>

        {/* Histogram card */}
        <div
          className="mx-4 mt-3 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>Caliber Distribution Curve</h3>
            <span style={{ fontSize: 11, color: '#5E7468' }}>diameter (cm)</span>
          </div>

          <svg width="100%" height="100" viewBox="0 0 348 100" preserveAspectRatio="xMidYMax meet">
            {[0, 25, 50, 75, 100].map((g) => (
              <line key={g} x1="0" y1={100 - g} x2="348" y2={100 - g}
                stroke="#E2EBE5" strokeWidth="1" strokeDasharray="4 3" />
            ))}
            {bars.map((b, i) => {
              const h = (b.pct / 100) * 80;
              return (
                <rect
                  key={i}
                  x={b.x} y={100 - h - 8} width={34} height={Math.max(4, h)}
                  rx="5" fill={b.color} opacity="0.85"
                />
              );
            })}
            {['3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0'].map((label, i) => (
              <text key={label} x={12 + i * 48 + 17} y={98} textAnchor="middle"
                fontSize="7.5" fill="#8EA899" fontFamily="JetBrains Mono,monospace">
                {label}
              </text>
            ))}
            <line x1="192" y1="8" x2="192" y2="92" stroke="#1B6B3A" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="176" y="2" width="42" height="12" rx="3" fill="#1B6B3A" />
            <text x="197" y="11" textAnchor="middle" fontSize="7.5" fill="white" fontWeight="700" fontFamily="Outfit,sans-serif">
              Avg {avgDiam}
            </text>
          </svg>

          <div className="flex gap-3 mt-3 flex-wrap">
            {[
              { color: '#60A5FA', label: 'Undersized (< 4.5 cm)' },
              { color: '#16A34A', label: 'Grade A (4.5–6.5 cm)' },
              { color: '#D97706', label: 'Oversize (> 6.5 cm)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="rounded-sm" style={{ width: 11, height: 11, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: '#5E7468' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution breakdown */}
        <div
          className="mx-4 mt-3 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>
            Distribution Breakdown
          </h3>
          {distribution.map(({ range, pct, color, bg, label }) => (
            <div key={range} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold" style={{ fontSize: 14, color: '#1A2F23' }}>{range}</span>
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded font-semibold"
                    style={{ fontSize: 10, background: bg, color }}
                  >
                    {label}
                  </span>
                </div>
                <span className="font-bold" style={{ fontSize: 15, color }}>{pct}%</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 9, background: '#F4F7F5' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color, transition: 'width 0.8s ease' }}
                />
              </div>
            </div>
          ))}

          {/* APMC threshold note */}
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 mt-1"
            style={{ background: '#E8F5EE', border: '1px solid #C4DDD0' }}
          >
            <span style={{ fontSize: 14 }}>ℹ️</span>
            <p style={{ fontSize: 12, color: '#1B6B3A', lineHeight: 1.5 }}>
              APMC Grade A standard requires minimum{' '}
              <strong>45 mm (4.5 cm)</strong>. This batch avg is{' '}
              <strong>{Math.round(avgDiam * 10)} mm ({avgDiam} cm)</strong> — {compliance}% of {commodity.toLowerCase()}s meet the standard.
            </p>
          </div>
        </div>

        {/* Measurement method */}
        <div
          className="mx-4 mt-3 mb-4 rounded-2xl p-4"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <p className="font-bold mb-2" style={{ fontSize: 13.5, color: '#1A2F23' }}>
            Measurement Method
          </p>
          <p style={{ fontSize: 12.5, color: '#5E7468', lineHeight: 1.6 }}>
            AI vision measures each {commodity.toLowerCase()} diameter using calibrated reference scale markers in the capture frame. Measurements are computed per-item and cross-validated across the entire sample batch.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3" style={{ background: '#F4F7F5' }}>
        <button
          onClick={() => navigate('quality-assessment')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
          style={{
            height: 58,
            fontSize: 16,
            background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
            boxShadow: '0 4px 16px rgba(27,107,58,0.28)',
          }}
        >
          View Quality Assessment
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
