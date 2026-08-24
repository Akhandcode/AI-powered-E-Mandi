import { Signal, Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  dark?: boolean;
}

export default function StatusBar({ dark = false }: StatusBarProps) {
  const color = dark ? 'white' : '#1A2F23';
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1" style={{ height: 36 }}>
      <span className="text-xs font-semibold" style={{ color, fontFamily: 'var(--font-sans)' }}>
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        <Signal size={13} style={{ color }} strokeWidth={2} />
        <Wifi size={13} style={{ color }} strokeWidth={2} />
        <Battery size={14} style={{ color }} strokeWidth={2} />
      </div>
    </div>
  );
}
