import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, X, AlertCircle } from 'lucide-react';

export const AppointmentModal = ({ isOpen, onClose, appointment = null, onSuccess }) => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: 'Cardiologist',
    clinicLocation: '',
    date: '',
    time: '10:00',
    purpose: '',
    preparationNotes: '',
    doctorPhone: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment) {
      setFormData({
        doctorName: appointment.doctorName || '',
        specialty: appointment.specialty || 'General Physician',
        clinicLocation: appointment.clinicLocation || '',
        date: appointment.date || '',
        time: appointment.time || '10:00',
        purpose: appointment.purpose || '',
        preparationNotes: appointment.preparationNotes || '',
        doctorPhone: appointment.doctorPhone || '',
        notes: appointment.notes || ''
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      setFormData({
        doctorName: '',
        specialty: 'Cardiologist',
        clinicLocation: '',
        date: tomorrowStr,
        time: '10:00',
        purpose: '',
        preparationNotes: '',
        doctorPhone: '',
        notes: ''
      });
    }
    setError('');
  }, [appointment, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorName || !formData.clinicLocation || !formData.date || !formData.time || !formData.purpose) {
      setError('Please fill all required appointment fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (appointment?._id) {
        await api.updateAppointment(appointment._id, formData);
      } else {
        await api.createAppointment(targetId, formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                {appointment ? 'Edit Appointment' : 'Schedule Doctor Visit'}
              </h2>
              <p className="text-xs text-slate-400">
                Medical consultations & clinic appointments
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder="Dr. Robert Henderson"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Medical Specialty
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g. Cardiologist, Endocrinology"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Clinic / Hospital Location *
            </label>
            <input
              type="text"
              required
              value={formData.clinicLocation}
              onChange={(e) => setFormData({ ...formData, clinicLocation: e.target.value })}
              placeholder="e.g. Mercy Heart Clinic, Suite 400"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Appointment Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Purpose of Visit *
            </label>
            <input
              type="text"
              required
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Routine blood pressure checkup & blood test review"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Preparation Instructions
            </label>
            <input
              type="text"
              value={formData.preparationNotes}
              onChange={(e) => setFormData({ ...formData, preparationNotes: e.target.value })}
              placeholder="e.g. Fasting 10 hours required. Bring morning medication log."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Clinic Contact Phone
            </label>
            <input
              type="text"
              value={formData.doctorPhone}
              onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
              placeholder="+1 (555) 789-0123"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

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
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : appointment ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
