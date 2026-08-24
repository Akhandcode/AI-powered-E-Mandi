import { AppProvider, useApp } from './context';

import type { Screen } from './types';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import NewInspectionScreen from './screens/NewInspectionScreen';
import CameraScreen from './screens/CameraScreen';
import CaptureSampleScreen from './screens/CaptureSampleScreen';
import AIAnalysisScreen from './screens/AIAnalysisScreen';
import AIDetectionResultsScreen from './screens/AIDetectionResultsScreen';
import SizeMeasurementScreen from './screens/SizeMeasurementScreen';
import DetectionResultsScreen from './screens/DetectionResultsScreen';
import QualityAssessmentScreen from './screens/QualityAssessmentScreen';
import FinalReportScreen from './screens/FinalReportScreen';
import InspectionHistoryScreen from './screens/InspectionHistoryScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';

import OnionLogo from './components/OnionLogo';

import {
  LayoutDashboard,
  ScanLine,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

function AppShell() {
  const { screen, navigate } = useApp();

  const isAuthOrSplash =
    screen === 'splash' || screen === 'login';

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;

      case 'login':
        return <LoginScreen />;

      case 'dashboard':
        return <DashboardScreen />;

      case 'new-inspection':
        return <NewInspectionScreen />;

      case 'camera':
        return <CameraScreen />;

      case 'capture-sample':
        return <CaptureSampleScreen />;

      case 'ai-analysis':
        return <AIAnalysisScreen />;

      case 'ai-detection-results':
        return <AIDetectionResultsScreen />;

      case 'size-measurement':
        return <SizeMeasurementScreen />;

      case 'detection-results':
        return <DetectionResultsScreen />;

      case 'quality-assessment':
        return <QualityAssessmentScreen />;

      case 'final-report':
        return <FinalReportScreen />;

      case 'history':
        return <InspectionHistoryScreen />;

      case 'report-details':
        return <ReportDetailsScreen />;

      case 'profile':
        return <ProfileScreen />;

      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans"
      style={{
        background:
          'linear-gradient(135deg, #071E14 0%, #0D3322 40%, #12452F 80%, #18583D 100%)',
      }}
    >
      {/* Background Dots Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="appDots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.5"
                fill="white"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#appDots)"
          />
        </svg>
      </div>

      {/* Top Executive Desktop Web Navbar */}
      <header className="sticky top-0 z-50 bg-[#071E14]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center">
            <OnionLogo size={22} />
          </div>

          <div>
            <span className="font-extrabold text-white text-sm md:text-base tracking-wider uppercase flex items-center gap-2">
              ONIONGUARD AI
              <span className="text-[#34D399] font-normal text-xs">
                · APMC PORTAL
              </span>
            </span>

            <span className="text-[10px] text-white/50 block -mt-0.5">
              Ministry of Agriculture · Govt. of India
            </span>
          </div>
        </div>

        {/* Right Desktop Nav Links & Badges */}
        {!isAuthOrSplash && (
          <div className="hidden md:flex items-center gap-3">

            {/* Dashboard */}
            <button
              onClick={() => navigate('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                screen === 'dashboard'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            {/* Inspect */}
            <button
              onClick={() => navigate('new-inspection')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                screen === 'new-inspection'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <ScanLine size={14} />
              <span>Inspect</span>
            </button>

            {/* Reports */}
            <button
              onClick={() => navigate('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                screen === 'history'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Reports</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate('profile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                screen === 'profile'
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <User size={14} />
              <span>Profile</span>
            </button>
          </div>
        )}

        {/* Verified Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#34D399] text-xs font-bold">
          <ShieldCheck size={14} />

          <span className="hidden sm:inline">
            Govt. Verified
          </span>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 flex items-center justify-center p-0 md:p-6 lg:p-8 relative">
        <div
          className="w-full max-w-6xl min-h-screen md:min-h-[840px] md:my-auto bg-[#F8FAF8] md:rounded-3xl shadow-2xl border border-white/15 relative flex flex-col overflow-hidden"
          style={{
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Main App Content Screen */}
          <div className="relative flex-1 flex flex-col overflow-hidden bg-[#F8FAF8]">
            {renderScreen()}
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-2.5 px-4 text-center text-white/40 text-xs border-t border-white/5 bg-[#071E14]/70 backdrop-blur-sm">
        <span>
          Ministry of Agriculture & Farmers Welfare · Smart India Hackathon 2026 · APMC Digital Network
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}