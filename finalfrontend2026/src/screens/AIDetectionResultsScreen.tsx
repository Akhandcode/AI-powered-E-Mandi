import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';

/* ── Sample data ─────────────────────────────────────────────── */
const TOTAL        = 20;
const HEALTHY      = 15;
const DAMAGED      = 2;
const ROTTEN       = 1;
const SPROUTED     = 1;
const UNDERSIZED   = 1;
const AVG_DIAM_CM  = 5.4;
const SIZE_COMP    = 90; // %

/* Bounding boxes placed across a 290×270 SVG viewport */
const boxes = [
  { id:  1, label: 'Healthy',    x: 10,  y: 10,  w: 54, h: 50, color: '#22C55E', tc: '#14532D' },
  { id:  2, label: 'Healthy',    x: 76,  y: 8,   w: 56, h: 52, color: '#22C55E', tc: '#14532D' },
  { id:  3, label: 'Damaged',    x: 145, y: 12,  w: 54, h: 50, color: '#F97316', tc: '#7C2D12' },
  { id:  4, label: 'Healthy',    x: 213, y: 10,  w: 52, h: 48, color: '#22C55E', tc: '#14532D' },
  { id:  5, label: 'Healthy',    x: 10,  y: 72,  w: 56, h: 52, color: '#22C55E', tc: '#14532D' },
  { id:  6, label: 'Healthy',    x: 78,  y: 70,  w: 54, h: 52, color: '#22C55E', tc: '#14532D' },
  { id:  7, label: 'Rotten',     x: 146, y: 74,  w: 54, h: 50, color: '#EF4444', tc: '#7F1D1D' },
  { id:  8, label: 'Healthy',    x: 214, y: 72,  w: 52, h: 50, color: '#22C55E', tc: '#14532D' },
  { id:  9, label: 'Healthy',    x: 10,  y: 134, w: 56, h: 52, color: '#22C55E', tc: '#14532D' },
  { id: 10, label: 'Damaged',    x: 78,  y: 132, w: 54, h: 52, color: '#F97316', tc: '#7C2D12' },
  { id: 11, label: 'Healthy',    x: 146, y: 136, w: 54, h: 50, color: '#22C55E', tc: '#14532D' },
  { id: 12, label: 'Healthy',    x: 214, y: 134, w: 52, h: 50, color: '#22C55E', tc: '#14532D' },
  { id: 13, label: 'Healthy',    x: 10,  y: 196, w: 56, h: 52, color: '#22C55E', tc: '#14532D' },
  { id: 14, label: 'Sprouted',   x: 78,  y: 198, w: 54, h: 50, color: '#FACC15', tc: '#713F12' },
  { id: 15, label: 'Healthy',    x: 146, y: 196, w: 54, h: 52, color: '#22C55E', tc: '#14532D' },
  { id: 16, label: 'Undersized', x: 218, y: 202, w: 38, h: 36, color: '#60A5FA', tc: '#1E3A5F' },
  { id: 17, label: 'Healthy',    x: 10,  y: 258, w: 56, h: 50, color: '#22C55E', tc: '#14532D' },
  { id: 18, label: 'Healthy',    x: 78,  y: 256, w: 54, h: 52, color: '#22C55E', tc: '#14532D' },
  { id: 19, label: 'Healthy',    x: 146, y: 260, w: 54, h: 48, color: '#22C55E', tc: '#14532D' },
  { id: 20, label: 'Healthy',    x: 212, y: 258, w: 52, h: 50, color: '#22C55E', tc: '#14532D' },
];

