import { useEffect } from 'react';
import { useApp } from '../context';
import OnionLogo from '../components/OnionLogo';

export default function SplashScreen() {
  const { navigate } = useApp();

  useEffect(() => {
    const t = setTimeout(() => navigate('login'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(165deg, #0D2B18 0%, #1B5E38 40%, #1B6B3A 70%, #2A7A48 100%)',
      }}
    >
      {/* Subtle grain texture via SVG */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[320, 240, 160].map((s, i) => (
          <div
            key={s}
            className="absolute rounded-full"
            style={{
              width: s, height: s,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ))}
      </div>

      {/* Top spacing */}
      <div style={{ height: 56 }} />

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo container */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-3xl blur-2xl"
            style={{ background: 'rgba(74,222,128,0.15)', transform: 'scale(1.2)' }}
          />
          <div
            className="relative flex items-center justify-center rounded-3xl"
            style={{
              width: 108,
              height: 108,
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.14)',
            }}
          >
            <OnionLogo size={72} />
          </div>
        </div>

        {/* App name */}
        <h1
          className="text-white font-bold text-center"
          style={{ fontSize: 34, letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: 8 }}
        >
          OnionGuard AI
        </h1>
        <p
          className="text-center font-medium"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, letterSpacing: '0.1px', marginBottom: 48 }}
        >
          Objective Grading. Transparent Procurement.
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-xs">
          {[
            { icon: '🎯', text: 'AI-Powered Quality Detection' },
            { icon: '📊', text: 'Instant Grade A & URS Reports' },
            { icon: '🔒', text: 'Blockchain-Verified Certificates' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span className="font-medium text-white" style={{ fontSize: 13.5, opacity: 0.8 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="pb-10 px-8 flex flex-col items-center gap-4">
        {/* Loading bar */}
        <div
          className="rounded-full overflow-hidden"
          style={{ width: 120, height: 3, background: 'rgba(255,255,255,0.12)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4ADE80, #1B6B3A)',
              animation: 'loadbar 2.8s ease-in-out forwards',
            }}
          />
        </div>

        {/* SIH branding */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex gap-0.5">
            {['#FF9933', '#FFFFFF', '#138808'].map((c) => (
              <div key={c} className="rounded-sm" style={{ width: 4, height: 16, background: c }} />
            ))}
          </div>
          <div>
            <p className="font-bold text-white" style={{ fontSize: 11, letterSpacing: '0.5px' }}>
              Smart India Hackathon 2026
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
              Ministry of Agriculture & Farmers Welfare
            </p>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10.5 }}>
          v2.4.1 · Secured by APMC · India
        </p>
      </div>

      <style>{`
        @keyframes loadbar {
          0% { width: 0%; }
          20% { width: 15%; }
          50% { width: 55%; }
          80% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
