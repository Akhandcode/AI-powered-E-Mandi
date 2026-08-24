import { Bell, TrendingUp, Award, AlertTriangle, ChevronRight, Plus, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../context';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';

const stats = [
  { label: "Today's Inspections", value: '24', icon: Calendar, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  { label: 'Average Grade A', value: '84%', icon: Award, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Average URS', value: '16%', icon: TrendingUp, color: '#E11D48', bg: '#FFE4E6', border: '#FECDD3' },
  { label: 'Reports Generated', value: '24', icon: AlertTriangle, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
];

const recentReports = [
  { id: 'OG-20260823-047', batch: 'APMC-NAS-4721', grade: 88, gradeA: 85, urs: 15, time: '11:42 AM', status: 'pass', center: 'APMC Nashik — Center 3' },
  { id: 'OG-20260823-046', batch: 'APMC-NAS-4720', grade: 72, gradeA: 70, urs: 30, time: '10:15 AM', status: 'marginal', center: 'APMC Nashik — Center 3' },
  { id: 'OG-20260823-045', batch: 'APMC-NAS-4718', grade: 91, gradeA: 89, urs: 11, time: '9:03 AM', status: 'pass', center: 'APMC Lasalgaon — Center 2' },
];

function statusBadge(s: string) {
  if (s === 'pass') return { bg: '#D1FAE5', color: '#047857', label: 'Passed' };
  if (s === 'marginal') return { bg: '#FEF3C7', color: '#B45309', label: 'Marginal' };
  return { bg: '#FFE4E6', color: '#BE123C', label: 'Failed' };
}

export default function DashboardScreen() {
  const { navigate, inspectionData } = useApp();

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F8FAF8]">
      {/* Executive Header Banner */}
      <div style={{ background: 'linear-gradient(160deg, #071E14 0%, #0D472B 100%)' }}>
        <StatusBar dark />
        <div className="px-5 md:px-8 pb-6 pt-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-white/60 text-xs md:text-sm font-medium">Good Morning,</p>
              <h1 className="font-extrabold text-white text-xl md:text-2xl tracking-tight">
                {inspectionData.inspector || 'Rajesh Kumar'}
              </h1>
              <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-white/10 border border-white/15 inline-flex">
                <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                <span className="text-white/90 text-xs font-semibold">
                  {inspectionData.center || 'APMC Nashik — Center 3'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Inspector Notifications: 3 recent batch alerts verified.')}
                className="relative w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                title="Notifications"
              >
                <Bell size={20} strokeWidth={1.8} />
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#D97706] ring-2 ring-[#0D472B]" />
              </button>
            </div>
          </div>

          {/* Quick CTA Banner */}
          <button
            onClick={() => navigate('new-inspection')}
            className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-transform active:scale-[0.99] shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Plus size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-white text-base md:text-lg leading-tight">
                  Start New Inspection
                </p>
                <p className="text-white/80 text-xs">Tap to begin multi-sample AI batch assessment</p>
              </div>
            </div>
            <ChevronRight size={22} strokeWidth={2.5} className="text-white opacity-90" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Desktop Grid */}
      <div className="flex-1 overflow-y-auto pb-24 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Executive Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 md:p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon size={20} strokeWidth={2} style={{ color }} />
                </div>
                <p className="font-extrabold text-slate-900 text-2xl md:text-3xl leading-none">
                  {value}
                </p>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Multi-Column Grid (Left: Quality Summary + Recent, Right: System Info & APMC Network) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Today's Quality Summary Card */}
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[#059669]" />
                    <h3 className="font-bold text-slate-900 text-base">Today's Quality Summary</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Sun, 23 Aug 2026</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#ECFDF5] rounded-xl p-4 border border-[#A7F3D0]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#047857]">Grade A Procurement</span>
                      <span className="font-extrabold text-[#047857] text-base">84%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#A7F3D0] overflow-hidden">
                      <div className="h-full rounded-full bg-[#059669]" style={{ width: '84%' }} />
                    </div>
                  </div>

                  <div className="bg-[#FFFBEB] rounded-xl p-4 border border-[#FDE68A]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#B45309]">URS Ratio</span>
                      <span className="font-extrabold text-[#B45309] text-base">16%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FDE68A] overflow-hidden">
                      <div className="h-full rounded-full bg-[#D97706]" style={{ width: '16%' }} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Calculated from 24 verified APMC batch inspections · 12,000 kg total volume
                </p>
              </div>

              {/* Recent Inspections Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-base">Recent Inspections</h3>
                  <button
                    onClick={() => navigate('history')}
                    className="text-xs font-bold text-[#059669] hover:underline"
                  >
                    View All Reports →
                  </button>
                </div>

                <div className="space-y-3">
                  {recentReports.map((r) => {
                    const badge = statusBadge(r.status);
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate('report-details')}
                        className="w-full text-left bg-white hover:bg-[#F8FAF8] transition-colors rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{r.batch}</span>
                            <span
                              className="px-2.5 py-0.5 rounded-full font-bold text-[10px]"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-500">{r.id} · {r.center}</p>
                          <div className="flex gap-4 pt-1 text-xs font-medium">
                            <span className="text-[#059669]">Grade A: {r.gradeA}%</span>
                            <span className="text-[#B45309]">URS: {r.urs}%</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xs text-slate-400">{r.time}</span>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-inner"
                            style={{
                              background: r.grade >= 85 ? '#ECFDF5' : r.grade >= 75 ? '#FFFBEB' : '#FFE4E6',
                              color: r.grade >= 85 ? '#047857' : r.grade >= 75 ? '#B45309' : '#BE123C',
                            }}
                          >
                            {r.grade}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols on desktop): Government APMC Network & AI Verification */}
            <div className="lg:col-span-4 space-y-6">
              {/* APMC Verification Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">APMC Standards</h4>
                    <p className="text-[11px] text-slate-500">Ministry of Agriculture</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  All grading calculations follow official MSAMB & APMC standard protocols: Grade A requires minimum 45 mm diameter and &lt;10% total defect ratio.
                </p>

                <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E2E8F0] text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Target Diam:</span>
                    <span className="font-mono font-bold text-slate-900">≥ 45 mm</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Grade A Threshold:</span>
                    <span className="font-mono font-bold text-slate-900">75%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Blockchain Ledger:</span>
                    <span className="font-mono text-[#059669] font-bold">ACTIVE ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
