import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useApp } from '../context';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';

const reports = [
  { id: 'OG-20260823-048', batch: 'APMC-NAS-4722', date: '23 Aug 2026', time: '11:58 AM', qty: '50 kg', score: 87, gradeA: 82, urs: 18, status: 'pass', variety: 'Nasik Red' },
  { id: 'OG-20260823-047', batch: 'APMC-NAS-4721', date: '23 Aug 2026', time: '11:42 AM', qty: '75 kg', score: 88, gradeA: 85, urs: 15, status: 'pass', variety: 'Nasik Red' },
  { id: 'OG-20260823-046', batch: 'APMC-NAS-4720', date: '23 Aug 2026', time: '10:15 AM', qty: '60 kg', score: 72, gradeA: 70, urs: 30, status: 'marginal', variety: 'Bellary Red' },
  { id: 'OG-20260823-045', batch: 'APMC-NAS-4718', date: '23 Aug 2026', time: '9:03 AM', qty: '80 kg', score: 91, gradeA: 89, urs: 11, status: 'pass', variety: 'Nasik Red' },
  { id: 'OG-20260822-044', batch: 'APMC-NAS-4715', date: '22 Aug 2026', time: '3:45 PM', qty: '45 kg', score: 65, gradeA: 62, urs: 38, status: 'fail', variety: 'Patna White' },
  { id: 'OG-20260822-043', batch: 'APMC-NAS-4714', date: '22 Aug 2026', time: '2:12 PM', qty: '90 kg', score: 84, gradeA: 81, urs: 19, status: 'pass', variety: 'Agrifound Dark Red' },
  { id: 'OG-20260822-042', batch: 'APMC-NAS-4713', date: '22 Aug 2026', time: '11:30 AM', qty: '55 kg', score: 79, gradeA: 76, urs: 24, status: 'pass', variety: 'Nasik Red' },
];

const filters = ['All', 'Passed', 'Marginal', 'Failed'];

function statusStyle(s: string) {
  if (s === 'pass') return { bg: '#DCFCE7', color: '#15803D', label: 'Passed' };
  if (s === 'marginal') return { bg: '#FFFBEB', color: '#D97706', label: 'Marginal' };
  return { bg: '#FDECEA', color: '#C0392B', label: 'Failed' };
}

function scoreColor(n: number) {
  if (n >= 85) return '#1B6B3A';
  if (n >= 70) return '#D97706';
  return '#C0392B';
}

export default function InspectionHistoryScreen() {
  const { navigate } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = reports.filter((r) => {
    const matchSearch = !query || r.batch.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'All' ||
      (filter === 'Passed' && r.status === 'pass') ||
      (filter === 'Marginal' && r.status === 'marginal') ||
      (filter === 'Failed' && r.status === 'fail');
    return matchSearch && matchFilter;
  });

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1">
          <h1 className="font-bold text-white" style={{ fontSize: 22, letterSpacing: '-0.4px', marginBottom: 4 }}>
            Inspection Reports
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {reports.length} inspections · APMC Nashik Center 3
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="px-4 pt-4 pb-3" style={{ background: '#F4F7F5' }}>
        <div
          className="flex items-center gap-2.5 rounded-xl px-4 mb-3"
          style={{ height: 48, background: 'white', border: '1.5px solid #D4E4DA' }}
        >
          <Search size={17} strokeWidth={2} style={{ color: '#5E7468', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search batch ID or report ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: '#1A2F23' }}
          />
          <button style={{ color: '#5E7468' }}>
            <SlidersHorizontal size={17} strokeWidth={2} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full font-semibold"
              style={{
                fontSize: 13,
                background: filter === f ? '#1B6B3A' : 'white',
                color: filter === f ? 'white' : '#5E7468',
                border: '1.5px solid',
                borderColor: filter === f ? '#1B6B3A' : '#D4E4DA',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Report list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p style={{ fontSize: 15, color: '#5E7468' }}>No reports found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((r) => {
              const badge = statusStyle(r.status);
              return (
                <button
                  key={r.id}
                  onClick={() => navigate('report-details')}
                  className="w-full text-left rounded-2xl p-4"
                  style={{ background: 'white', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>{r.batch}</span>
                        <span
                          className="px-2 py-0.5 rounded-full font-semibold"
                          style={{ fontSize: 10.5, background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="font-mono" style={{ fontSize: 11, color: '#5E7468', fontFamily: 'var(--font-mono)' }}>
                        {r.id}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-center rounded-2xl font-bold flex-shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: r.score >= 85 ? '#E8F5EE' : r.score >= 70 ? '#FFFBEB' : '#FDECEA',
                        color: scoreColor(r.score),
                        fontSize: 16,
                      }}
                    >
                      {r.score}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <span style={{ fontSize: 12.5, color: '#1B6B3A', fontWeight: 600 }}>A: {r.gradeA}%</span>
                      <span style={{ fontSize: 12.5, color: '#E8650A', fontWeight: 600 }}>URS: {r.urs}%</span>
                      <span style={{ fontSize: 12.5, color: '#5E7468' }}>{r.qty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: 11.5, color: '#5E7468' }}>{r.date} · {r.time}</span>
                      <ChevronRight size={14} style={{ color: '#5E7468' }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
