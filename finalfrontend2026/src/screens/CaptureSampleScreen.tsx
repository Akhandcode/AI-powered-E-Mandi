import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Zap, ZapOff, Image, Upload, CheckCircle2, Scan, AlertTriangle, RefreshCw, X, Camera, RotateCcw } from 'lucide-react';
import { useApp } from '../context';
import { validateProduceImage, ValidationResult } from '../utils/produceValidator';
import { uploadLotImages } from '../services/api';

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function CaptureSampleScreen() {
  const { navigate, inspectionData, setInspectionData, activeLotId } = useApp();
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and manage live HTML5 webcam stream
  const startCamera = async () => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream failed with facingMode constraint, attempting fallback:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (err2: any) {
        console.warn('Camera device not available or permission denied:', err2);
        setCameraActive(false);
        setCameraError(
          'Live camera permission denied or camera device not found. Please upload a photo from your gallery instead.'
        );
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCameraFlip = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const processAndValidateImage = async (imageUrl: string) => {
    setValidating(true);
    setValidationError(null);

    const val = await validateProduceImage(imageUrl, inspectionData.commodity);
    setValidating(false);

    if (!val.isValid) {
      setValidationError(val);
      setCaptured(false);
      return;
    }

    setInspectionData({
      ...inspectionData,
      capturedImage: imageUrl,
    });
    setCaptured(true);

    if (activeLotId) {
      try {
        const file = dataURLtoFile(imageUrl, `sample_${activeLotId}.jpg`);
        await uploadLotImages(activeLotId, [file]);
      } catch (uploadErr) {
        console.warn('Backend image upload fallback', uploadErr);
      }
    }

    setTimeout(() => navigate('ai-analysis'), 600);
  };

  const handleCapture = () => {
    if (inspectionData.capturedImage && !cameraActive) {
      processAndValidateImage(inspectionData.capturedImage);
      return;
    }

    // Capture snapshot frame from live video element
    if (videoRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.92);
        processAndValidateImage(imageUrl);
        return;
      }
    }

    // Fallback if no camera & no upload yet
    if (!inspectionData.capturedImage) {
      setValidationError({
        isValid: false,
        commodityDetected: 'none',
        confidence: 0,
        reason: 'No photo captured or uploaded. Please select a photo from gallery or enable camera.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        processAndValidateImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const isMismatch =
    validationError &&
    validationError.commodityDetected !== 'none' &&
    validationError.commodityDetected.toLowerCase() !== (inspectionData.commodity || 'onion').toLowerCase();

  const detectedCommodityName = validationError?.commodityDetected
    ? validationError.commodityDetected.charAt(0).toUpperCase() + validationError.commodityDetected.slice(1)
    : '';

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
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/12 border-none active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2} color="white" />
        </button>

        <div className="text-center">
          <p className="text-white text-sm font-bold leading-tight">Live Camera & Produce Scanner</p>
          <p className="text-white/50 text-[11px] font-mono">
            {inspectionData.commodity || 'Onion'} · {inspectionData.batchId || 'APMC-NAS-4722'}
          </p>
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
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {/* Render uploaded photo if present, otherwise live camera stream */}
        {inspectionData.capturedImage ? (
          <img
            src={inspectionData.capturedImage}
            alt="Sample preview"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            style={{ filter: captured ? 'brightness(1.1)' : 'brightness(0.95)' }}
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
        )}

        {/* Fallback Camera Error / Visual when webcam disabled */}
        {!cameraActive && !inspectionData.capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0D1A10] via-[#132A1C] to-[#0A160D]">
            <div className="w-20 h-20 rounded-3xl bg-[#1B6B3A]/40 border border-[#4ADE80]/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
              <Camera size={40} className="text-[#4ADE80]" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Webcam Access</h3>
            <p className="text-white/70 text-xs max-w-xs mb-4 leading-relaxed">
              {cameraError || 'Allow camera permission or choose an agricultural produce photo from gallery.'}
            </p>
            <button
              onClick={triggerFileUpload}
              className="px-5 py-2.5 bg-[#1B6B3A] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-[#14522C]"
            >
              <Upload size={16} />
              Upload Image from Gallery
            </button>
          </div>
        )}

        {/* Upload Overlay Indicator if uploaded */}
        {uploadedName && (
          <div className="absolute top-4 left-4 right-4 bg-[#1B6B3A]/90 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between border border-white/20 text-white z-20">
            <div className="flex items-center gap-2 overflow-hidden">
              <CheckCircle2 size={18} className="text-[#4ADE80] shrink-0" />
              <span className="text-xs font-bold truncate">Uploaded: {uploadedName}</span>
            </div>
            <button
              onClick={() => {
                setUploadedName(null);
                setInspectionData({ ...inspectionData, capturedImage: undefined });
                startCamera();
              }}
              className="text-white/70 hover:text-white text-xs px-2 py-0.5 rounded bg-white/10"
            >
              Reset
            </button>
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
            <span className="text-white text-[9.5px] font-bold font-mono">Target: {inspectionData.commodity || 'Produce'}</span>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="absolute bottom-16 left-3 right-3 flex gap-2">
          <div className="flex-1 bg-black/65 border border-[#4ADE80]/40 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
            <span className="text-white text-xs font-semibold">
              {validating ? 'Validating Commodity…' : cameraActive ? 'Live Video Active ✓' : 'Photo Ready ✓'}
            </span>
          </div>
          <div className="flex-1 bg-black/65 border border-[#4ADE80]/40 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_#4ADE80]" />
            <span className="text-white text-xs font-semibold">{inspectionData.commodity || 'Onion'} Scanning Mode</span>
          </div>
        </div>

        {/* Instruction Banner */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl py-2 px-3 text-center">
          <p className="text-white/90 text-xs font-medium">
            Place your {inspectionData.commodity || 'produce'} sample in frame & tap shutter to analyze.
          </p>
        </div>
      </div>

      {/* Bottom Shutter & Camera Controls */}
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
          disabled={validating}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_0_6px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
        >
          <div className={`w-[66px] h-[66px] rounded-full flex items-center justify-center ${captured ? 'bg-[#4ADE80]' : 'bg-[#1B6B3A]'}`}>
            {validating ? (
              <RefreshCw size={28} className="text-white animate-spin" />
            ) : captured ? (
              <CheckCircle2 size={32} className="text-white animate-bounce" />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white/60" />
            )}
          </div>
        </button>

        {/* Camera Flip / Front-Back Camera Button */}
        <button
          onClick={toggleCameraFlip}
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
          title="Flip camera"
        >
          <RotateCcw size={20} className="text-white" />
          <span className="text-[9.5px] font-bold text-white/80">Flip Cam</span>
        </button>
      </div>

      {/* ⚠️ Commodity Mismatch / Non-Produce Alert Modal */}
      {validationError && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-[#122619] border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setValidationError(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle size={36} />
            </div>

            <h3 className="text-white font-extrabold text-lg mb-2">
              {isMismatch ? 'Produce Mismatch Detected' : 'No Valid Produce Identified'}
            </h3>

            <p className="text-amber-200 font-semibold text-xs mb-3 bg-amber-950/70 p-3 rounded-xl border border-amber-800/50 leading-relaxed text-left">
              ⚠️ {validationError.reason}
            </p>

            <p className="text-white/80 text-xs mb-6 leading-relaxed">
              {isMismatch ? (
                <>
                  Selected commodity is <strong>{inspectionData.commodity}</strong>, but the visual scanner detected <strong>{detectedCommodityName}</strong>.
                </>
              ) : (
                <>
                  Please upload or capture a clear photo of your <strong>{inspectionData.commodity || 'Onion'}</strong> batch.
                </>
              )}
            </p>

            <div className="flex flex-col gap-2.5">
              {isMismatch && (
                <button
                  onClick={() => {
                    const newCommodity = detectedCommodityName as 'Onion' | 'Potato' | 'Tomato';
                    setInspectionData({
                      ...inspectionData,
                      commodity: newCommodity,
                      batchId: `LOT-${newCommodity.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    });
                    setValidationError(null);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#22C55E] text-white font-bold text-sm shadow-lg hover:bg-[#16A34A] flex items-center justify-center gap-2 active:scale-98 transition-transform"
                >
                  <CheckCircle2 size={18} />
                  Switch Batch to {detectedCommodityName}
                </button>
              )}

              <button
                onClick={() => {
                  setValidationError(null);
                  triggerFileUpload();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1B6B3A] text-white font-bold text-sm shadow-lg hover:bg-[#14522C] flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                <Upload size={18} />
                Upload {inspectionData.commodity || 'Produce'} Photo
              </button>

              <button
                onClick={() => {
                  setValidationError(null);
                  setInspectionData({ ...inspectionData, capturedImage: undefined });
                  startCamera();
                }}
                className="w-full py-3 rounded-2xl bg-white/10 text-white/90 font-semibold text-xs hover:bg-white/15"
              >
                Retake Photo via Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