const categories = [
  { label: 'Healthy',    count: HEALTHY,    color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0', conf: 97 },
  { label: 'Damaged',    count: DAMAGED,    color: '#EA580C', bg: '#FFF3EB', border: '#FED7AA', conf: 93 },
  { label: 'Rotten',     count: ROTTEN,     color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', conf: 96 },
  { label: 'Sprouted',   count: SPROUTED,   color: '#CA8A04', bg: '#FEF9C3', border: '#FDE68A', conf: 91 },
  { label: 'Undersized', count: UNDERSIZED, color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE', conf: 88 },
];

const legend = [
  { label: 'Healthy',    color: '#22C55E' },
  { label: 'Damaged',    color: '#F97316' },
  { label: 'Rotten',     color: '#EF4444' },
  { label: 'Sprouted',   color: '#FACC15' },
  { label: 'Undersized', color: '#60A5FA' },
];

export default function AIDetectionResultsScreen() {
  const { navigate, inspectionData } = useApp();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('ai-analysis')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white" style={{ fontSize: 20, letterSpacing: '-0.3px' }}>
              AI Detection Results
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              APMC-NAS-4722 · Computer vision scan
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

        {/* Hero stat strip */}
        <div className="grid grid-cols-2 gap-2 px-5 pb-5">
          <div
            style={{
              background: 'rgba(255,255,255,0.13)',
              borderRadius: 16, padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              ONIONS DETECTED
            </p>
            <p className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1 }}>{TOTAL}</p>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.13)',
              borderRadius: 16, padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
              AVG DIAMETER
            </p>
            <p className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1 }}>{AVG_DIAM_CM} <span style={{ fontSize: 13, fontWeight: 500 }}>cm</span></p>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-6">

        {/* Annotated image */}
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
          style={{ height: 290, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg, #0B2515 0%, #134D2B 100%)' }}
        >
          {inspectionData.capturedImage ? (
            <img
              src={inspectionData.capturedImage}
              alt="AI-annotated onion sample"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B2515]/90 text-center p-4">
              <div>
                <p className="text-[#4ADE80] font-mono text-[11px] font-bold mb-1">COMPUTER VISION BOUNDING MATRIX</p>
                <p className="text-white font-extrabold text-base">20 Sampled Items Detected</p>
                <p className="text-white/60 text-xs mt-1">Grade A Size Compliance: 90%</p>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />

          {/* Bounding boxes */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 280 320"
            preserveAspectRatio="xMidYMid slice"
          >
            {boxes.map((b) => {
              const labelW = b.label.length * 6.4 + 14;
              return (
                <g key={b.id}>
                  {/* Glow */}
                  <rect
                    x={b.x - 1} y={b.y - 1} width={b.w + 2} height={b.h + 2}
                    fill="transparent" stroke={b.color} strokeWidth="3" rx="6" opacity="0.3"
                  />
                  {/* Box */}
                  <rect
                    x={b.x} y={b.y} width={b.w} height={b.h}
                    fill="transparent" stroke={b.color} strokeWidth="1.8" rx="5"
                  />
                  {/* Label */}
                  <rect
                    x={b.x} y={b.y - 15} width={labelW} height={15}
                    fill={b.color} rx="3"
                  />
                  <text
                    x={b.x + 5} y={b.y - 5}
                    fill={b.tc} fontSize="7.5" fontWeight="800" fontFamily="Outfit,sans-serif"
                  >
                    {b.label}
                  </text>
                  {/* Onion ID */}
                  <text
                    x={b.x + b.w / 2} y={b.y + b.h - 5}
                    fill="rgba(255,255,255,0.85)" fontSize="6.5" fontWeight="700"
                    fontFamily="JetBrains Mono,monospace" textAnchor="middle"
                  >
                    #{b.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Scan complete badge */}
          <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              SCAN COMPLETE — {TOTAL} DETECTED
            </span>
          </div>

          {/* Legend strip */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
            padding: '18px 10px 10px',
            display: 'flex', gap: 5, flexWrap: 'wrap',
          }}>
            {legend.map((l) => (
              <div key={l.label} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '3px 8px',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top metrics row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3">
          {/* Total detected */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Total Detected</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#1A2F23', lineHeight: 1 }}>{TOTAL}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 3 }}>onions in sample</p>
          </div>
          {/* Average diameter */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Avg Diameter</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#1A2F23', lineHeight: 1 }}>{AVG_DIAM_CM}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 3 }}>cm per onion</p>
          </div>
          {/* Healthy */}
          <div className="rounded-2xl p-4" style={{ background: '#DCFCE7', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#15803D', marginBottom: 4, fontWeight: 600 }}>Healthy</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#15803D', lineHeight: 1 }}>{HEALTHY}</p>
            <p style={{ fontSize: 11.5, color: '#15803D', marginTop: 3 }}>
              {Math.round((HEALTHY / TOTAL) * 100)}% of total
            </p>
          </div>
          {/* Defective total */}
          <div className="rounded-2xl p-4" style={{ background: '#FDECEA', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 4, fontWeight: 600 }}>Defective</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#C0392B', lineHeight: 1 }}>
              {TOTAL - HEALTHY}
            </p>
            <p style={{ fontSize: 11.5, color: '#C0392B', marginTop: 3 }}>
              {Math.round(((TOTAL - HEALTHY) / TOTAL) * 100)}% of total
            </p>
          </div>
        </div>

        {/* ── Per-category breakdown ──────────────────────────── */}
        <div
          className="mx-4 mt-3 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>
            Detection Breakdown
          </h3>

          {categories.map((cat) => {
            const pct = Math.round((cat.count / TOTAL) * 100);
            return (
              <div key={cat.label} className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="rounded-lg flex items-center justify-center"
                    style={{
                      width: 34, height: 34,
                      background: cat.bg, border: `1.5px solid ${cat.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <div className="rounded-full" style={{ width: 11, height: 11, background: cat.color }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ fontSize: 14, color: '#1A2F23' }}>{cat.label}</p>
                    <p style={{ fontSize: 11, color: '#8EA899' }}>
                      {pct}% · <span style={{ fontFamily: 'var(--font-mono)' }}>{cat.conf}%</span> conf.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ width: 72, height: 7, background: '#F4F7F5' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                  <span className="font-bold" style={{ fontSize: 16, color: cat.color, minWidth: 20, textAlign: 'right' }}>
                    {cat.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Size compliance ─────────────────────────────────── */}
        <div
          className="mx-4 mt-3 mb-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>Size Compliance</h3>
            <span className="font-bold" style={{ fontSize: 18, color: SIZE_COMP >= 75 ? '#16A34A' : '#DC2626' }}>
              {SIZE_COMP}%
            </span>
          </div>

          {/* Stacked bar */}
          <div
            className="rounded-full overflow-hidden flex mb-3"
            style={{ height: 22 }}
          >
            <div
              style={{
                width: `${SIZE_COMP}%`,
                background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>
                {Math.round(TOTAL * SIZE_COMP / 100)} ≥ 4.5 cm
              </span>
            </div>
            <div
              style={{
                flex: 1,
                background: '#BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>
                {TOTAL - Math.round(TOTAL * SIZE_COMP / 100)} &lt; 4.5 cm
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="rounded-sm" style={{ width: 12, height: 12, background: '#16A34A' }} />
              <span style={{ fontSize: 12, color: '#5E7468' }}>Grade A size (≥ 4.5 cm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="rounded-sm" style={{ width: 12, height: 12, background: '#BFDBFE' }} />
              <span style={{ fontSize: 12, color: '#5E7468' }}>Below standard</span>
            </div>
          </div>

          <div
            className="flex items-start gap-2 rounded-xl p-3 mt-3"
            style={{ background: '#F4F7F5', border: '1px solid #E2EBE5' }}
          >
            <span style={{ fontSize: 13 }}>ℹ️</span>
            <p style={{ fontSize: 12, color: '#5E7468', lineHeight: 1.5 }}>
              APMC Grade A threshold requires minimum diameter of{' '}
              <strong style={{ color: '#1A2F23' }}>4.5 cm (45 mm)</strong>.
              Average diameter in this sample is{' '}
              <strong style={{ color: '#1A2F23' }}>{AVG_DIAM_CM} cm</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="px-5 pb-8 pt-3" style={{ background: '#F4F7F5' }}>
        <button
          onClick={() => navigate('size-measurement')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
          style={{
            height: 58,
            fontSize: 16,
            background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
            boxShadow: '0 4px 16px rgba(27,107,58,0.28)',
          }}
        >
          View Size Measurement
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
