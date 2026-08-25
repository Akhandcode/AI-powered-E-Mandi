import { useEffect, useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { useApp } from '../context';
import OnionLogo from '../components/OnionLogo';
import { runAIAssessment } from '../services/api';

export default function AIAnalysisScreen() {
  const { navigate, inspectionData, activeLotId, setAssessmentResult } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const commodity = inspectionData.commodity || 'Produce';

  const steps = [
    `Detecting ${commodity.toLowerCase()} items`,
    'Measuring caliber & diameter',
    'Classifying defects (rot, sprouts, cuts)',
    'Computing Bayesian Dirichlet lot inference',
    'Calculating Grade A & URS compliance',
    'Generating tamper-evident cryptographic report',
  ];

  useEffect(() => {
    // Run backend AI assessment if active lot exists
    if (activeLotId) {
      runAIAssessment(activeLotId, 40, true)
        .then((res) => {
          setAssessmentResult(res);
        })
        .catch((err) => {
          console.warn('Backend live assessment fallback:', err);
        });
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2.0;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => navigate('ai-detection-results'), 500);
          return 100;
        }
        return next;
      });
    }, 55);

    return () => clearInterval(interval);
  }, [navigate, activeLotId, setAssessmentResult]);

  useEffect(() => {
    setCurrentStep(Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1));
  }, [progress, steps.length]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 60%, #2E8B57 100%)' }}
    >
      {/* Background circles */}
      <div
        className="absolute rounded-full opacity-10"
        style={{ width: 500, height: 500, border: '1px solid white', top: -100, right: -150 }}
      />
      <div
        className="absolute rounded-full opacity-5"
        style={{ width: 300, height: 300, border: '1px solid white', bottom: -50, left: -80 }}
      />

      {/* Logo */}
      <div
        className="flex items-center justify-center rounded-3xl mb-6"
        style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.12)' }}
      >
        <OnionLogo size={52} />
      </div>

      <h2 className="font-bold text-white mb-1.5" style={{ fontSize: 22, letterSpacing: '-0.4px' }}>
        Analyzing Sample…
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, marginBottom: 40 }}>
        AI model processing {commodity} batch ({inspectionData.batchId || 'APMC-NAS-4722'})
      </p>

      {/* Circular progress */}
      <div className="relative mb-10">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-white" style={{ fontSize: 26, lineHeight: 1 }}>
            {Math.round(progress)}%
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Complete</span>
        </div>
      </div>

      {/* Steps */}
      <div
        className="w-full rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step} className="flex items-center gap-3">
                <div style={{ width: 22, height: 22, flexShrink: 0 }}>
                  {done ? (
                    <CheckCircle size={22} strokeWidth={2.5} style={{ color: '#4ADE80' }} />
                  ) : active ? (
                    <Loader size={22} strokeWidth={2} className="text-white" style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <div
                      className="rounded-full border"
                      style={{ width: 22, height: 22, borderColor: 'rgba(255,255,255,0.25)' }}
                    />
                  )}
                </div>
                <span
                  className="font-medium"
                  style={{
                    fontSize: 13.5,
                    color: done ? '#4ADE80' : active ? 'white' : 'rgba(255,255,255,0.35)',
                    transition: 'color 0.3s',
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
        Do not close the app during analysis
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
