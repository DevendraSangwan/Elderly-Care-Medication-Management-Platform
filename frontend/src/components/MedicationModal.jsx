import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pill, X, Plus, Trash2, Clock, Check, AlertCircle } from 'lucide-react';

export const MedicationModal = ({ isOpen, onClose, medication = null, onSuccess }) => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    frequency: 'daily',
    times: ['08:00'],
    instructions: 'Take with a glass of water after food',
    pillColor: 'blue',
    pillShape: 'round',
    prescribingDoctor: '',
    purpose: '',
    stockCount: 30,
    lowStockThreshold: 7
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        form: medication.form || 'tablet',
        frequency: medication.frequency || 'daily',
        times: medication.times || ['08:00'],
        instructions: medication.instructions || '',
        pillColor: medication.pillColor || 'blue',
        pillShape: medication.pillShape || 'round',
        prescribingDoctor: medication.prescribingDoctor || '',
        purpose: medication.purpose || '',
        stockCount: medication.stockCount !== undefined ? medication.stockCount : 30,
        lowStockThreshold: medication.lowStockThreshold !== undefined ? medication.lowStockThreshold : 7
      });
    } else {
      setFormData({
        name: '',
        dosage: '',
        form: 'tablet',
        frequency: 'daily',
        times: ['08:00'],
        instructions: 'Take with a glass of water after food',
        pillColor: 'blue',
        pillShape: 'round',
        prescribingDoctor: '',
        purpose: '',
        stockCount: 30,
        lowStockThreshold: 7
      });
    }
    setError('');
  }, [medication, isOpen]);

  const pillColors = [
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { id: 'white', label: 'White', bg: 'bg-slate-200 border border-slate-400' },
    { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-400' },
    { id: 'red', label: 'Red', bg: 'bg-red-500' },
    { id: 'green', label: 'Green', bg: 'bg-emerald-500' },
    { id: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { id: 'pink', label: 'Pink', bg: 'bg-pink-400' }
  ];

  const pillShapes = [
    { id: 'round', label: 'Round Circle', icon: 'rounded-full w-7 h-7' },
    { id: 'oval', label: 'Oval Tablet', icon: 'rounded-full w-9 h-6' },
    { id: 'capsule', label: 'Capsule', icon: 'rounded-full w-10 h-5' },
    { id: 'square', label: 'Square', icon: 'rounded-md w-7 h-7' }
  ];

  const handleAddTime = () => {
    setFormData((prev) => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const handleRemoveTime = (index) => {
    if (formData.times.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (index, value) => {
    const updated = [...formData.times];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, times: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dosage.trim()) {
      setError('Please provide medication name and dosage.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (medication?._id) {
        await api.updateMedication(medication._id, formData);
      } else {
        await api.addMedication(targetId, formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                {medication ? 'Edit Medication Schedule' : 'Add New Medication'}
              </h2>
              <p className="text-xs text-slate-400">
                Prescription dosage, timing & accessibility visualizer
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Metformin, Lisinopril"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Dosage *
              </label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500 mg, 1 tablet, 10 ml"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Form & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Form
              </label>
              <select
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="tablet">Tablet / Pill</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid / Syrup</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
                <option value="drops">Drops</option>
                <option value="patch">Patch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="daily">Once Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="three_times_daily">Three Times Daily</option>
                <option value="four_times_daily">Four Times Daily</option>
                <option value="as_needed">As Needed (PRN)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Scheduled Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase text-slate-600">
                Scheduled Daily Times (HH:MM 24-hr) *
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Time
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.times.map((t, index) => (
                <div key={index} className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-300">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="time"
                    required
                    value={t}
                    onChange={(e) => handleTimeChange(index, e.target.value)}
                    className="w-full bg-transparent font-bold text-sm focus:outline-none"
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(index)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Senior Accessibility: Pill Visualizer (Color & Shape) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">
              🎨 Senior Visual Aid (Helps Elderly Identify the Pill)
            </span>

            {/* Color selection */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Pill Color:</span>
              <div className="flex flex-wrap gap-2">
                {pillColors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, pillColor: c.id })}
                    className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-all ${
                      formData.pillColor === c.id ? 'ring-4 ring-brand-500 scale-110' : 'hover:scale-105'
                    }`}
                    title={c.label}
                  >
                    {formData.pillColor === c.id && (
                      <Check className={`w-4 h-4 ${c.id === 'white' || c.id === 'yellow' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape selection */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">Pill Shape:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {pillShapes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, pillShape: s.id })}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      formData.pillShape === s.id
                        ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className={`${s.icon} bg-slate-300 shadow-inner`} />
                    <span className="text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions & Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Instructions for the Patient
            </label>
            <input
              type="text"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="e.g. Take with a glass of water after breakfast"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Medical Purpose / Condition
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g. Blood Pressure, Diabetes"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Prescribing Doctor
              </label>
              <input
                type="text"
                value={formData.prescribingDoctor}
                onChange={(e) => setFormData({ ...formData, prescribingDoctor: e.target.value })}
                placeholder="e.g. Dr. Robert Henderson"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stock tracking */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Current Stock (Pills Left)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Refill Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : medication ? 'Update Schedule' : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
