import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity, X, AlertCircle } from 'lucide-react';

export const VitalsModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [formData, setFormData] = useState({
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    bloodSugar: 110,
    bloodSugarTiming: 'fasting',
    pulseRate: 72,
    oxygenSaturation: 98,
    temperature: 98.6,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.logVitals(targetId, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log vitals');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Record Health Vitals</h2>
              <p className="text-xs text-slate-400">
                Blood pressure, glucose & cardiovascular readings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-xs font-bold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Blood Pressure */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-700 block mb-2">
              Blood Pressure (mmHg)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Systolic (Top)
                </label>
                <input
                  type="number"
                  required
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Diastolic (Bottom)
                </label>
                <input
                  type="number"
                  required
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Blood Sugar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-700 block mb-2">
              Blood Glucose / Sugar
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Reading (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({ ...formData, bloodSugar: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Timing
                </label>
                <select
                  value={formData.bloodSugarTiming}
                  onChange={(e) => setFormData({ ...formData, bloodSugarTiming: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
                >
                  <option value="fasting">Fasting</option>
                  <option value="post_prandial">2 hrs After Meal</option>
                  <option value="bedtime">Bedtime</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pulse & SpO2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Pulse / Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.pulseRate}
                onChange={(e) => setFormData({ ...formData, pulseRate: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                Oxygen SpO2 (%)
              </label>
              <input
                type="number"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData({ ...formData, oxygenSaturation: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
              Observations / Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Martha feels energetic, rested well"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-semibold text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Save Vitals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
