import { LayoutDashboard, ScanLine, FileText, User } from 'lucide-react';
import { useApp } from '../context';
import type { Screen } from '../types';

const tabs: { label: string; icon: typeof LayoutDashboard; screen: Screen }[] = [
  { label: 'Dashboard', icon: LayoutDashboard, screen: 'dashboard' },
  { label: 'Inspect', icon: ScanLine, screen: 'new-inspection' },
  { label: 'Reports', icon: FileText, screen: 'history' },
  { label: 'Profile', icon: User, screen: 'profile' },
];

export default function BottomNav() {
  const { screen, navigate } = useApp();

  const activeScreen = (s: Screen) => {
    if (s === 'dashboard') return screen === 'dashboard';
    if (s === 'new-inspection') return ['new-inspection', 'camera', 'ai-analysis', 'detection-results', 'quality-assessment', 'final-report'].includes(screen);
    if (s === 'history') return ['history', 'report-details'].includes(screen);
    if (s === 'profile') return screen === 'profile';
    return false;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#D4E4DA] px-2 pb-2 pt-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map(({ label, icon: Icon, screen: s }) => {
          const active = activeScreen(s);
          return (
            <button
              key={s}
              onClick={() => navigate(s)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ minWidth: 64 }}
            >
              <div
                className="flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: 40,
                  height: 32,
                  backgroundColor: active ? '#E8F5EE' : 'transparent',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? '#1B6B3A' : '#5E7468' }}
                />
              </div>
              <span
                className="text-[11px] font-medium"
                style={{ color: active ? '#1B6B3A' : '#5E7468' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
