import { useState } from 'react';
import {
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  Award,
  ShieldCheck,
  MapPin,
  QrCode,
  CheckCircle2,
  Sliders,
  Moon,
  WifiOff,
  User,
  Building2,
  ExternalLink,
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';

export default function ProfileScreen() {
  const { navigate, inspectionData } = useApp();

  // Local interactive states
  const [offlineSync, setOfflineSync] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Inspector fallback values from context or demo
  const inspectorName = inspectionData.inspector || 'Rajesh Kumar';
  const centerName = inspectionData.center || 'APMC Nashik — Center 3';
  const initials = inspectorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      {/* Top Header Banner */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          background: 'linear-gradient(165deg, #0B2515 0%, #134D2B 45%, #1B6B3A 100%)',
          paddingBottom: 28,
        }}
      >
        <StatusBar dark />

        {/* Ambient Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="profileGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profileGrid)" />
          </svg>
        </div>

        {/* Title Bar */}
        <div className="px-5 pt-1 flex items-center justify-between relative z-10 mb-4">
          <h1 className="font-extrabold text-white text-xl tracking-tight">Inspector Profile</h1>
          <button
            onClick={() => setShowIdCard(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#4ADE80',
              fontSize: 11.5,
            }}
          >
            <QrCode size={13} />
            <span>APMC Digital ID</span>
          </button>
        </div>

        {/* Hero User Info Card */}
        <div className="px-5 flex items-center gap-4 relative z-10">
          <div className="relative">
            <div
              className="flex items-center justify-center rounded-2xl font-extrabold text-white shadow-xl"
              style={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #2E8B57 0%, #1B6B3A 100%)',
                fontSize: 22,
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}
            >
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 rounded-full p-0.5 bg-[#0D2B18] border border-white"
              title="NIC Verified"
            >
              <CheckCircle2 size={16} className="text-[#4ADE80] fill-[#134D2B]" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-white text-lg tracking-tight">{inspectorName}</h2>
              <span
                className="px-2 py-0.5 rounded-full font-bold"
                style={{ fontSize: 9.5, background: 'rgba(74,222,128,0.2)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.4)' }}
              >
                VERIFIED
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 }}>
              ID: INS-0492 · Class I Officer
            </p>
            <div
              className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.12)', display: 'inline-flex' }}
            >
              <MapPin size={12} style={{ color: '#4ADE80' }} />
              <span style={{ color: '#E8F5EE', fontSize: 11.5, fontWeight: 600 }}>
                {centerName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 -mt-4 relative z-20 pb-24">
        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'Total Inspections', value: '284', sub: '+12 this week', icon: FileText, color: '#1B6B3A', bg: '#E8F5EE' },
            { label: 'AI Accuracy Rate', value: '98.4%', sub: 'Calibrated', icon: Sparkles, color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Avg Grade A', value: '86%', sub: 'High Quality', icon: Award, color: '#E8650A', bg: '#FFF3EB' },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-3 shadow-sm border border-emerald-900/5 text-center flex flex-col justify-between"
              style={{ background: 'white' }}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ width: 24, height: 24, background: bg }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
                <span style={{ fontSize: 9.5, color: '#5E7468', fontWeight: 600 }}>{sub}</span>
              </div>
              <p className="font-extrabold text-left mt-1" style={{ fontSize: 20, color: '#1A2F23', lineHeight: 1 }}>
                {value}
              </p>
              <p className="text-left mt-1" style={{ fontSize: 10.5, color: '#5E7468', fontWeight: 500, lineHeight: 1.2 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Digital APMC Pass Banner */}
        <div
          onClick={() => setShowIdCard(true)}
          className="rounded-2xl p-4 mb-4 shadow-sm cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #1A2F23 0%, #0D1F14 100%)',
            border: '1px solid rgba(74,222,128,0.2)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 44, height: 44, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
            >
              <QrCode size={22} className="text-[#4ADE80]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Official APMC Inspector Pass</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#4ADE80]/20 text-[#4ADE80]">
                  ACTIVE
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                License: MH-APMC-2026-0492 · NIC Encryption
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#4ADE80]" />
        </div>

        {/* Assignment & Mandi Details */}
        <div
          className="rounded-2xl p-4 mb-4 shadow-sm"
          style={{ background: 'white', border: '1px solid rgba(212,228,218,0.6)' }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold" style={{ fontSize: 13.5, color: '#1A2F23', letterSpacing: '-0.2px' }}>
              Mandi Assignment Details
            </h3>
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ fontSize: 10, background: '#E8F5EE', color: '#1B6B3A' }}
            >
              MSAMB Jurisdiction
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Procurement Yard', val: centerName, icon: Building2 },
              { label: 'District & State', val: 'Nashik, Maharashtra', icon: MapPin },
              { label: 'Nodal Authority', val: 'MSAMB Board — Center 3', icon: ShieldCheck },
              { label: 'Service Period', val: 'Apr 2023 – Present (Active)', icon: Award },
            ].map(({ label, val, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{ background: '#F8FAF9', border: '1px solid #E8EDE9' }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} style={{ color: '#1B6B3A' }} />
                  <span style={{ fontSize: 12.5, color: '#5E7468' }}>{label}</span>
                </div>
                <span className="font-bold text-right" style={{ fontSize: 12.5, color: '#1A2F23' }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences & Quick Toggles */}
        <div
          className="rounded-2xl p-4 mb-4 shadow-sm"
          style={{ background: 'white', border: '1px solid rgba(212,228,218,0.6)' }}
        >
          <h3 className="font-bold mb-3 px-1" style={{ fontSize: 13.5, color: '#1A2F23' }}>
            Inspector App Preferences
          </h3>

          <div className="flex flex-col gap-3">
            {/* Offline Sync Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: '#F8FAF9' }}>
              <div className="flex items-center gap-2.5">
                <WifiOff size={18} style={{ color: '#1B6B3A' }} />
                <div>
                  <p className="font-semibold text-xs" style={{ color: '#1A2F23' }}>Offline Mode Auto-Sync</p>
                  <p style={{ fontSize: 11, color: '#5E7468' }}>Cache reports locally in low network</p>
                </div>
              </div>
              <button
                onClick={() => setOfflineSync(!offlineSync)}
                className="w-11 h-6 rounded-full transition-colors p-0.5 relative"
                style={{ background: offlineSync ? '#1B6B3A' : '#CBD5E1' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                  style={{ transform: offlineSync ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {/* AI Grading Alerts Switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: '#F8FAF9' }}>
              <div className="flex items-center gap-2.5">
                <Bell size={18} style={{ color: '#E8650A' }} />
                <div>
                  <p className="font-semibold text-xs" style={{ color: '#1A2F23' }}>AI Quality Anomaly Alerts</p>
                  <p style={{ fontSize: 11, color: '#5E7468' }}>Alert when URS exceeds 20%</p>
                </div>
              </div>
              <button
                onClick={() => setAutoAlerts(!autoAlerts)}
                className="w-11 h-6 rounded-full transition-colors p-0.5 relative"
                style={{ background: autoAlerts ? '#E8650A' : '#CBD5E1' }}
              >
                <div
                  className="w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                  style={{ transform: autoAlerts ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Menu List */}
        <div
          className="rounded-2xl overflow-hidden mb-4 shadow-sm"
          style={{ background: 'white', border: '1px solid rgba(212,228,218,0.6)' }}
        >
          {[
            {
              icon: Award,
              label: 'Certifications & Training',
              sub: 'ICAR & APMC Quality Specialist',
              action: () => setShowCertModal(true),
            },
            {
              icon: FileText,
              label: 'My Inspection History',
              sub: 'View 284 completed batch reports',
              action: () => navigate('history'),
            },
            {
              icon: Shield,
              label: 'Security & Biometrics',
              sub: 'Manage Face ID and Passcode',
              action: () => navigate('login'),
            },
            {
              icon: PhoneCall,
              label: 'APMC Nodal Helpdesk',
              sub: 'Direct support line · 1800-AGRI-APMC',
              action: () => alert('Connecting to APMC Nodal Helpline: 1800-112-233'),
            },
          ].map(({ icon: Icon, label, sub, action }, i, arr) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-[#F8FAF9] active:scale-[0.99] text-left"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #F4F7F5' : 'none' }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 36, height: 36, background: '#E8F5EE' }}
              >
                <Icon size={17} strokeWidth={2} style={{ color: '#1B6B3A' }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-xs" style={{ color: '#1A2F23' }}>
                  {label}
                </p>
                <p style={{ fontSize: 11, color: '#5E7468' }}>{sub}</p>
              </div>
              <ChevronRight size={16} style={{ color: '#94A3B8' }} />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-sm mb-4"
          style={{
            height: 52,
            fontSize: 14.5,
            background: '#FDECEA',
            color: '#C0392B',
            border: '1.5px solid #F9BBBD',
          }}
        >
          <LogOut size={18} strokeWidth={2.2} />
          <span>Sign Out of Inspector Portal</span>
        </button>

        {/* App Footer */}
        <div className="text-center pb-2">
          <p style={{ fontSize: 10.5, color: '#8EA899' }}>
            OnionGuard AI v2.4.1 · NIC & APMC Encrypted
          </p>
          <p style={{ fontSize: 10, color: '#A0B5AA', marginTop: 1 }}>
            Ministry of Agriculture & Farmers Welfare · SIH 2026
          </p>
        </div>
      </div>

      {/* DIGITAL APMC ID CARD MODAL */}
      {showIdCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}
        >
          <div
            className="w-full max-w-xs rounded-3xl p-5 shadow-2xl relative overflow-hidden"
            style={{ background: 'linear-gradient(165deg, #0B2515 0%, #134D2B 50%, #1B6B3A 100%)', color: 'white' }}
          >
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X size={18} />
            </button>

            {/* Government Seal Header */}
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-[#4ADE80]" />
              <div>
                <p className="font-extrabold text-xs text-[#4ADE80] tracking-wider uppercase">Govt. of Maharashtra</p>
                <p className="text-[10px] text-white/70">APMC Digital Identity Pass</p>
              </div>
            </div>

            {/* Profile Detail */}
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/15 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg text-white"
                style={{ background: '#2E8B57' }}
              >
                {initials}
              </div>
              <div>
                <h4 className="font-extrabold text-base leading-tight">{inspectorName}</h4>
                <p className="text-xs text-white/80">Senior Quality Inspector</p>
                <p className="text-[10.5px] text-[#4ADE80] font-mono mt-0.5">ID: MH-APMC-2026-0492</p>
              </div>
            </div>

            {/* QR Mockup */}
            <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center justify-center mb-4">
              <QrCode size={110} className="text-[#0B2515]" />
              <p className="text-[10px] text-gray-500 font-mono mt-2">NIC-VERIFIED-QR · APMC-VALID-2026</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/70 px-1 mb-2">
              <span>Jurisdiction: APMC Nashik</span>
              <span>Valid Thru: Dec 2027</span>
            </div>

            <button
              onClick={() => setShowIdCard(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-[#4ADE80] text-[#0B2515] text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* CERTIFICATIONS MODAL */}
      {showCertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-xs rounded-3xl p-5 shadow-2xl relative bg-white">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#E8F5EE] text-[#1B6B3A]">
                <Award size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1A2F23]">Verified Qualifications</h3>
                <p className="text-xs text-gray-500">APMC & ICAR Accreditation</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
              {[
                { title: 'Certified Agricultural Quality Assessor', by: 'ICAR India · 2024' },
                { title: 'AI Post-Harvest Defect Classifier', by: 'MSAMB Technical Board · 2025' },
                { title: 'Senior APMC Inspector License', by: 'Govt. of Maharashtra · 2026' },
              ].map((c) => (
                <div key={c.title} className="p-3 rounded-2xl bg-[#F8FAF9] border border-[#E8EDE9]">
                  <p className="font-bold text-xs text-[#1A2F23]">{c.title}</p>
                  <p className="text-[11px] text-[#1B6B3A] font-medium mt-0.5">✓ {c.by}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCertModal(false)}
              className="w-full py-2.5 rounded-xl font-bold bg-[#1B6B3A] text-white text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-xs rounded-3xl p-5 shadow-2xl relative bg-white text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDECEA] text-[#C0392B] flex items-center justify-center mx-auto mb-3">
              <LogOut size={22} />
            </div>

            <h3 className="font-bold text-base text-[#1A2F23]">Sign Out?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Are you sure you want to sign out of the OnionGuard AI Inspector Portal?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutModal(false);
                  navigate('login');
                }}
                className="flex-1 py-2.5 rounded-xl font-bold bg-[#C0392B] text-white text-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
