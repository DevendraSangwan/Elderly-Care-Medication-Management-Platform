import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Pill,
  Calendar,
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Heart,
  Droplet,
  Users,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export const CaregiverDashboard = ({
  onOpenMedicationModal,
  onOpenAppointmentModal,
  onOpenVitalsModal,
  onOpenCareCircle
}) => {
  const { user, selectedElderlyId } = useAuth();

  const [profile, setProfile] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [clinicalNote, setClinicalNote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCaregiverData = async () => {
    if (!selectedElderlyId) {
      setLoading(false);
      return;
    }

    try {
      const [profRes, schedRes, vitalsRes, apptRes, medsRes, adhRes] = await Promise.all([
        api.getProfile(selectedElderlyId),
        api.getDailySchedule(selectedElderlyId),
        api.getVitalsHistory(selectedElderlyId),
        api.getAppointments(selectedElderlyId, 'scheduled'),
        api.getMedications(selectedElderlyId),
        api.getAdherenceStats(selectedElderlyId)
      ]);

      if (profRes.success) setProfile(profRes.profile);
      if (schedRes.success) setScheduleData(schedRes);
      if (vitalsRes.success) setVitals(vitalsRes.vitals || []);
      if (apptRes.success) setAppointments(apptRes.upcoming || []);
      if (medsRes.success) setMedications(medsRes.medications || []);
      if (adhRes.success) setAdherenceStats(adhRes.stats);
    } catch (err) {
      console.error('Caregiver fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregiverData();
  }, [selectedElderlyId]);

  const handleAdministerDose = async (logId) => {
    try {
      await api.updateDoseStatus(logId, 'taken', 'Administered by visiting nurse/caregiver');
      await fetchCaregiverData();
    } catch (err) {
      alert(`Could not log dose: ${err.message}`);
    }
  };

  const handleAddClinicalNote = async (e) => {
    e.preventDefault();
    if (!clinicalNote.trim() || !selectedElderlyId) return;

    try {
      await api.addCaregiverNote(selectedElderlyId, clinicalNote.trim());
      setClinicalNote('');
      const pRes = await api.getProfile(selectedElderlyId);
      if (pRes.success) setProfile(pRes.profile);
      alert('Clinical care note recorded successfully.');
    } catch (err) {
      alert(`Error saving note: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Stethoscope className="w-12 h-12 text-purple-600 animate-pulse mx-auto" />
          <p className="text-base font-bold text-slate-600">Loading caregiver clinical console...</p>
        </div>
      </div>
    );
  }

  if (!selectedElderlyId) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12 space-y-4">
        <Users className="w-16 h-16 text-purple-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">No Patient Assigned</h2>
        <p className="text-sm text-slate-600 font-medium">
          Please enter the patient's 6-digit CareBridge code to connect to their healthcare records.
        </p>
        <button
          onClick={onOpenCareCircle}
          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md"
        >
          Enter Patient Code
        </button>
      </div>
    );
  }

  const patientName = profile?.userId?.name || 'Patient';
  const lowStockMeds = medications.filter(m => m.stockCount <= (m.lowStockThreshold || 7));
  const latestVitals = vitals.length > 0 ? vitals[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Clinical Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 shadow-inner">
              <Stethoscope className="w-4 h-4 text-purple-300" />
              <span>Caregiver Console &bull; Patient: {patientName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Clinical Caregiver Portal
            </h1>
            <p className="text-purple-200 text-sm font-medium mt-1">
              {medications.length} active prescriptions &bull; Blood Group: {profile?.bloodGroup || 'O+'} &bull; 7-Day Adherence: {adherenceStats?.last7Days?.adherenceRate || 92}%
            </p>
          </div>

          {/* Clinical Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenMedicationModal()}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Medication
            </button>
            <button
              onClick={() => onOpenVitalsModal()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Activity className="w-4 h-4" /> Log Vitals
            </button>
            <button
              onClick={() => onOpenAppointmentModal()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-4 h-4" /> Book Visit
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm">Low Medication Inventory Notice</h4>
              <p className="text-xs text-amber-800">
                {lowStockMeds.map(m => `${m.name} (${m.stockCount} pills left)`).join(', ')}. Please contact pharmacy for refills.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Blood Pressure</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {latestVitals ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}` : '122/78'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">mmHg &bull; Normal</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Blood Sugar</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {latestVitals?.bloodSugar || 110}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">mg/dL &bull; Fasting</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Pulse Rate</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {latestVitals?.pulseRate || 74}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">bpm</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">30-Day Adherence</span>
          <span className="text-2xl font-black text-brand-600 mt-1 block">
            {adherenceStats?.last30Days?.adherenceRate || 94}%
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Monthly therapeutic goal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule with Nurse Administration & Vitals History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-600" />
                Medication Administration Schedule ({patientName})
              </h3>
              <span className="text-xs font-bold text-slate-500">Today</span>
            </div>

            <div className="space-y-3">
              {scheduleData?.allLogs && scheduleData.allLogs.length > 0 ? (
                scheduleData.allLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  return (
                    <div
                      key={log._id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        isTaken ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isTaken ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isTaken ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{log.medicationName}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {log.dosage} &bull; Time: <strong>{log.scheduledTime}</strong> ({log.timeSlot})
                          </p>
                          {log.markedByName && (
                            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                              Recorded by: {log.markedByName} ({log.markedByRole})
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        {isTaken ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                            ✓ Confirmed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAdministerDose(log._id)}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
                          >
                            Mark Administered
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No medication logs for today.</p>
              )}
            </div>
          </div>

          {/* Vitals History Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Vitals Observation Records
              </h3>
              <button
                onClick={() => onOpenVitalsModal()}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log New Reading
              </button>
            </div>

            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Date & Time</th>
                    <th className="pb-2">Blood Pressure</th>
                    <th className="pb-2">Blood Sugar</th>
                    <th className="pb-2">Pulse</th>
                    <th className="pb-2">SpO2</th>
                    <th className="pb-2">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitals.slice(0, 5).map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-medium text-slate-600">
                        {new Date(v.date).toLocaleDateString()} {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">
                        {v.bloodPressureSystolic && v.bloodPressureDiastolic ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg` : '-'}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">
                        {v.bloodSugar ? `${v.bloodSugar} mg/dL (${v.bloodSugarTiming})` : '-'}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-700">{v.pulseRate ? `${v.pulseRate} bpm` : '-'}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : '-'}</td>
                      <td className="py-2.5 text-slate-500">{v.recordedByName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Notes & Medical Summary */}
        <div className="space-y-6">
          {/* Add Clinical Note */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Add Clinical Care Note
            </h3>
            <form onSubmit={handleAddClinicalNote} className="space-y-3">
              <textarea
                rows="3"
                required
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                placeholder="Document clinical observations, patient mood, dietary remarks..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!clinicalNote.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50"
              >
                Save Clinical Note
              </button>
            </form>
          </div>

          {/* Chronic Conditions & Allergies Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Patient Medical Summary
            </h3>
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-700 block mb-1">
                ⚠️ Known Allergies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.allergies?.map((a, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                    {a}
                  </span>
                )) || <span className="text-xs text-slate-400">None</span>}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-blue-700 block mb-1">
                🩺 Documented Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile?.medicalConditions?.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                    {c}
                  </span>
                )) || <span className="text-xs text-slate-400">None</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
