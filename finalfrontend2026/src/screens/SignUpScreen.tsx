import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Sprout,
  ShoppingBag,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context';
import OnionLogo from '../components/OnionLogo';
import StatusBar from '../components/StatusBar';
import { registerUser, loginUser } from '../services/api';

type Lang = 'EN' | 'HI' | 'MR';
type UserRole = 'INSPECTION_OFFICER' | 'FARMER' | 'PROCUREMENT_MANAGER' | 'BUYER' | 'ADMIN';

interface RoleOption {
  id: UserRole;
  label: string;
  desc: string;
  icon: typeof User;
  color: string;
}

const apmcCenters = [
  { id: 'nashik-3', name: 'APMC Nashik — Center 3', location: 'Panchavati, Nashik' },
  { id: 'lasalgaon-main', name: 'APMC Lasalgaon — Main Yard', location: 'Niphad, Nashik' },
  { id: 'pimpalgaon', name: 'APMC Pimpalgaon Baswant', location: 'Pimpalgaon, Nashik' },
  { id: 'solapur-central', name: 'APMC Solapur — Market Yard', location: 'Solapur' },
  { id: 'rahuri-yard', name: 'APMC Rahuri — Sub Center', location: 'Ahmednagar' },
];

const translations: Record<Lang, {
  headerTitle: string;
  headerSubtitle: string;
  badge: string;
  formTitle: string;
  formSubtitle: string;
  roleLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  emailPhoneLabel: string;
  emailPhonePlaceholder: string;
  orgLabel: string;
  orgPlaceholder: string;
  centerLabel: string;
  passLabel: string;
  passPlaceholder: string;
  confirmPassLabel: string;
  confirmPassPlaceholder: string;
  termsAgreement: string;
  signUpBtn: string;
  registering: string;
  alreadyHaveAccount: string;
  signInHere: string;
  secTitle: string;
  secSubtitle: string;
}> = {
  EN: {
    headerTitle: 'Registration Portal',
    headerSubtitle: 'APMC Objective Quality & Grading Platform',
    badge: 'GOVT OF INDIA · SIH 2026',
    formTitle: 'Create Official Account',
    formSubtitle: 'Register for AI-Powered Mandi Quality Assessment',
    roleLabel: 'SELECT YOUR USER ROLE',
    nameLabel: 'FULL NAME',
    namePlaceholder: 'Enter your full official name',
    emailPhoneLabel: 'EMAIL / MOBILE NUMBER',
    emailPhonePlaceholder: 'officer@doca.gov.in or 9876543210',
    orgLabel: 'ORGANIZATION / DEPARTMENT',
    orgPlaceholder: 'e.g. Dept. of Consumer Affairs / NAFED',
    centerLabel: 'PRIMARY APMC MANDI CENTER',
    passLabel: 'SECURITY PASSWORD',
    passPlaceholder: 'Create a strong password (min 6 chars)',
    confirmPassLabel: 'CONFIRM PASSWORD',
    confirmPassPlaceholder: 'Re-enter your password',
    termsAgreement: 'I agree to APMC Digital Mandi Regulations & Quality Audit Protocols',
    signUpBtn: 'Register & Complete Verification',
    registering: 'Creating Account & Registering…',
    alreadyHaveAccount: 'Already registered on OnionGuard AI?',
    signInHere: 'Sign In to Portal',
    secTitle: 'NIC 256-Bit Encrypted Portal',
    secSubtitle: 'Government Authorized APMC Personnel & Stakeholders Network',
  },
  HI: {
    headerTitle: 'पंजीकरण पोर्टल',
    headerSubtitle: 'APMC गुणवत्ता एवं ग्रेडिंग प्लेटफॉर्म',
    badge: 'भारत सरकार · SIH 2026',
    formTitle: 'आधिकारिक खाता बनाएं',
    formSubtitle: 'एआई-संचालित मंडी गुणवत्ता मूल्यांकन के लिए पंजीकरण करें',
    roleLabel: 'अपनी भूमिका चुनें',
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'अपना पूरा आधिकारिक नाम दर्ज करें',
    emailPhoneLabel: 'ईमेल / मोबाइल नंबर',
    emailPhonePlaceholder: 'officer@doca.gov.in या 9876543210',
    orgLabel: 'संगठन / विभाग',
    orgPlaceholder: 'जैसे उपभोक्ता मामले विभाग / नाफेड',
    centerLabel: 'प्राथमिक एपीएमसी मंडी केंद्र',
    passLabel: 'सुरक्षा पासवर्ड',
    passPlaceholder: 'एक मजबूत पासवर्ड बनाएं (न्यूनतम 6 अक्षर)',
    confirmPassLabel: 'पासवर्ड की पुष्टि करें',
    confirmPassPlaceholder: 'अपना पासवर्ड पुनः दर्ज करें',
    termsAgreement: 'मैं APMC डिजिटल मंडी नियमों और गुणवत्ता ऑडिट प्रोटोकॉल से सहमत हूं',
    signUpBtn: 'पंजीकरण करें और सत्यापन पूरा करें',
    registering: 'खाता बनाया जा रहा है…',
    alreadyHaveAccount: 'क्या OnionGuard AI पर पहले से पंजीकृत हैं?',
    signInHere: 'पोर्टल में साइन इन करें',
    secTitle: 'NIC 256-बिट सुरक्षित पोर्टल',
    secSubtitle: 'केवल अधिकृत APMC कर्मियों और हितधारकों के लिए',
  },
  MR: {
    headerTitle: 'नोंदणी पोर्टल',
    headerSubtitle: 'APMC गुणवत्ता व ग्रेडिंग प्लॅटफॉर्म',
    badge: 'महाराष्ट्र शासन · SIH 2026',
    formTitle: 'अधिकृत खाते तयार करा',
    formSubtitle: 'एआय-आधारित मार्केट यार्ड गुणवत्ता मूल्यांकनासाठी नोंदणी करा',
    roleLabel: 'आपली भूमिका निवडा',
    nameLabel: 'पूर्ण नाव',
    namePlaceholder: 'आपले पूर्ण नाव टाका',
    emailPhoneLabel: 'ईमेल / मोबाईल नंबर',
    emailPhonePlaceholder: 'officer@doca.gov.in किंवा 9876543210',
    orgLabel: 'संस्था / विभाग',
    orgPlaceholder: 'उदा. ग्राहक व्यवहार विभाग / नाफेड',
    centerLabel: 'प्राथमिक एपीएमसी मार्केट यार्ड',
    passLabel: 'सुरक्षा पासवर्ड',
    passPlaceholder: 'सुरक्षित पासवर्ड तयार करा (कमीत कमी ६ अक्षरे)',
    confirmPassLabel: 'पासवर्डची पुष्टी करा',
    confirmPassPlaceholder: 'पासवर्ड पुन्हा टाका',
    termsAgreement: 'मी APMC डिजिटल नियम आणि गुणवत्ता ऑडिट नियमांशी सहमत आहे',
    signUpBtn: 'नोंदणी करा व पडताळणी करा',
    registering: 'खाते तयार होत आहे…',
    alreadyHaveAccount: 'OnionGuard AI वर आधीच नोंदणी केली आहे का?',
    signInHere: 'साइन इन करा',
    secTitle: 'NIC 256-बिट एनक्रिप्टेड पोर्टल',
    secSubtitle: 'फक्त अधिकृत APMC अधिकारी व घटकांसाठी',
  },
};

