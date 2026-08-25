import { useEffect, useState } from 'react';
import { Search, ChevronRight, PlusCircle, RefreshCw, Trash2, X } from 'lucide-react';
import { useApp } from '../context';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';
import { listLots, LotItem } from '../services/api';

const filters = ['All', 'Graded', 'Pending', 'Disputed'];

function statusStyle(s: string) {
  const lower = s ? s.toLowerCase() : 'pending';
  if (lower === 'graded' || lower === 'pass') return { bg: '#DCFCE7', color: '#15803D', label: 'Graded' };
  if (lower === 'disputed' || lower === 'marginal') return { bg: '#FFFBEB', color: '#D97706', label: 'Disputed' };
  return { bg: '#E2E8F0', color: '#475569', label: 'Pending' };
}

export default function InspectionHistoryScreen() {
  const { navigate, setActiveLotId } = useApp();
  const [lots, setLots] = useState<LotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [reportToDelete, setReportToDelete] = useState<LotItem | null>(null);

  const fetchLotsFromBackend = () => {
    setLoading(true);
    listLots()
      .then((data) => setLots(data))
      .catch((err) => console.warn('Failed to fetch backend lots', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLotsFromBackend();
  }, []);

  const handleDeleteConfirm = (id: number) => {
    setLots((prev) => prev.filter((item) => item.id !== id));
    setReportToDelete(null);
  };

  const filtered = lots.filter((r) => {
    const matchSearch =
      !query ||
      r.lot_number.toLowerCase().includes(query.toLowerCase()) ||
      (r.farmer_name && r.farmer_name.toLowerCase().includes(query.toLowerCase())) ||
      (r.variety && r.variety.toLowerCase().includes(query.toLowerCase()));
    const matchFilter =
      filter === 'All' ||
      (filter === 'Graded' && r.status.toLowerCase() === 'graded') ||
      (filter === 'Pending' && r.status.toLowerCase() === 'pending') ||
      (filter === 'Disputed' && r.status.toLowerCase() === 'disputed');
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
            {lots.length} backend lots recorded
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
            placeholder="Search lot number, variety, or farmer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: '#1A2F23' }}
          />
          <button onClick={fetchLotsFromBackend} title="Refresh Lots" style={{ color: '#5E7468' }}>
            <RefreshCw size={17} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
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
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <PlusCircle size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No Inspection Lots Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mb-5">
              Start a new inspection lot to perform AI quality assessment and save genuine records to the database.
            </p>
            <button
              onClick={() => navigate('new-inspection')}
              className="px-5 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-xs font-bold shadow-md hover:bg-[#14522C]"
            >
              Start New Inspection
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((r) => {
              const badge = statusStyle(r.status);
              const formattedDate = new Date(r.created_at).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div
                  key={r.id}
                  className="w-full text-left rounded-2xl p-4 transition-all hover:border-[#1B6B3A]/30 border border-transparent bg-white shadow-sm relative group"
                >
                  <div
                    onClick={() => {
                      setActiveLotId(r.id);
                      navigate('quality-assessment');
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2.5 pr-8">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold" style={{ fontSize: 15, color: '#1A2F23' }}>{r.lot_number}</span>
                          <span
                            className="px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{ fontSize: 10.5, background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Farmer: {r.farmer_name || 'Shri Farmer'} · {r.variety || 'Red Onion'}
                        </p>
                      </div>
                      <div
                        className="flex flex-col items-center justify-center rounded-2xl font-bold flex-shrink-0 px-3 py-1.5"
                        style={{
                          background: '#E8F5EE',
                          color: '#1B6B3A',
                          fontSize: 13,
                        }}
                      >
                        <span>{r.total_weight_kg} kg</span>
                        <span className="text-[9px] font-normal text-slate-500">{r.bag_count} Bags</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                      <span className="text-xs font-medium text-emerald-800">{r.procurement_center}</span>
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: 11, color: '#5E7468' }}>{formattedDate}</span>
                        <ChevronRight size={14} style={{ color: '#5E7468' }} />
                      </div>
                    </div>
                  </div>

                  {/* Delete Report Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReportToDelete(r);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⚠️ Delete Report Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setReportToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={32} />
            </div>

            <h3 className="text-slate-900 font-extrabold text-lg mb-1.5">
              Delete Inspection Report?
            </h3>

            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete report <strong className="text-slate-800">{reportToDelete.lot_number}</strong>? This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteConfirm(reportToDelete.id)}
                className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-700 active:scale-95 transition-transform"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

