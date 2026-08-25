import { useState } from 'react';
import { ArrowLeft, ChevronDown, Camera, CheckCircle } from 'lucide-react';
import { useApp } from '../context';
import StatusBar from '../components/StatusBar';

import { createLot } from '../services/api';

const centers = ['APMC Nashik — Center 3', 'APMC Pune — Center 1', 'APMC Lasalgaon — Center 2'];

const commodityVarieties: Record<'Onion' | 'Potato' | 'Tomato', string[]> = {
  Onion: ['Nasik Red', 'Bellary Red', 'Patna White', 'Agrifound Dark Red', 'N-53'],
  Potato: ['Kufri Jyoti', 'Kufri Chandramukhi', 'Kufri Bahar', 'Kufri Lauvkar'],
  Tomato: ['Pusa Ruby', 'Arka Vikas', 'Abhinav', 'Heemsona'],
};

export default function NewInspectionScreen() {
  const { navigate, setInspectionData, setActiveLotId, currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [commodity, setCommodity] = useState<'Onion' | 'Potato' | 'Tomato'>('Onion');
  const [form, setForm] = useState({
    batchId: `LOT-ONION-${Math.floor(1000 + Math.random() * 9000)}`,
    center: currentUser?.center_id ? `APMC Center ${currentUser.center_id}` : 'APMC Lasalgaon Procurement Center',
    inspector: currentUser?.name || 'Inspection Officer',
    farmerName: 'Shri Ramesh Patil',
    variety: 'Nasik Red',
    quantity: '',
  });

  const handleCommodityChange = (newCommodity: 'Onion' | 'Potato' | 'Tomato') => {
    setCommodity(newCommodity);
    const newVarieties = commodityVarieties[newCommodity];
    setForm(prev => ({
      ...prev,
      batchId: `LOT-${newCommodity.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      variety: newVarieties[0] || '',
    }));
  };

  const valid = form.batchId && form.center && form.inspector && form.farmerName && form.variety && form.quantity;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const created = await createLot({
        procurement_center: form.center,
        commodity: commodity,
        variety: form.variety,
        total_weight_kg: Number(form.quantity) || 100,
        bag_count: 20,
        farmer_name: form.farmerName || 'Farmer',
      });
      setActiveLotId(created.id);
    } catch (e) {
      console.warn('Backend server offline or unauthenticated, continuing in prototype mode', e);
    } finally {
      setLoading(false);
      setInspectionData({
        ...form,
        commodity,
      });
      navigate('capture-sample');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#F4F7F5' }}>
      <div style={{ background: 'linear-gradient(160deg, #134D2B 0%, #1B6B3A 100%)' }}>
        <StatusBar dark />
        <div className="px-5 pb-5 pt-1 flex items-center gap-3">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} className="text-white" />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontSize: 20, letterSpacing: '-0.3px' }}>
              New Inspection
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Enter batch details</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {['Batch Details', 'Capture Sample', 'AI Analysis', 'Report'].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 flex-1">
              <div
                className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  fontSize: 11,
                  background: i === 0 ? '#1B6B3A' : '#D4E4DA',
                  color: i === 0 ? 'white' : '#5E7468',
                }}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className="flex-1 rounded-full"
                  style={{ height: 2, background: i === 0 ? '#1B6B3A' : '#D4E4DA' }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-3xl p-5"
          style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <h2 className="font-bold mb-5" style={{ fontSize: 17, color: '#1A2F23' }}>
            Batch Information
          </h2>

          {/* Commodity Selection */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Commodity
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #1B6B3A', background: '#F8FAF9' }}
            >
              <select
                value={commodity}
                onChange={(e) => handleCommodityChange(e.target.value as 'Onion' | 'Potato' | 'Tomato')}
                className="flex-1 bg-transparent outline-none appearance-none font-semibold text-[#1B6B3A]"
                style={{ fontSize: 14 }}
              >
                <option value="Onion">🧅 Onion</option>
                <option value="Potato">🥔 Potato</option>
                <option value="Tomato">🍅 Tomato</option>
              </select>
              <ChevronDown size={16} style={{ color: '#1B6B3A', flexShrink: 0 }} />
            </div>
          </div>

          {/* Batch ID — auto-generated */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Batch ID
              <span
                className="ml-2 px-1.5 py-0.5 rounded font-semibold"
                style={{ fontSize: 10, background: '#E8F5EE', color: '#1B6B3A' }}
              >
                Auto-generated
              </span>
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #D4E4DA', background: '#F8FAF9' }}
            >
              <input
                type="text"
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="flex-1 bg-transparent outline-none font-mono"
                style={{ fontSize: 14, color: '#1A2F23', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Procurement Center */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Procurement Center
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #D4E4DA', background: '#F8FAF9' }}
            >
              <select
                value={form.center}
                onChange={(e) => setForm({ ...form, center: e.target.value })}
                className="flex-1 bg-transparent outline-none appearance-none"
                style={{ fontSize: 14, color: '#1A2F23' }}
              >
                {centers.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} style={{ color: '#5E7468', flexShrink: 0 }} />
            </div>
          </div>

          {/* Inspector Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Inspector Name
            </label>
            <div
              className="flex items-center rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #D4E4DA', background: '#F8FAF9' }}
            >
              <input
                type="text"
                value={form.inspector}
                onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: '#1A2F23' }}
              />
            </div>
          </div>

          {/* Farmer Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Farmer / Seller Name
            </label>
            <div
              className="flex items-center rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #D4E4DA', background: '#F8FAF9' }}
            >
              <input
                type="text"
                placeholder="e.g. Shri Ramesh Patil"
                value={form.farmerName}
                onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: '#1A2F23' }}
              />
            </div>
          </div>

          {/* Variety */}
          <div className="mb-4">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              {commodity} Variety
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{ height: 52, border: '1.5px solid #D4E4DA', background: '#F8FAF9' }}
            >
              <select
                value={form.variety}
                onChange={(e) => setForm({ ...form, variety: e.target.value })}
                className="flex-1 bg-transparent outline-none appearance-none"
                style={{ fontSize: 14, color: '#1A2F23' }}
              >
                {commodityVarieties[commodity].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={16} style={{ color: '#5E7468', flexShrink: 0 }} />
            </div>
          </div>

          {/* Sample Quantity */}
          <div className="mb-2">
            <label className="block font-semibold mb-2" style={{ fontSize: 13, color: '#1A2F23' }}>
              Sample Quantity (kg)
            </label>
            <div
              className="flex items-center gap-3 rounded-xl px-4"
              style={{
                height: 52,
                border: `1.5px solid ${form.quantity ? '#1B6B3A' : '#D4E4DA'}`,
                background: '#F8FAF9',
              }}
            >
              <input
                type="number"
                placeholder="e.g. 50"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: '#1A2F23' }}
              />
              <span style={{ fontSize: 13, color: '#5E7468' }}>kg</span>
            </div>
          </div>

          {/* Info note */}
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 mt-4"
            style={{ background: '#E8F5EE', border: '1px solid #C4DDD0' }}
          >
            <CheckCircle size={16} strokeWidth={2} style={{ color: '#1B6B3A', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#1B6B3A', lineHeight: 1.5 }}>
              All data is saved to the APMC server and linked to your Inspector ID automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="px-5 pb-8 pt-3" style={{ background: '#F4F7F5' }}>
        <button
          onClick={handleContinue}
          disabled={!valid}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl font-bold text-white"
          style={{
            height: 58,
            fontSize: 16,
            background: valid
              ? 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)'
              : '#C8D8CC',
            boxShadow: valid ? '0 4px 16px rgba(27,107,58,0.28)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Camera size={20} strokeWidth={2} />
          Continue to Capture
        </button>
      </div>
    </div>
  );
}
