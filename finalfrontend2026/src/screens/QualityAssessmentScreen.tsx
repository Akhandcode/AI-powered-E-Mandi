import { ArrowLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';

function ProgressBar({ value, color, bg }: { value: number; color: string; bg: string }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ height: 8, background: bg }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: color, transition: 'width 0.8s ease' }}
      />
    </div>
  );
}

export default function QualityAssessmentScreen() {
  const { navigate, inspectionData, assessmentResult } = useApp();

  const commodity = inspectionData.commodity || 'Onion';
  const commodityPlural = `${commodity.toLowerCase()}s`;

  const gradeA = assessmentResult ? assessmentResult.grade_a_percentage : 0;
  const urs = assessmentResult ? assessmentResult.urs_percentage : 0;
  const lqi = assessmentResult ? Math.round(assessmentResult.lqi_score) : 0;

  const damagedPct = assessmentResult ? assessmentResult.damaged_pct : 0;
  const rottenPct = assessmentResult ? assessmentResult.rotten_pct : 0;
  const sproutedPct = assessmentResult ? assessmentResult.sprouted_pct : 0;
  const undersizedPct = assessmentResult ? assessmentResult.undersized_pct : 0;

  const passed = gradeA >= 75;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>

      {/* ── Extended hero header ─────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #0D3D20 0%, #134D2B 45%, #1B6B3A 100%)', flexShrink: 0 }}>
        <StatusBar dark />

        {/* Nav bar */}
        <div className="px-5 pt-1 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate('size-measurement')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white" style={{ fontSize: 18 }}>Quality Assessment</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11.5 }}>
              {inspectionData.batchId || 'APMC-NAS-4722'} · {inspectionData.variety || `${commodity} Standard`}
            </p>
          </div>
          <div
            style={{
              background: passed ? 'rgba(74,222,128,0.18)' : 'rgba(239,68,68,0.18)',
              border: `1px solid ${passed ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: 10, padding: '4px 10px',
            }}
          >
            <span style={{ color: passed ? '#4ADE80' : '#FCA5A5', fontSize: 11, fontWeight: 700 }}>
              {passed ? 'PASSED' : 'URS HEAVY'}
            </span>
          </div>
        </div>

        {/* ── Primary result block ──── */}
        <div className="px-5 pb-6">
          {/* Grade A hero row */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>
                APMC GRADE
              </p>
              <p
                className="font-bold"
                style={{ fontSize: 56, color: 'white', lineHeight: 1, letterSpacing: '-2px' }}
              >
                {gradeA >= 75 ? 'A' : gradeA >= 55 ? 'B' : 'C'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-bold"
                  style={{ fontSize: 26, color: passed ? '#4ADE80' : '#FCA57B', letterSpacing: '-0.5px', lineHeight: 1 }}
                >
                  {gradeA}%
                </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>qualifying {commodityPlural}</span>
              </div>
            </div>

            {/* Score ring */}
            <div style={{ position: 'relative', width: 88, height: 88 }}>
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
                <circle
                  cx="44" cy="44" r="38" fill="none"
                  stroke={passed ? '#4ADE80' : '#FCA57B'} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${(lqi / 100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                  transform="rotate(-90 44 44)"
                />
              </svg>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ gap: 0 }}
              >
                <span className="font-bold text-white" style={{ fontSize: 22, lineHeight: 1 }}>{lqi}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9.5 }}>/ 100</span>
              </div>
            </div>
          </div>

          {/* Grade A vs URS pills */}
          <div
            className="rounded-2xl overflow-hidden flex"
            style={{ height: 48, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
          >
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: `${Math.max(15, gradeA)}%`, background: 'rgba(74,222,128,0.18)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="font-bold text-white" style={{ fontSize: 17, lineHeight: 1 }}>{gradeA}%</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 600 }}>GRADE A</span>
            </div>
            <div
              className="flex flex-col items-center justify-center flex-1"
              style={{ background: 'rgba(232,101,10,0.22)' }}
            >
              <span className="font-bold" style={{ fontSize: 17, color: '#FCA57B', lineHeight: 1 }}>{urs}%</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600 }}>URS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-6">

        {/* Defect breakdown */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>Defect Breakdown</h3>
          {[
            { label: 'Surface Damage', value: damagedPct,  color: '#D97706', bg: '#FFFBEB' },
            { label: `Rotten ${commodityPlural}`,  value: rottenPct,   color: '#C0392B', bg: '#FDECEA' },
            { label: 'Sprouted / Blemished',       value: sproutedPct, color: '#B45309', bg: '#FEF3C7' },
            { label: 'Undersized',     value: undersizedPct, color: '#2563EB', bg: '#DBEAFE' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md" style={{ width: 28, height: 28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div className="rounded-full" style={{ width: 10, height: 10, background: color }} />
                  </div>
                  <span className="font-medium" style={{ fontSize: 14, color: '#1A2F23' }}>{label}</span>
                </div>
                <span className="font-bold" style={{ fontSize: 14, color }}>{value}% defective</span>
              </div>
              <ProgressBar value={Math.min(value * 4, 100)} color={color} bg={bg} />
            </div>
          ))}

          {/* Size compliance row */}
          <div style={{ borderTop: '1px solid #F4F7F5', paddingTop: 14, marginTop: 2 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-md" style={{ width: 28, height: 28, background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="rounded-full" style={{ width: 10, height: 10, background: '#1B6B3A' }} />
                </div>
                <span className="font-medium" style={{ fontSize: 14, color: '#1A2F23' }}>Grade A Compliance</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#1B6B3A' }}>{gradeA}% compliant</span>
            </div>
            <ProgressBar value={gradeA} color="#1B6B3A" bg="#E8F5EE" />
          </div>
        </div>

        {/* Why this grade */}
        <div
          className="mx-4 mt-3 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 28, height: 28, background: '#E8F5EE' }}
            >
              <span style={{ fontSize: 14 }}>🧠</span>
            </div>
            <h3 className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>Why this grade?</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { text: `${gradeA}% of sample meets sound & standard quality parameters`, ok: gradeA >= 50 },
              { text: `Surface damage rate: ${damagedPct}%`, ok: damagedPct <= 10 },
              { text: `Rotten/spoilage rate: ${rottenPct}%`, ok: rottenPct <= 5 },
              { text: assessmentResult?.recommended_channel ? `Recommended channel: ${assessmentResult.recommended_channel}` : 'Calculated based on Bayesian Dirichlet lot estimator', ok: true },
              { text: undersizedPct > 5 ? `${undersizedPct}% undersized units detected — recommend grading before dispatch` : 'Standard sizing compliance satisfied', ok: undersizedPct <= 5 },
            ].map(({ text, ok }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: ok ? '#F0FDF4' : '#FFFBEB' }}
              >
                {ok ? (
                  <CheckCircle size={16} strokeWidth={2.5} style={{ color: '#15803D', flexShrink: 0, marginTop: 1 }} />
                ) : (
                  <AlertTriangle size={16} strokeWidth={2.5} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                )}
                <span style={{ fontSize: 13, color: ok ? '#166534' : '#92400E', lineHeight: 1.4 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* APMC compliance banner */}
        <div
          className="mx-4 mt-3 mb-4 flex items-center gap-3 rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, #134D2B, #1B6B3A)', boxShadow: '0 2px 12px rgba(27,107,58,0.25)' }}
        >
          <div
            className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
            style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.18)', fontSize: 18 }}
          >
            {passed ? '✓' : '!'}
          </div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: 13.5 }}>
              APMC Grade Standard: {passed ? 'Passed (Grade A)' : 'Standard / URS Grade'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.5, marginTop: 2 }}>
              {passed
                ? 'Meets minimum Grade A threshold of 75% required under MSAMB/DoCA guidelines.'
                : 'Allocated for spot wholesale or processing industry based on optimal net returns.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3" style={{ background: '#F4F7F5' }}>
        <button
          onClick={() => navigate('final-report')}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white"
          style={{
            height: 58,
            fontSize: 16,
            background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
            boxShadow: '0 4px 16px rgba(27,107,58,0.28)',
          }}
        >
          Generate Final Report
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
