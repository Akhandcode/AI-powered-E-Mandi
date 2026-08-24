import { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Globe,
  Fingerprint,
  CheckCircle2,
  HelpCircle,
  X,
  KeyRound,
  Building2,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context';
import OnionLogo from '../components/OnionLogo';
import StatusBar from '../components/StatusBar';

type Lang = 'EN' | 'HI' | 'MR';
type AuthTab = 'password' | 'otp' | 'biometric';

interface LanguageContent {
  title: string;
  subTitle: string;
  badge: string;
  tabPassword: string;
  tabOtp: string;
  tabBio: string;
  centerLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  passLabel: string;
  passPlaceholder: string;
  forgotPass: string;
  rememberMe: string;
  signInBtn: string;
  signingIn: string;
  sendOtp: string;
  enterOtp: string;
  verifyOtp: string;
  resendOtp: string;
  bioTitle: string;
  bioSubtitle: string;
  bioButton: string;
  scanning: string;
  demoTitle: string;
  secTitle: string;
  secSubtitle: string;
}

const translations: Record<Lang, LanguageContent> = {
  EN: {
    title: 'Inspector Portal',
    subTitle: 'APMC Objective Quality & Grading Platform',
    badge: 'GOVT OF INDIA · SIH 2026',
    tabPassword: 'Password',
    tabOtp: 'Mobile OTP',
    tabBio: 'AI Biometric',
    centerLabel: 'PROCUREMENT MANDI CENTER',
    phoneLabel: 'MOBILE NUMBER / INSPECTOR ID',
    phonePlaceholder: 'Enter mobile or ID (e.g. 9876543210)',
    passLabel: 'SECURITY PASSWORD',
    passPlaceholder: 'Enter your password',
    forgotPass: 'Forgot Password?',
    rememberMe: 'Keep me logged in on this device',
    signInBtn: 'Sign In to Portal',
    signingIn: 'Verifying Credentials…',
    sendOtp: 'Get 4-Digit OTP',
    enterOtp: 'ENTER VERIFICATION CODE',
    verifyOtp: 'Verify & Sign In',
    resendOtp: 'Resend code in',
    bioTitle: 'Field Inspector Biometric Login',
    bioSubtitle: 'Use Face Verification or Touch ID for quick field access',
    bioButton: 'Scan & Authenticate',
    scanning: 'Scanning Biometrics…',
    demoTitle: 'QUICK DEMO PERSONAS',
    secTitle: 'NIC 256-Bit Encrypted Portal',
    secSubtitle: 'Authorized APMC personnel only · MSAMB Network',
  },
  HI: {
    title: 'निरीक्षक पोर्टल',
    subTitle: 'APMC गुणवत्ता एवं ग्रेडिंग प्लेटफॉर्म',
    badge: 'भारत सरकार · SIH 2026',
    tabPassword: 'पासवर्ड',
    tabOtp: 'मोबाइल ओटीपी',
    tabBio: 'एआई बायोमेट्रिक',
    centerLabel: 'खरीद मंडी केंद्र',
    phoneLabel: 'मोबाइल नंबर / आईडी',
    phonePlaceholder: 'मोबाइल या आईडी दर्ज करें',
    passLabel: 'सुरक्षा पासवर्ड',
    passPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPass: 'पासवर्ड भूल गए?',
    rememberMe: 'मुझे इस डिवाइस पर लॉग इन रखें',
    signInBtn: 'पोर्टल में साइन इन करें',
    signingIn: 'सत्यापन हो रहा है…',
    sendOtp: 'ओटीपी प्राप्त करें',
    enterOtp: 'सत्यापन कोड दर्ज करें',
    verifyOtp: 'सत्यापित करें और साइन इन करें',
    resendOtp: 'पुनः भेजें',
    bioTitle: 'क्षेत्रीय निरीक्षक बायोमेट्रिक लॉगिन',
    bioSubtitle: 'त्वरित पहुंच के लिए चेहरे या फिंगरप्रिंट का उपयोग करें',
    bioButton: 'स्कैन और सत्यापित करें',
    scanning: 'स्कैनिंग जारी है…',
    demoTitle: 'त्वरित डेमो प्रोफाइल',
    secTitle: 'NIC 256-बिट सुरक्षित पोर्टल',
    secSubtitle: 'केवल अधिकृत APMC कर्मियों के लिए',
  },
  MR: {
    title: 'निरीक्षक पोर्टल',
    subTitle: 'APMC गुणवत्ता व ग्रेडिंग प्लॅटफॉर्म',
    badge: 'महाराष्ट्र शासन · SIH 2026',
    tabPassword: 'पासवर्ड',
    tabOtp: 'मोबाईल ओटीपी',
    tabBio: 'बायोमेट्रिक',
    centerLabel: 'खरेदी मार्केट यार्ड / केंद्र',
    phoneLabel: 'मोबाईल नंबर / आयडी',
    phonePlaceholder: 'मोबाईल क्रमांक किंवा आयडी टाका',
    passLabel: 'सुरक्षा पासवर्ड',
    passPlaceholder: 'पासवर्ड टाका',
    forgotPass: 'पासवर्ड विसरलात?',
    rememberMe: 'या डिव्हाइसवर लॉग इन ठेवा',
    signInBtn: 'साइन इन करा',
    signingIn: 'सत्यापन सुरू आहे…',
    sendOtp: 'ओटीपी मिळवा',
    enterOtp: 'ओटीपी कोड टाका',
    verifyOtp: 'सत्यापित करून साइन इन करा',
    resendOtp: 'पुन्हा पाठवा',
    bioTitle: 'फिल्ड इन्स्पेक्टर बायोमेट्रिक लॉग-इन',
    bioSubtitle: 'जलद प्रवेशासाठी फेस आयडी किंवा फिंगरप्रिंट वापरा',
    bioButton: 'स्कॅन आणि साइन इन करा',
    scanning: 'स्कॅनिंग सुरू आहे…',
    demoTitle: 'डेमो प्रोफाइल त्वरित निवडा',
    secTitle: 'NIC 256-बिट एनक्रिप्टेड पोर्टल',
    secSubtitle: 'फक्त अधिकृत APMC अधिकाऱ्यांसाठी',
  },
};

const apmcCenters = [
  { id: 'nashik-3', name: 'APMC Nashik — Center 3', location: 'Panchavati, Nashik' },
  { id: 'lasalgaon-main', name: 'APMC Lasalgaon — Main Yard', location: 'Niphad, Nashik' },
  { id: 'pimpalgaon', name: 'APMC Pimpalgaon Baswant', location: 'Pimpalgaon, Nashik' },
  { id: 'solapur-central', name: 'APMC Solapur — Market Yard', location: 'Solapur' },
  { id: 'rahuri-yard', name: 'APMC Rahuri — Sub Center', location: 'Ahmednagar' },
];

const demoUsers = [
  {
    name: 'Rajesh Kumar',
    role: 'Senior Quality Inspector',
    center: 'APMC Nashik — Center 3',
    phone: '9876543210',
    pass: 'apmc2026',
    avatar: 'RK',
    color: '#1B6B3A',
  },
  {
    name: 'Sunil Patil',
    role: 'APMC Procurement Officer',
    center: 'APMC Lasalgaon — Main Yard',
    phone: '9812345678',
    pass: 'lasal2026',
    avatar: 'SP',
    color: '#E8650A',
  },
  {
    name: 'Dr. Anita Sharma',
    role: 'Nodal Agronomist',
    center: 'APMC Pimpalgaon Baswant',
    phone: '9765432109',
    pass: 'agri2026',
    avatar: 'AS',
    color: '#7C3AED',
  },
];

export default function LoginScreen() {
  const { navigate, inspectionData, setInspectionData } = useApp();
  
  // Local states
  const [lang, setLang] = useState<Lang>('EN');
  const [authTab, setAuthTab] = useState<AuthTab>('password');
  const [selectedCenter, setSelectedCenter] = useState(apmcCenters[0].name);
  
  // Password auth state
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('apmc2026');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // OTP auth state
  const [otpPhone, setOtpPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['4', '7', '2', '1']);
  const [timer, setTimer] = useState(30);

  // Biometric state
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Common loading & modal state
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = translations[lang];

  // OTP Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleLogin = (inspectorName = 'Rajesh Kumar') => {
    setErrorMessage('');
    setLoading(true);

    // Update global inspection data context with logged in inspector & center
    setInspectionData({
      ...inspectionData,
      inspector: inspectorName,
      center: selectedCenter,
    });

    setTimeout(() => {
      setLoading(false);
      navigate('dashboard');
    }, 1200);
  };

  const handleSendOtp = () => {
    if (otpPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(30);
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otpDigits.join('').length < 4) {
      setErrorMessage('Please enter the 4-digit OTP.');
      return;
    }
    handleLogin('Rajesh Kumar (OTP Verified)');
  };

  const handleBiometricAuth = () => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        handleLogin('Rajesh Kumar (Biometric)');
      }, 600);
    }, 1500);
  };

  const applyDemoUser = (user: typeof demoUsers[0]) => {
    setPhone(user.phone);
    setPassword(user.pass);
    setSelectedCenter(user.center);
    setOtpPhone(user.phone);
    setErrorMessage('');
    handleLogin(user.name);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      {/* Top Status Bar & Rich Header */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(165deg, #071E14 0%, #0A2B1D 45%, #0D472B 100%)',
          paddingBottom: 32,
        }}
      >
        <StatusBar dark />

        {/* Ambient Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="loginGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loginGrid)" />
          </svg>
        </div>

        {/* Header Top Controls */}
        <div className="px-5 pt-1 flex items-center justify-between relative z-10">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />
            <span style={{ fontSize: 10.5, color: '#E8F5EE', fontWeight: 600, letterSpacing: '0.4px' }}>
              {t.badge}
            </span>
          </div>

          {/* Language Selector */}
          <div
            className="flex items-center p-0.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {(['EN', 'HI', 'MR'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2 py-0.5 rounded-lg font-bold transition-all"
                style={{
                  fontSize: 11,
                  background: lang === l ? '#1B6B3A' : 'transparent',
                  color: lang === l ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  boxShadow: lang === l ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Branding & Logo */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-3.5 relative z-10">
          <div
            className="flex items-center justify-center rounded-2xl relative shadow-lg"
            style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <OnionLogo size={36} />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#134D2B]"
              style={{ background: '#E8650A' }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white" style={{ fontSize: 21, letterSpacing: '-0.4px', lineHeight: 1.1 }}>
                OnionGuard AI
              </h1>
              <span
                className="px-1.5 py-0.5 rounded font-bold"
                style={{ fontSize: 9.5, background: '#E8650A', color: 'white', letterSpacing: '0.5px' }}
              >
                v2.4
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
              {t.subTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area (Scrollable Card Layout) */}
      <div className="flex-1 overflow-y-auto px-4 -mt-5 relative z-20 pb-6">
        <div
          className="rounded-3xl p-5 mb-4 shadow-xl"
          style={{ background: '#FFFFFF', border: '1px solid rgba(212,228,218,0.6)' }}
        >
          {/* Header Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-extrabold" style={{ fontSize: 19, color: '#1A2F23', letterSpacing: '-0.3px' }}>
                {t.title}
              </h2>
              <p style={{ fontSize: 12, color: '#5E7468' }}>Select your authentication mode</p>
            </div>
            <UserCheck size={22} style={{ color: '#1B6B3A' }} />
          </div>

          {/* Authentication Mode Tabs */}
          <div
            className="flex p-1 rounded-2xl mb-5"
            style={{ background: '#F0F5F2', border: '1px solid #E1ECE5' }}
          >
            <button
              onClick={() => { setAuthTab('password'); setErrorMessage(''); }}
              className="flex-1 py-2 rounded-xl font-bold transition-all text-center"
              style={{
                fontSize: 12,
                background: authTab === 'password' ? 'white' : 'transparent',
                color: authTab === 'password' ? '#1B6B3A' : '#5E7468',
                boxShadow: authTab === 'password' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.tabPassword}
            </button>

            <button
              onClick={() => { setAuthTab('otp'); setErrorMessage(''); }}
              className="flex-1 py-2 rounded-xl font-bold transition-all text-center"
              style={{
                fontSize: 12,
                background: authTab === 'otp' ? 'white' : 'transparent',
                color: authTab === 'otp' ? '#1B6B3A' : '#5E7468',
                boxShadow: authTab === 'otp' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.tabOtp}
            </button>

            <button
              onClick={() => { setAuthTab('biometric'); setErrorMessage(''); }}
              className="flex-1 py-2 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1"
              style={{
                fontSize: 12,
                background: authTab === 'biometric' ? 'white' : 'transparent',
                color: authTab === 'biometric' ? '#1B6B3A' : '#5E7468',
                boxShadow: authTab === 'biometric' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Fingerprint size={13} />
              <span>{t.tabBio}</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="mb-4 p-3 rounded-2xl flex items-center gap-2 font-medium animate-fadeIn"
              style={{ background: '#FDECEA', border: '1px solid #F9BBBD', color: '#C0392B', fontSize: 12.5 }}
            >
              <span className="font-bold">!</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: PASSWORD AUTHENTICATION */}
          {authTab === 'password' && (
            <div className="flex flex-col gap-4">
              {/* APMC Center Select */}
              <div>
                <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                  {t.centerLabel}
                </label>
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-3.5"
                  style={{
                    height: 52,
                    background: '#F4F7F5',
                    border: '1.5px solid #D4E4DA',
                  }}
                >
                  <MapPin size={18} strokeWidth={2} style={{ color: '#1B6B3A', flexShrink: 0 }} />
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-semibold text-ellipsis overflow-hidden"
                    style={{ fontSize: 13.5, color: '#1A2F23' }}
                  >
                    {apmcCenters.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile / Inspector ID */}
              <div>
                <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                  {t.phoneLabel}
                </label>
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-3.5"
                  style={{
                    height: 52,
                    background: '#F4F7F5',
                    border: `1.5px solid ${phone ? '#1B6B3A' : '#D4E4DA'}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Phone size={18} strokeWidth={2} style={{ color: phone ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-medium"
                    style={{ fontSize: 14, color: '#1A2F23' }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                    {t.passLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="font-bold hover:underline"
                    style={{ color: '#1B6B3A', fontSize: 12 }}
                  >
                    {t.forgotPass}
                  </button>
                </div>
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-3.5"
                  style={{
                    height: 52,
                    background: '#F4F7F5',
                    border: `1.5px solid ${password ? '#1B6B3A' : '#D4E4DA'}`,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Lock size={18} strokeWidth={2} style={{ color: password ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder={t.passPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-medium"
                    style={{ fontSize: 14, color: '#1A2F23' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ color: '#8EA899', padding: 4 }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#1B6B3A] rounded cursor-pointer"
                />
                <label htmlFor="remember" className="font-medium cursor-pointer" style={{ fontSize: 12.5, color: '#5E7468' }}>
                  {t.rememberMe}
                </label>
              </div>

              {/* Sign In Button */}
              <button
                onClick={() => handleLogin('Rajesh Kumar')}
                disabled={loading || !phone || !password}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-white mt-2 transition-all active:scale-[0.98]"
                style={{
                  height: 56,
                  fontSize: 15.5,
                  background: phone && password && !loading
                    ? 'linear-gradient(135deg, #1B6B3A 0%, #267A46 100%)'
                    : '#C5D5CA',
                  boxShadow: phone && password && !loading ? '0 6px 20px rgba(27,107,58,0.32)' : 'none',
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="border-2 border-white border-t-transparent rounded-full"
                      style={{ width: 20, height: 20, animation: 'spin 0.75s linear infinite' }}
                    />
                    <span>{t.signingIn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.signInBtn}</span>
                    <ArrowRight size={19} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: MOBILE OTP AUTHENTICATION */}
          {authTab === 'otp' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                  {t.phoneLabel}
                </label>
                <div
                  className="flex items-center gap-2.5 rounded-2xl px-3.5"
                  style={{
                    height: 52,
                    background: '#F4F7F5',
                    border: '1.5px solid #1B6B3A',
                  }}
                >
                  <Phone size={18} strokeWidth={2} style={{ color: '#1B6B3A', flexShrink: 0 }} />
                  <input
                    type="tel"
                    placeholder="Enter registered mobile number"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-medium"
                    style={{ fontSize: 14, color: '#1A2F23' }}
                  />
                  {otpSent && (
                    <button
                      onClick={() => setOtpSent(false)}
                      className="font-semibold text-xs text-[#1B6B3A] underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading || otpPhone.length < 10}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white mt-2 transition-all"
                  style={{
                    height: 54,
                    fontSize: 15,
                    background: otpPhone.length >= 10 && !loading
                      ? 'linear-gradient(135deg, #1B6B3A 0%, #267A46 100%)'
                      : '#C5D5CA',
                  }}
                >
                  {loading ? (
                    <span>Sending Code…</span>
                  ) : (
                    <>
                      <span>{t.sendOtp}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col gap-3 mt-1 animate-fadeIn">
                  <label className="block font-bold" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                    {t.enterOtp}
                  </label>
                  
                  {/* OTP Digits */}
                  <div className="flex gap-3 justify-between">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const newDigits = [...otpDigits];
                          newDigits[idx] = e.target.value;
                          setOtpDigits(newDigits);
                        }}
                        className="w-14 h-14 rounded-2xl text-center font-bold text-xl outline-none"
                        style={{
                          background: '#F4F7F5',
                          border: '2px solid #1B6B3A',
                          color: '#1A2F23',
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span style={{ fontSize: 12, color: '#5E7468' }}>
                      {timer > 0 ? `${t.resendOtp} ${timer}s` : 'Didn’t receive code?'}
                    </span>
                    {timer === 0 && (
                      <button
                        onClick={handleSendOtp}
                        className="font-bold"
                        style={{ fontSize: 12, color: '#1B6B3A' }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white mt-3"
                    style={{
                      height: 56,
                      fontSize: 15.5,
                      background: 'linear-gradient(135deg, #1B6B3A 0%, #267A46 100%)',
                      boxShadow: '0 6px 20px rgba(27,107,58,0.32)',
                    }}
                  >
                    {loading ? (
                      <span>Verifying…</span>
                    ) : (
                      <>
                        <CheckCircle2 size={19} />
                        <span>{t.verifyOtp}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BIOMETRIC AUTHENTICATION */}
          {authTab === 'biometric' && (
            <div className="flex flex-col items-center py-3 px-2 text-center">
              {/* Biometric Scanner Visual */}
              <div className="relative my-4 flex items-center justify-center">
                {/* Pulse Rings */}
                <div
                  className={`absolute rounded-full transition-all duration-700 ${
                    isScanning ? 'scale-125 opacity-40' : 'scale-100 opacity-20'
                  }`}
                  style={{ width: 130, height: 130, background: '#1B6B3A' }}
                />
                <div
                  className={`absolute rounded-full transition-all duration-500 ${
                    isScanning ? 'scale-110 opacity-60' : 'scale-100 opacity-30'
                  }`}
                  style={{ width: 105, height: 105, background: '#4ADE80' }}
                />

                {/* Scanner Circle */}
                <button
                  onClick={handleBiometricAuth}
                  disabled={isScanning}
                  className="relative z-10 flex flex-col items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{
                    width: 90,
                    height: 90,
                    background: scanSuccess
                      ? '#15803D'
                      : 'linear-gradient(135deg, #0D2B18 0%, #1B6B3A 100%)',
                    boxShadow: '0 8px 30px rgba(27,107,58,0.4)',
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {scanSuccess ? (
                    <CheckCircle2 size={44} className="text-white animate-bounce" />
                  ) : isScanning ? (
                    <RefreshCw size={36} className="text-white animate-spin" />
                  ) : (
                    <Fingerprint size={42} className="text-white" />
                  )}
                </button>
              </div>

              <h3 className="font-bold" style={{ fontSize: 16, color: '#1A2F23', marginTop: 4 }}>
                {scanSuccess ? 'Identity Verified!' : t.bioTitle}
              </h3>
              <p style={{ fontSize: 12.5, color: '#5E7468', marginTop: 4, maxWidth: 260 }}>
                {isScanning ? t.scanning : t.bioSubtitle}
              </p>

              <button
                onClick={handleBiometricAuth}
                disabled={isScanning}
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white mt-5"
                style={{
                  height: 52,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #1B6B3A 0%, #267A46 100%)',
                  boxShadow: '0 4px 16px rgba(27,107,58,0.25)',
                }}
              >
                <Fingerprint size={19} />
                <span>{isScanning ? 'Scanning…' : t.bioButton}</span>
              </button>
            </div>
          )}
        </div>

        {/* DEMO PERSONAS PRESETS */}
        <div
          className="rounded-3xl p-4 mb-4"
          style={{ background: 'white', border: '1px solid rgba(212,228,218,0.6)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-bold" style={{ fontSize: 11, color: '#5E7468', letterSpacing: '0.6px' }}>
              {t.demoTitle}
            </span>
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ fontSize: 10, background: '#FFF3EB', color: '#E8650A' }}
            >
              Instant Fill
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {demoUsers.map((u) => (
              <button
                key={u.name}
                onClick={() => applyDemoUser(u)}
                className="flex items-center justify-between rounded-2xl p-2.5 transition-all hover:bg-[#F4F7F5] active:scale-[0.99] text-left"
                style={{ background: '#F8FAF9', border: '1px solid #E8EDE9' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl font-extrabold text-white"
                    style={{ width: 38, height: 38, background: u.color, fontSize: 13 }}
                  >
                    {u.avatar}
                  </div>
                  <div>
                    <p className="font-bold" style={{ fontSize: 13, color: '#1A2F23', lineHeight: 1.2 }}>
                      {u.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#5E7468' }}>
                      {u.role} · {u.center.split('—')[0]}
                    </p>
                  </div>
                </div>

                <div
                  className="px-2.5 py-1 rounded-xl font-bold flex items-center gap-1"
                  style={{ background: '#E8F5EE', color: '#1B6B3A', fontSize: 11 }}
                >
                  <span>Select</span>
                  <ArrowRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECURITY & COMPLIANCE BADGE */}
        <div
          className="rounded-2xl p-3.5 flex items-center gap-3"
          style={{ background: '#E8F5EE', border: '1.5px solid #C2E3D0' }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 38, height: 38, background: '#1B6B3A' }}
          >
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold" style={{ fontSize: 12.5, color: '#1B6B3A' }}>
              {t.secTitle}
            </p>
            <p style={{ fontSize: 11, color: '#3D5244' }}>
              {t.secSubtitle}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5 text-center">
          <p style={{ fontSize: 10.5, color: '#8EA899' }}>
            Ministry of Agriculture & Farmers Welfare · APMC Digital Platform
          </p>
          <p style={{ fontSize: 10, color: '#A0B5AA', marginTop: 2 }}>
            Smart India Hackathon 2026 Project
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-5 shadow-2xl relative"
            style={{ background: 'white' }}
          >
            <button
              onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X size={18} style={{ color: '#5E7468' }} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-[#FFF3EB] text-[#E8650A]">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base" style={{ color: '#1A2F23' }}>Reset Password</h3>
                <p style={{ fontSize: 11.5, color: '#5E7468' }}>APMC Inspector Portal</p>
              </div>
            </div>

            {!forgotSent ? (
              <>
                <p style={{ fontSize: 12.5, color: '#3D5244', marginBottom: 14, lineHeight: 1.4 }}>
                  Enter your registered mobile number to receive a password reset link via SMS.
                </p>
                <div
                  className="flex items-center gap-2 rounded-2xl px-3 mb-4"
                  style={{ height: 48, background: '#F4F7F5', border: '1.5px solid #D4E4DA' }}
                >
                  <Phone size={16} style={{ color: '#1B6B3A' }} />
                  <input
                    type="tel"
                    defaultValue={phone}
                    placeholder="Enter 10-digit mobile"
                    className="w-full bg-transparent outline-none text-sm font-medium"
                  />
                </div>
                <button
                  onClick={() => setForgotSent(true)}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                  style={{ background: '#1B6B3A' }}
                >
                  Send Reset Link
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <CheckCircle2 size={40} className="mx-auto mb-2 text-[#15803D]" />
                <p className="font-bold text-sm" style={{ color: '#1A2F23' }}>Reset SMS Sent!</p>
                <p style={{ fontSize: 12, color: '#5E7468', marginTop: 4 }}>
                  A security link has been dispatched to your mobile number.
                </p>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                  className="mt-4 w-full py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: '#1B6B3A' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
