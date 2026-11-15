import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export const AppointmentsPage = ({ onOpenAppointmentModal, onEditAppointment }) => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getAppointments(targetId);
      if (res.success) {
        setAppointments({
          upcoming: res.upcoming || [],
          past: res.past || []
        });
      }
    } catch (err) {
      console.error('Appointments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [targetId]);

  const handleSendReminder = async (id) => {
    try {
      const res = await api.sendAppointmentReminder(id);
      alert(res.message);
    } catch (err) {
      alert(`Error sending reminder: ${err.message}`);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.setAppointmentStatus(id, status);
      await fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const displayList =
    filter === 'upcoming'
      ? appointments.upcoming
      : filter === 'past'
      ? appointments.past
      : [...appointments.upcoming, ...appointments.past];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-8 h-8 text-blue-600" />
            Doctor Appointments
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Manage clinical consultations, lab tests, and appointment reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'upcoming' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming ({appointments.upcoming.length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'past' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past / Completed ({appointments.past.length})
            </button>
          </div>

          <button
            onClick={() => onOpenAppointmentModal()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Schedule Visit
          </button>
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-4">
        {displayList.length > 0 ? (
          displayList.map((appt) => {
            const isCompleted = appt.status === 'completed';
            const isCancelled = appt.status === 'cancelled';

            return (
              <div
                key={appt._id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isCompleted ? 'border-slate-200 bg-slate-50/50 opacity-90' : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    isCompleted ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl leading-none">
                      {new Date(appt.date).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-slate-900">{appt.doctorName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                        {appt.specialty}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                          Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-xs">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.date} at {appt.time}</span>
                      <span className="mx-1">&bull;</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.clinicLocation}</span>
                    </p>

                    <p className="text-xs text-slate-600 font-medium">
                      <strong>Purpose:</strong> {appt.purpose}
                    </p>

                    {appt.preparationNotes && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-semibold inline-block">
                        ⚠️ <strong>Preparation:</strong> {appt.preparationNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {!isCompleted && !isCancelled && (
                    <>
                      <button
                        onClick={() => handleSendReminder(appt._id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-all"
                        title="Send email reminder to elderly + care circle"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Send Reminder Email
                      </button>
                      <button
                        onClick={() => handleStatusChange(appt._id, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(appt._id, 'cancelled')}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No {filter} appointments found</h3>
            <p className="text-xs text-slate-400 mt-1">Schedule clinic visits to keep care circle informed.</p>
          </div>
        )}
      </div>
    </div>
  );
};
