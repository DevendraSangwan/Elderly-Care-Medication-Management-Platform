import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Check
} from 'lucide-react';

export const MedicationsPage = ({ onOpenMedicationModal, onEditMedication }) => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [medications, setMedications] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [viewMode, setViewMode] = useState('schedule'); // 'schedule' | 'catalog'
  const [loading, setLoading] = useState(true);

  const fetchMedicationData = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      const [medsRes, schedRes] = await Promise.all([
        api.getMedications(targetId),
        api.getDailySchedule(targetId, selectedDate)
      ]);

      if (medsRes.success) setMedications(medsRes.medications || []);
      if (schedRes.success) setScheduleData(schedRes);
    } catch (err) {
      console.error('Error fetching medication data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationData();
  }, [targetId, selectedDate]);

  const handleDeleteMedication = async (id, name) => {
    if (confirm(`Are you sure you want to discontinue ${name}?`)) {
      try {
        await api.deleteMedication(id);
        await fetchMedicationData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleUpdateDose = async (logId, status) => {
    try {
      await api.updateDoseStatus(logId, status);
      await fetchMedicationData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPillColorClass = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-white';
      case 'white': return 'bg-slate-100 text-slate-800 border-2 border-slate-300';
      case 'yellow': return 'bg-yellow-400 text-slate-900';
      case 'red': return 'bg-red-500 text-white';
      case 'green': return 'bg-emerald-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'pink': return 'bg-pink-400 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Pill className="w-8 h-8 text-brand-600" />
            Medication Management
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Track daily doses, configure schedules, and manage prescriptions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch Schedule vs Catalog */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('schedule')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'schedule' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Schedule
            </button>
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'catalog' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prescription Catalog ({medications.length})
            </button>
          </div>

          <button
            onClick={() => onOpenMedicationModal()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Add Medication
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: DAILY SCHEDULE WITH DATE SELECTOR */}
      {viewMode === 'schedule' && (
        <div className="space-y-6">
          {/* Date Selector & Stats */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Selected Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 font-bold text-sm text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={() => {
                  const d = new Date();
                  setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                }}
                className="text-xs font-bold text-brand-700 hover:underline"
              >
                Today
              </button>
            </div>

            {scheduleData?.stats && (
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-emerald-700">Taken: {scheduleData.stats.taken}</span>
                <span className="text-amber-700">Pending: {scheduleData.stats.pending}</span>
                <span className="text-red-700">Missed: {scheduleData.stats.missed}</span>
                <span className="text-blue-700">Adherence: {scheduleData.stats.adherenceRate}%</span>
              </div>
            )}
          </div>

          {/* Schedule List */}
          <div className="space-y-4">
            {scheduleData?.allLogs && scheduleData.allLogs.length > 0 ? (
              scheduleData.allLogs.map((log) => {
                const isTaken = log.status === 'taken';
                const isMissed = log.status === 'missed';
                const pillColor = log.medicationId?.pillColor || 'blue';

                return (
                  <div
                    key={log._id}
                    className={`bg-white rounded-2xl p-5 border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isTaken ? 'border-emerald-300 bg-emerald-50/30' : isMissed ? 'border-red-300 bg-red-50/30' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ${getPillColorClass(pillColor)}`}>
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base sm:text-lg text-slate-900">{log.medicationName}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                            {log.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {log.medicationId?.instructions || 'Take with water after meal'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Scheduled: <strong>{log.scheduledTime}</strong> ({log.timeSlot})
                          {log.takenAt && ` • Taken at ${new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isTaken ? (
                        <>
                          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Taken
                          </span>
                          <button
                            onClick={() => handleUpdateDose(log._id, 'pending')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold"
                          >
                            Undo
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateDose(log._id, 'taken')}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark Taken
                          </button>
                          <button
                            onClick={() => handleUpdateDose(log._id, 'missed')}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-bold text-xs"
                          >
                            Mark Missed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-600">No scheduled doses for {selectedDate}</p>
                <p className="text-xs text-slate-400 mt-1">Add medications to begin tracking daily routines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PRESCRIPTION CATALOG */}
      {viewMode === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medications.map((med) => {
            const isLowStock = med.stockCount <= (med.lowStockThreshold || 7);
            return (
              <div
                key={med._id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs ${getPillColorClass(med.pillColor)}`}>
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-base text-slate-900 leading-tight">{med.name}</h3>
                        <span className="text-xs font-bold text-brand-700">{med.dosage} &bull; {med.form}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditMedication(med)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Medication"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med._id, med.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Discontinue Medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p><strong>Times:</strong> {med.times.join(', ')}</p>
                    <p><strong>Instructions:</strong> {med.instructions}</p>
                    {med.purpose && <p><strong>Purpose:</strong> {med.purpose}</p>}
                    {med.prescribingDoctor && <p><strong>Doctor:</strong> {med.prescribingDoctor}</p>}
                  </div>
                </div>

                {/* Stock count */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Inventory:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    isLowStock ? 'bg-amber-100 text-amber-800 font-extrabold' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {med.stockCount} doses left {isLowStock && '⚠️ Refill Soon'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
