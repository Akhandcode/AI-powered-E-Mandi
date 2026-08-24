import { useState, useRef } from 'react';
import { ArrowLeft, Zap, ZapOff, Image, Upload, CheckCircle2, Scan } from 'lucide-react';
import { useApp } from '../context';

export default function CaptureSampleScreen() {
  const { navigate, inspectionData, setInspectionData } = useApp();
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => navigate('ai-analysis'), 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setInspectionData({
          ...inspectionData,
          capturedImage: imageUrl,
        });
        setCaptured(true);
        setTimeout(() => navigate('ai-analysis'), 600);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0D1A10' }}>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Status & Controls */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1" style={{ height: 36 }}>
        <span className="text-xs font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <span className="text-white text-xs opacity-70">●●●</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={() => navigate('new-inspection')}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/12 border-none"
        >
          <ArrowLeft size={20} strokeWidth={2} color="white" />
        </button>

        <div className="text-center">
          <p className="text-white text-sm font-bold leading-tight">Capture / Upload Sample</p>
          <p className="text-white/50 text-[11px] font-mono">{inspectionData.batchId || 'APMC-NAS-4722'}</p>
        </div>

        <button
          onClick={() => setFlash(!flash)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            flash ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-white/12 border-none'
          }`}
        >
          {flash ? <Zap size={20} color="#FDE047" /> : <ZapOff size={20} color="white" />}
        </button>
      </div>

      {/* Camera & Scanner Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0D1A10] via-[#132A1C] to-[#0A160D]">
        {/* Render uploaded image if present */}
        {inspectionData.capturedImage ? (
          <img
            src={inspectionData.capturedImage}
            alt="Sample preview"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            style={{ filter: captured ? 'brightness(1.5)' : 'brightness(0.95)' }}
          />
        ) : (
          /* High-Tech AI Camera Grid Visual when no photo is uploaded */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-3xl bg-[#1B6B3A]/30 border border-[#4ADE80]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.2)] animate-pulse">
              <Scan size={44} className="text-[#4ADE80]" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Live Camera Feed / Image Canvas</h3>
            <p className="text-white/60 text-xs max-w-xs">
              Upload a sample image from Gallery or tap shutter to run AI assessment
            </p>
          </div>
        )}

        {/* Upload Overlay Indicator if uploaded */}
        {uploadedName && (
          <div className="absolute top-4 left-4 right-4 bg-[#1B6B3A]/90 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2 border border-white/20 text-white z-20">
            <CheckCircle2 size={18} className="text-[#4ADE80]" />
            <span className="text-xs font-bold truncate">Uploaded: {uploadedName}</span>
          </div>
        )}

        {/* Sample Placement Bounding Frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[220px] pointer-events-none">
          <svg width="260" height="220" viewBox="0 0 260 220" className="absolute inset-0">
            <path d="M 0 40 L 0 0 L 40 0" fill="none" stroke="#4ADE80" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 220 0 L 260 0 L 260 40" fill="none" stroke="#4ADE80" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 0 180 L 0 220 L 40 220" fill="none" stroke="#4ADE80" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 220 220 L 260 220 L 260 180" fill="none" stroke="#4ADE80" strokeWidth="3.5" strokeLinecap="round" />
            <rect
              x="2" y="2" width="256" height="216" rx="10"
              fill="rgba(74,222,128,0.06)"
              stroke="rgba(74,222,128,0.4)"
              strokeWidth="1.5" strokeDasharray="8 5"
            />
          </svg>

          <div className="absolute -top-9 right-0 bg-black/70 border border-white/20 rounded-xl px-2.5 py-1 flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border border-white/80" />
            <span className="text-white text-[9.5px] font-bold font-mono">REF 50mm</span>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="absolute bottom-16 left-3 right-3 flex gap-2">
          <div className="flex-1 bg-black/65 border border-[#4ADE80]/40 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
            <span className="text-white text-xs font-semibold">Lighting: Good ✓</span>
          </div>
          <div className="flex-1 bg-black/65 border border-[#4ADE80]/40 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
            <span className="text-white text-xs font-semibold">Ready for Assessment</span>
          </div>
        </div>

        {/* Instruction Banner */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl py-2 px-3 text-center">
          <p className="text-white/90 text-xs font-medium">
            Tap Camera shutter or select a photo from Gallery to analyze.
          </p>
        </div>
      </div>

      {/* Bottom Shutter & Upload Controls */}
      <div className="shrink-0 py-6 px-6 flex items-center justify-between">
        {/* Upload Image / Gallery Button */}
        <button
          onClick={triggerFileUpload}
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          title="Upload image from gallery"
        >
          <Upload size={20} className="text-white" />
          <span className="text-[9.5px] font-bold text-white/80">Upload</span>
        </button>

        {/* Shutter Capture Button */}
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_6px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
        >
          <div className={`w-[66px] h-[66px] rounded-full flex items-center justify-center ${captured ? 'bg-[#4ADE80]' : 'bg-[#1B6B3A]'}`}>
            {captured ? <CheckCircle2 size={32} className="text-white animate-bounce" /> : <div className="w-12 h-12 rounded-full border-2 border-white/60" />}
          </div>
        </button>

        {/* Gallery Alternate Button */}
        <button
          onClick={triggerFileUpload}
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          title="Open Gallery"
        >
          <Image size={20} className="text-white" />
          <span className="text-[9.5px] font-bold text-white/80">Gallery</span>
        </button>
      </div>
    </div>
  );
}
