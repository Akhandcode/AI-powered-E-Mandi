import { ArrowLeft, Zap, Image, RotateCcw, Circle, Scan } from 'lucide-react';
import { useApp } from '../context';

export default function CameraScreen() {
  const { navigate, inspectionData } = useApp();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0D1F14' }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <span className="text-white text-xs font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="text-white opacity-70 text-xs">●●●</div>
        </div>
      </div>

      {/* Top controls */}
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={() => navigate('new-inspection')}
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
        >
          <ArrowLeft size={20} strokeWidth={2} className="text-white" />
        </button>
        <div>
          <p className="text-white font-bold text-center" style={{ fontSize: 15 }}>Capture Sample</p>
          <p className="text-center" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
            {inspectionData.batchId || 'APMC-NAS-4722'}
          </p>
        </div>
        <button
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
        >
          <Zap size={20} strokeWidth={1.8} className="text-white" />
        </button>
      </div>

      {/* Camera viewfinder */}
      <div className="relative flex-1 mx-3 rounded-2xl overflow-hidden bg-gradient-to-b from-[#0B2515] to-[#0D1F14] flex items-center justify-center">
        {inspectionData.capturedImage ? (
          <img
            src={inspectionData.capturedImage}
            alt="Sample preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <Scan size={44} className="text-[#4ADE80] mb-3 animate-pulse" />
            <p className="text-white font-bold text-sm">AI Camera Viewfinder Active</p>
            <p className="text-white/50 text-xs mt-1">Position sample in frame</p>
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.3)' }} />

        {/* Detection boundary guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="relative"
            style={{
              width: 280,
              height: 280,
              border: '2.5px solid rgba(74, 222, 128, 0.9)',
              borderRadius: 20,
            }}
          >
            {/* Corner accents */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 ${cls}`}
                style={{ borderColor: '#4ADE80', margin: -2 }}
              />
            ))}

            {/* Reference size marker */}
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            >
              <div className="rounded-full border border-white opacity-80" style={{ width: 12, height: 12 }} />
              <span className="text-white font-bold" style={{ fontSize: 10 }}>REF: 50mm</span>
            </div>

            {/* Count badge */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full"
              style={{ background: '#1B6B3A', whiteSpace: 'nowrap' }}
            >
              <span className="text-white font-bold" style={{ fontSize: 12 }}>
                8 onions detected
              </span>
            </div>
          </div>
        </div>

        {/* Instruction banner */}
        <div
          className="absolute bottom-8 left-4 right-4 rounded-xl py-2.5 px-4 text-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <p className="text-white font-medium" style={{ fontSize: 12.5 }}>
            Place onions inside the marked area for accurate detection
          </p>
        </div>
      </div>

      {/* Camera controls */}
      <div className="px-6 pt-5 pb-8">
        <div className="flex items-center justify-around">
          {/* Gallery */}
          <button
            onClick={() => navigate('capture-sample')}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
            >
              <Image size={22} strokeWidth={1.8} className="text-white" />
            </div>
            <span className="text-white font-medium" style={{ fontSize: 11, opacity: 0.7 }}>Gallery</span>
          </button>

          {/* Capture */}
          <button
            onClick={() => navigate('ai-analysis')}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 76,
              height: 76,
              background: 'white',
              boxShadow: '0 0 0 5px rgba(255,255,255,0.2), 0 0 0 10px rgba(255,255,255,0.1)',
            }}
          >
            <div className="rounded-full flex items-center justify-center" style={{ width: 62, height: 62, background: '#1B6B3A' }}>
              <Circle size={28} fill="white" strokeWidth={0} />
            </div>
          </button>

          {/* Flip */}
          <button className="flex flex-col items-center gap-1.5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
            >
              <RotateCcw size={22} strokeWidth={1.8} className="text-white" />
            </div>
            <span className="text-white font-medium" style={{ fontSize: 11, opacity: 0.7 }}>Flip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
