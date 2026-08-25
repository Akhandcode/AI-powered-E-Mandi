import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, RefreshCw, AlertTriangle, Camera } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';
import { detectProduceInImage, DetectionAnalysisResult } from '../utils/produceDetector';

export default function AIDetectionResultsScreen() {
  const { navigate, inspectionData, setAssessmentResult } = useApp();
  const [analyzing, setAnalyzing] = useState(true);
  const [results, setResults] = useState<DetectionAnalysisResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function runDetection() {
      setAnalyzing(true);
      const res = await detectProduceInImage(
        inspectionData.capturedImage || undefined,
        inspectionData.commodity || 'Onion'
      );

      if (!isMounted) return;

      setResults(res);
      setAnalyzing(false);

      // Synchronize with global AppContext for subsequent screens
      setAssessmentResult({
        sample_count: res.total,
        grade_a_percentage: res.gradeAPercentage,
        urs_percentage: res.ursPercentage,
        fresh_pct: res.total > 0 ? Math.round((res.healthy / res.total) * 100) : 0,
        damaged_pct: res.total > 0 ? Math.round((res.damaged / res.total) * 100) : 0,
        rotten_pct: res.total > 0 ? Math.round((res.rotten / res.total) * 100) : 0,
        sprouted_pct: res.total > 0 ? Math.round((res.sprouted / res.total) * 100) : 0,
        undersized_pct: res.total > 0 ? Math.round((res.undersized / res.total) * 100) : 0,
        lqi_score: res.lqiScore,
        avg_diam: res.avgDiam,
        size_compliance: res.sizeComp,
        boxes: res.boxes,
      });
    }

    runDetection();

    return () => {
      isMounted = false;
    };
  }, [inspectionData.capturedImage, inspectionData.commodity]);

  const commodity = inspectionData.commodity || 'Onion';
  const total = results?.total || 0;
  const healthy = results?.healthy ?? 0;
  const damaged = results?.damaged ?? 0;
  const rotten = results?.rotten ?? 0;
  const sprouted = results?.sprouted ?? 0;
  const undersized = results?.undersized ?? 0;
  const avgDiam = results?.avgDiam ?? 0;
  const sizeComp = results?.sizeComp ?? 0;
  const boxes = results?.boxes && results.boxes.length > 0 ? results.boxes : [];
  const categories = results?.categories || [];
  const legend = results?.legend || [
    { label: 'Healthy', color: '#22C55E' },
    { label: 'Damaged', color: '#F97316' },
    { label: 'Rotten', color: '#EF4444' },
    { label: 'Sprouted', color: '#FACC15' },
    { label: 'Undersized', color: '#60A5FA' },
  ];

  const hasProduce = total > 0;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('capture-sample')}
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
              {inspectionData.batchId || 'APMC-NAS-4722'} · Multi-Produce Vision Scan
            </p>
          </div>
          <div
            style={{
              background: hasProduce ? 'rgba(74,222,128,0.18)' : 'rgba(239,68,68,0.25)',
              border: `1px solid ${hasProduce ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: 10,
              padding: '4px 10px',
            }}
          >
            <span style={{ color: hasProduce ? '#4ADE80' : '#FCA5A5', fontSize: 11, fontWeight: 700 }}>
              {hasProduce ? 'AI ✓' : 'NO PRODUCE'}
            </span>
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
              {commodity.toUpperCase()}S DETECTED
            </p>
            <p className="font-bold text-white flex items-center gap-2" style={{ fontSize: 26, lineHeight: 1 }}>
              {analyzing ? <RefreshCw size={22} className="animate-spin text-[#4ADE80]" /> : total}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>units</span>
            </p>
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
            <p className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1 }}>
              {avgDiam > 0 ? avgDiam : '—'} <span style={{ fontSize: 13, fontWeight: 500 }}>{avgDiam > 0 ? 'cm' : ''}</span>
            </p>
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
              alt="AI-annotated produce sample"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B2515]/90 text-center p-4">
              <div>
                <p className="text-[#4ADE80] font-mono text-[11px] font-bold mb-1">COMPUTER VISION BOUNDING MATRIX</p>
                <p className="text-white font-extrabold text-base">Sample Batch Analysis</p>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />

          {/* Bounding boxes (only shown if genuine produce is detected) */}
          {hasProduce && (
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
                      x={b.x} y={Math.max(12, b.y - 15)} width={labelW} height={15}
                      fill={b.color} rx="3"
                    />
                    <text
                      x={b.x + 5} y={Math.max(22, b.y - 5)}
                      fill={b.tc} fontSize="7.5" fontWeight="800" fontFamily="Outfit,sans-serif"
                    >
                      {b.label}
                    </text>
                    {/* Produce ID */}
                    <text
                      x={b.x + b.w / 2} y={b.y + b.h - 5}
                      fill="rgba(255,255,255,0.9)" fontSize="6.5" fontWeight="700"
                      fontFamily="JetBrains Mono,monospace" textAnchor="middle"
                    >
                      #{b.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Non-Produce Warning Overlay */}
          {!hasProduce && !analyzing && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mb-3 text-amber-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-white font-extrabold text-base mb-1">No Produce Detected</h3>
              <p className="text-white/80 text-xs max-w-xs mb-4 leading-relaxed">
                The image appears to be an ID card, text document, or non-produce photo. Please upload a clear photo of your <strong>{commodity}</strong> batch.
              </p>
              <button
                onClick={() => navigate('capture-sample')}
                className="px-5 py-2.5 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Camera size={16} />
                Retake / Upload Produce Photo
              </button>
            </div>
          )}

          {/* Scan complete badge */}
          {hasProduce && (
            <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                SCAN COMPLETE — {total} {commodity.toUpperCase()}S DETECTED
              </span>
            </div>
          )}

          {/* Legend strip */}
          {hasProduce && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              padding: '18px 10px 10px',
              display: 'flex', gap: 5, flexWrap: 'wrap',
            }}>
              {legend.map((l) => (
                <div key={l.label} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '3px 8px',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top metrics row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3">
          {/* Total detected */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Total Detected</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#1A2F23', lineHeight: 1 }}>{total}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 3 }}>units in sample batch</p>
          </div>
          {/* Average diameter */}
          <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Avg Diameter</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#1A2F23', lineHeight: 1 }}>{avgDiam}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 3 }}>cm per unit</p>
          </div>
          {/* Healthy */}
          <div className="rounded-2xl p-4" style={{ background: '#DCFCE7', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#15803D', marginBottom: 4, fontWeight: 600 }}>Healthy (Grade A)</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#15803D', lineHeight: 1 }}>{healthy}</p>
            <p style={{ fontSize: 11.5, color: '#15803D', marginTop: 3 }}>
              {hasProduce ? Math.round((healthy / total) * 100) : 0}% of total
            </p>
          </div>
          {/* Defective total */}
          <div className="rounded-2xl p-4" style={{ background: '#FDECEA', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 4, fontWeight: 600 }}>Defective (URS)</p>
            <p className="font-bold" style={{ fontSize: 30, color: '#C0392B', lineHeight: 1 }}>
              {total - healthy}
            </p>
            <p style={{ fontSize: 11.5, color: '#C0392B', marginTop: 3 }}>
              {hasProduce ? Math.round(((total - healthy) / total) * 100) : 0}% of total
            </p>
          </div>
        </div>

        {/* ── Per-category breakdown ──────────────────────────── */}
        {hasProduce && (
          <div
            className="mx-4 mt-3 rounded-2xl p-5"
            style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>
              AI Defect & Quality Breakdown
            </h3>

            {categories.map((cat) => {
              const pct = hasProduce ? Math.round((cat.count / total) * 100) : 0;
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
        )}

        {/* ── Size compliance ─────────────────────────────────── */}
        {hasProduce && (
          <div
            className="mx-4 mt-3 mb-4 rounded-2xl p-5"
            style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>Size Compliance</h3>
              <span className="font-bold" style={{ fontSize: 18, color: sizeComp >= 75 ? '#16A34A' : '#DC2626' }}>
                {sizeComp}%
              </span>
            </div>

            {/* Stacked bar */}
            <div
              className="rounded-full overflow-hidden flex mb-3"
              style={{ height: 22 }}
            >
              <div
                style={{
                  width: `${sizeComp}%`,
                  background: 'linear-gradient(90deg, #16A34A, #22C55E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>
                  {Math.round(total * sizeComp / 100)} ≥ 4.5 cm
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
                  {total - Math.round(total * sizeComp / 100)} &lt; 4.5 cm
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
          </div>
        )}
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="px-5 pb-8 pt-3" style={{ background: '#F4F7F5' }}>
        {hasProduce ? (
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
        ) : (
          <button
            onClick={() => navigate('capture-sample')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
            style={{
              height: 58,
              fontSize: 16,
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              boxShadow: '0 4px 16px rgba(217,119,6,0.28)',
            }}
          >
            <Camera size={20} />
            Retake / Upload Real Produce Photo
          </button>
        )}
      </div>
    </div>
  );
}