const roles: RoleOption[] = [
  {
    id: 'INSPECTION_OFFICER',
    label: 'Quality Inspector',
    desc: 'Conduct lot sample assessments & issue digital certificates',
    icon: ShieldCheck,
    color: '#1B6B3A',
  },
  {
    id: 'FARMER',
    label: 'Farmer / Producer',
    desc: 'Submit produce lots & view objective grading results',
    icon: Sprout,
    color: '#27AE60',
  },
  {
    id: 'PROCUREMENT_MANAGER',
    label: 'Procurement Officer',
    desc: 'Manage mandi lots, buffer stock & channel allocation',
    icon: Briefcase,
    color: '#E8650A',
  },
  {
    id: 'BUYER',
    label: 'Trader / Buyer',
    desc: 'Participate in quality-certified e-auctions & procurement',
    icon: ShoppingBag,
    color: '#7C3AED',
  },
];

export default function SignUpScreen() {
  const { navigate, setInspectionData, setCurrentUser } = useApp();

  // Local state
  const [lang, setLang] = useState<Lang>('EN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('INSPECTION_OFFICER');
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [organization, setOrganization] = useState('Department of Consumer Affairs');
  const [selectedCenter, setSelectedCenter] = useState(apmcCenters[0].name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const t = translations[lang];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter an email address or mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the APMC Digital Mandi terms.');
      return;
    }

    setLoading(true);

    const formattedEmail = emailOrPhone.includes('@')
      ? emailOrPhone.trim()
      : `user.${emailOrPhone.trim()}@doca.gov.in`;

    try {
      // 1. Call Backend API
      const userObj = await registerUser({
        email: formattedEmail,
        name: name.trim(),
        password: password,
        role: selectedRole,
        organization: organization || 'Department of Consumer Affairs',
        center_id: selectedCenter,
      });

      // 2. Auto Login after successful registration
      const authRes = await loginUser(formattedEmail, password).catch(() => null);

      if (authRes && authRes.user) {
        setCurrentUser(authRes.user);
      } else {
        setCurrentUser(userObj);
      }

      setSuccessMessage('Registration successful! Redirecting to APMC Portal…');

      setInspectionData({
        batchId: '',
        center: selectedCenter,
        inspector: name.trim(),
        variety: 'Garwa',
        quantity: '500',
        commodity: 'Onion',
        farmerName: selectedRole === 'FARMER' ? name.trim() : 'Ramesh Patil',
      });

      setTimeout(() => {
        setLoading(false);
        navigate('dashboard');
      }, 1000);
    } catch (err: any) {
      console.warn('Registration backend error, using local fallback:', err);
      // Fallback local sign up for offline / demo mode
      const mockUser = {
        id: Date.now(),
        name: name.trim(),
        email: formattedEmail,
        role: selectedRole,
        organization: organization,
        center_id: selectedCenter,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(mockUser);

      setInspectionData({
        batchId: '',
        center: selectedCenter,
        inspector: name.trim(),
        variety: 'Garwa',
        quantity: '500',
        commodity: 'Onion',
        farmerName: selectedRole === 'FARMER' ? name.trim() : 'Ramesh Patil',
      });

      setSuccessMessage('Account registered successfully (Demo Mode)! Redirecting…');
      setTimeout(() => {
        setLoading(false);
        navigate('dashboard');
      }, 1000);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: '#F4F7F5' }}>
      {/* Top Header */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(165deg, #071E14 0%, #0A2B1D 45%, #0D472B 100%)',
          paddingBottom: 28,
        }}
      >
        <StatusBar dark />

        {/* Ambient Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="signupGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#signupGrid)" />
          </svg>
        </div>

        {/* Header Top Navigation */}
        <div className="px-5 pt-1 flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate('login')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white/80 hover:text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </button>

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

        {/* Branding & Title */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-3.5 relative z-10">
          <div
            className="flex items-center justify-center rounded-2xl relative shadow-lg shrink-0"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <OnionLogo size={32} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white" style={{ fontSize: 20, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                OnionGuard AI
              </h1>
              <span
                className="px-1.5 py-0.5 rounded font-bold"
                style={{ fontSize: 9, background: '#10B981', color: 'white', letterSpacing: '0.5px' }}
              >
                SIGN UP
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11.5, marginTop: 1 }}>
              {t.headerSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Form Card */}
      <div className="flex-1 overflow-y-auto px-4 -mt-4 relative z-20 pb-8">
        <form
          onSubmit={handleRegister}
          className="rounded-3xl p-5 mb-4 shadow-xl"
          style={{ background: '#FFFFFF', border: '1px solid rgba(212,228,218,0.6)' }}
        >
          {/* Header Title */}
          <div className="mb-5">
            <h2 className="font-extrabold" style={{ fontSize: 19, color: '#1A2F23', letterSpacing: '-0.3px' }}>
              {t.formTitle}
            </h2>
            <p style={{ fontSize: 12, color: '#5E7468', marginTop: 2 }}>{t.formSubtitle}</p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div
              className="mb-4 p-3.5 rounded-2xl flex items-center gap-2.5 font-semibold animate-fadeIn"
              style={{ background: '#E8F5EE', border: '1.5px solid #A3E0BA', color: '#15803D', fontSize: 13 }}
            >
              <CheckCircle2 size={18} className="shrink-0 text-[#15803D]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="mb-4 p-3.5 rounded-2xl flex items-center gap-2.5 font-semibold animate-fadeIn"
              style={{ background: '#FDECEA', border: '1.5px solid #F9BBBD', color: '#C0392B', fontSize: 13 }}
            >
              <ShieldAlert size={18} className="shrink-0 text-[#C0392B]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ROLE SELECTOR GRID */}
          <div className="mb-5">
            <label className="block font-bold mb-2" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
              {t.roleLabel}
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {roles.map((r) => {
                const IconComponent = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className="flex flex-col p-3 rounded-2xl text-left transition-all relative border"
                    style={{
                      background: isSelected ? '#F0F9F4' : '#F9FBF9',
                      borderColor: isSelected ? '#1B6B3A' : '#E2E8E4',
                      boxShadow: isSelected ? '0 4px 14px rgba(27,107,58,0.12)' : 'none',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#1B6B3A' }} />
                    )}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 shrink-0"
                      style={{
                        background: isSelected ? r.color : '#EAF1EC',
                        color: isSelected ? 'white' : r.color,
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span className="font-bold text-xs" style={{ color: '#1A2F23', lineHeight: 1.2 }}>
                      {r.label}
                    </span>
                    <span style={{ fontSize: 10, color: '#6A8073', marginTop: 2, lineHeight: 1.2 }}>
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INPUT FIELDS */}
          <div className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.nameLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: `1.5px solid ${name ? '#1B6B3A' : '#D4E4DA'}`,
                }}
              >
                <User size={18} style={{ color: name ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium"
                  style={{ fontSize: 13.5, color: '#1A2F23' }}
                />
              </div>
            </div>

            {/* Email / Mobile */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.emailPhoneLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: `1.5px solid ${emailOrPhone ? '#1B6B3A' : '#D4E4DA'}`,
                }}
              >
                <Mail size={18} style={{ color: emailOrPhone ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={t.emailPhonePlaceholder}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium"
                  style={{ fontSize: 13.5, color: '#1A2F23' }}
                />
              </div>
            </div>

            {/* APMC Center Select */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.centerLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: '1.5px solid #D4E4DA',
                }}
              >
                <MapPin size={18} style={{ color: '#1B6B3A', flexShrink: 0 }} />
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-semibold text-ellipsis overflow-hidden"
                  style={{ fontSize: 13, color: '#1A2F23' }}
                >
                  {apmcCenters.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Organization / Dept */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.orgLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: `1.5px solid ${organization ? '#1B6B3A' : '#D4E4DA'}`,
                }}
              >
                <Building2 size={18} style={{ color: organization ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder={t.orgPlaceholder}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium"
                  style={{ fontSize: 13.5, color: '#1A2F23' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.passLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: `1.5px solid ${password ? '#1B6B3A' : '#D4E4DA'}`,
                }}
              >
                <Lock size={18} style={{ color: password ? '#1B6B3A' : '#8EA899', flexShrink: 0 }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t.passPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium"
                  style={{ fontSize: 13.5, color: '#1A2F23' }}
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

            {/* Confirm Password */}
            <div>
              <label className="block font-bold mb-1.5" style={{ fontSize: 11, color: '#3D5244', letterSpacing: '0.5px' }}>
                {t.confirmPassLabel}
              </label>
              <div
                className="flex items-center gap-2.5 rounded-2xl px-3.5"
                style={{
                  height: 50,
                  background: '#F4F7F5',
                  border: `1.5px solid ${confirmPassword ? (password === confirmPassword ? '#1B6B3A' : '#E74C3C') : '#D4E4DA'}`,
                }}
              >
                <Lock size={18} style={{ color: confirmPassword ? (password === confirmPassword ? '#1B6B3A' : '#E74C3C') : '#8EA899', flexShrink: 0 }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t.confirmPassPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium"
                  style={{ fontSize: 13.5, color: '#1A2F23' }}
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 mt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#1B6B3A] rounded cursor-pointer"
              />
              <label htmlFor="agree" className="font-medium cursor-pointer" style={{ fontSize: 12, color: '#5E7468', lineHeight: 1.35 }}>
                {t.termsAgreement}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-white mt-3 transition-all active:scale-[0.98]"
              style={{
                height: 54,
                fontSize: 15,
                background: 'linear-gradient(135deg, #1B6B3A 0%, #267A46 100%)',
                boxShadow: '0 6px 20px rgba(27,107,58,0.32)',
              }}
            >
              {loading ? (
                <>
                  <div
                    className="border-2 border-white border-t-transparent rounded-full"
                    style={{ width: 20, height: 20, animation: 'spin 0.75s linear infinite' }}
                  />
                  <span>{t.registering}</span>
                </>
              ) : (
                <>
                  <span>{t.signUpBtn}</span>
                  <ArrowRight size={19} strokeWidth={2.5} />
                </>
              )}
            </button>

            {/* Bottom Link to Sign In */}
            <div className="text-center mt-3 pt-3 border-t border-[#E8EDE9]">
              <p style={{ fontSize: 12.5, color: '#5E7468' }}>
                {t.alreadyHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="font-bold underline text-[#1B6B3A] hover:text-[#0D472B] ml-1"
                >
                  {t.signInHere}
                </button>
              </p>
            </div>
          </div>
        </form>

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
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
