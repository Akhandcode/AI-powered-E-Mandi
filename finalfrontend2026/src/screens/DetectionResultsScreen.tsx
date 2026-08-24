import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';

const detections = [
  { id: 1, label: 'Healthy', x: 22, y: 42, w: 62, h: 58, color: '#4ADE80', status: 'healthy' },
  { id: 2, label: 'Healthy', x: 98, y: 32, w: 68, h: 64, color: '#4ADE80', status: 'healthy' },
  { id: 3, label: 'Damaged', x: 178, y: 45, w: 64, h: 60, color: '#FCA5A5', status: 'damaged' },
  { id: 4, label: 'Healthy', x: 32, y: 120, w: 66, h: 62, color: '#4ADE80', status: 'healthy' },
  { id: 5, label: 'Rotten', x: 112, y: 114, w: 70, h: 66, color: '#F87171', status: 'rotten' },
  { id: 6, label: 'Healthy', x: 192, y: 122, w: 60, h: 56, color: '#4ADE80', status: 'healthy' },
  { id: 7, label: 'Sprouted', x: 50, y: 200, w: 64, h: 60, color: '#FCD34D', status: 'sprouted' },
  { id: 8, label: 'Healthy', x: 130, y: 196, w: 68, h: 64, color: '#4ADE80', status: 'healthy' },
  { id: 9, label: 'Undersized', x: 210, y: 206, w: 42, h: 38, color: '#93C5FD', status: 'undersized' },
];

const legend = [
  { label: 'Healthy', color: '#4ADE80', bg: '#DCFCE7' },
  { label: 'Damaged', color: '#F87171', bg: '#FDECEA' },
  { label: 'Rotten', color: '#EF4444', bg: '#FEE2E2' },
  { label: 'Sprouted', color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Undersized', color: '#60A5FA', bg: '#DBEAFE' },
];

export default function DetectionResultsScreen() {
  const { navigate, inspectionData } = useApp();

  const healthy = detections.filter((d) => d.status === 'healthy').length;
  const defective = detections.length - healthy;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('camera')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontSize: 20 }}>Detection Results</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>APMC-NAS-4722 · 9 onions</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Annotated image */}
        <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-md" style={{ height: 260, background: 'linear-gradient(135deg, #0B2515 0%, #134D2B 100%)' }}>
          {inspectionData.capturedImage ? (
            <img
              src={inspectionData.capturedImage}
              alt="Detected onions"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B2515]/90 text-center p-4">
              <div>
                <p className="text-[#4ADE80] font-mono text-[10px] font-bold mb-1">BOUNDING MATRIX DETECTED</p>
                <p className="text-white font-extrabold text-sm">9 Sampled Items Assessed</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.2)' }} />
          {/* Bounding boxes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 290 290" preserveAspectRatio="xMidYMid slice">
            {detections.map((d) => (
              <g key={d.id}>
                <rect
                  x={d.x} y={d.y} width={d.w} height={d.h}
                  fill="transparent"
                  stroke={d.color}
                  strokeWidth="2"
                  rx="6"
                />
                <rect
                  x={d.x} y={d.y - 16} width={Math.max(d.label.length * 7 + 10, 60)} height={16}
                  fill={d.color}
                  rx="3"
                />
                <text
                  x={d.x + 5} y={d.y - 5}
                  fill="black"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="Outfit, sans-serif"
                >
                  {d.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {legend.map((l) => (
              <div
                key={l.label}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.65)' }}
              >
                <div className="rounded-full" style={{ width: 7, height: 7, background: l.color }} />
                <span className="text-white font-medium" style={{ fontSize: 10 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Total Detected</p>
            <p className="font-bold" style={{ fontSize: 28, color: '#1A2F23', lineHeight: 1 }}>{detections.length}</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 2 }}>onions in sample</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <p style={{ fontSize: 12, color: '#5E7468', marginBottom: 4 }}>Avg Diameter</p>
            <p className="font-bold" style={{ fontSize: 28, color: '#1A2F23', lineHeight: 1 }}>52</p>
            <p style={{ fontSize: 11.5, color: '#5E7468', marginTop: 2 }}>mm per onion</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: '#DCFCE7', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <p style={{ fontSize: 12, color: '#15803D', marginBottom: 4, fontWeight: 600 }}>Healthy</p>
            <p className="font-bold" style={{ fontSize: 28, color: '#15803D', lineHeight: 1 }}>{healthy}</p>
            <p style={{ fontSize: 11.5, color: '#15803D', marginTop: 2 }}>
              {Math.round((healthy / detections.length) * 100)}% of total
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: '#FDECEA', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
          >
            <p style={{ fontSize: 12, color: '#C0392B', marginBottom: 4, fontWeight: 600 }}>Defective</p>
            <p className="font-bold" style={{ fontSize: 28, color: '#C0392B', lineHeight: 1 }}>{defective}</p>
            <p style={{ fontSize: 11.5, color: '#C0392B', marginTop: 2 }}>
              {Math.round((defective / detections.length) * 100)}% of total
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div
          className="mx-4 mt-4 rounded-2xl p-5"
          style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold mb-4" style={{ fontSize: 15, color: '#1A2F23' }}>
            Detection Breakdown
          </h3>
          {[
            { label: 'Healthy', count: 5, color: '#15803D', bg: '#DCFCE7' },
            { label: 'Damaged', count: 1, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Rotten', count: 1, color: '#C0392B', bg: '#FDECEA' },
            { label: 'Sprouted', count: 1, color: '#B45309', bg: '#FEF3C7' },
            { label: 'Undersized', count: 1, color: '#1D4ED8', bg: '#DBEAFE' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, background: item.bg }}>
                  <div className="rounded-full" style={{ width: 10, height: 10, background: item.color }} />
                </div>
                <span className="font-medium" style={{ fontSize: 14, color: '#1A2F23' }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full overflow-hidden" style={{ width: 80, height: 6, background: '#F4F7F5' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.count / detections.length) * 100}%`, background: item.color }}
                  />
                </div>
                <span className="font-bold" style={{ fontSize: 14, color: item.color, minWidth: 14 }}>
                  {item.count}
                </span>
              </div>
            </div>
          ))}
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
