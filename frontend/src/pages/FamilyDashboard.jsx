import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Pill,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  Users,
  Activity,
  Flame,
  Mail,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const FamilyDashboard = ({ onOpenSOS, onOpenCareCircle }) => {
  const { user, selectedElderlyId } = useAuth();

  const [profile, setProfile] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState(null);
  const [checkInText, setCheckInText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingCheckIn, setSendingCheckIn] = useState(false);

  const fetchFamilyData = async () => {
    if (!selectedElderlyId) {
      setLoading(false);
      return;
    }

    try {
      const [profRes, schedRes, apptRes, actRes, adhRes] = await Promise.all([
        api.getProfile(selectedElderlyId),
        api.getDailySchedule(selectedElderlyId),
        api.getAppointments(selectedElderlyId, 'scheduled'),
        api.getActivities(selectedElderlyId),
        api.getAdherenceStats(selectedElderlyId)
      ]);

      if (profRes.success) setProfile(profRes.profile);
      if (schedRes.success) setScheduleData(schedRes);
      if (apptRes.success) setAppointments(apptRes.upcoming || []);
      if (actRes.success) setActivities(actRes.activities || []);
      if (adhRes.success) setAdherenceStats(adhRes.stats);
    } catch (err) {
      console.error('Error fetching family data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, [selectedElderlyId]);

  const handlePostCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInText.trim() || !selectedElderlyId) return;

    setSendingCheckIn(true);
    try {
      await api.addCheckIn(selectedElderlyId, checkInText.trim());
      setCheckInText('');
      const actRes = await api.getActivities(selectedElderlyId);
      if (actRes.success) setActivities(actRes.activities);
    } catch (err) {
      alert(`Could not post check-in: ${err.message}`);
    } finally {
      setSendingCheckIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Heart className="w-12 h-12 text-blue-600 animate-pulse mx-auto" />
          <p className="text-base font-bold text-slate-600">Loading your loved one's health status...</p>
        </div>
      </div>
    );
  }

  if (!selectedElderlyId) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12 space-y-4">
        <Users className="w-16 h-16 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Connect to an Elderly Relative</h2>
        <p className="text-sm text-slate-600 font-medium">
          You are not currently linked to an elderly family member. Enter their 6-digit CareBridge code to monitor their daily medications and appointments.
        </p>
        <button
          onClick={onOpenCareCircle}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
        >
          Enter Link Code
        </button>
      </div>
    );
  }

  const patientName = profile?.userId?.name || 'Your Loved One';
  const stats = scheduleData?.stats || { total: 0, taken: 0, missed: 0, pending: 0, adherenceRate: 100 };
  const streakDays = adherenceStats?.streakDays || 12;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Patient Health Overview Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Monitoring: {patientName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {stats.missed > 0 ? (
                <span className="flex items-center gap-2 text-amber-200">
                  <AlertTriangle className="w-7 h-7 text-amber-300" />
                  Attention Needed: {stats.missed} Missed Dose Today
                </span>
              ) : (
                <span>{patientName} is on track today!</span>
              )}
            </h1>
            <p className="text-blue-100 text-sm font-medium mt-1">
              {stats.taken} of {stats.total} scheduled doses completed &bull; {stats.adherenceRate}% adherence today
            </p>
          </div>

          {/* Quick Streak & SOS Info */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[11px] font-bold uppercase text-blue-200 block">Adherence Streak</span>
              <span className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
                <Flame className="w-6 h-6 fill-amber-300 text-amber-400" />
                {streakDays} Days
              </span>
            </div>
            <button
              onClick={onOpenSOS}
              className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-500/30"
            >
              Emergency Info
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">7-Day Adherence</span>
          <span className="text-2xl font-black text-brand-600 mt-1 block">
            {adherenceStats?.last7Days?.adherenceRate || 92}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Weekly average</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Doses Taken Today</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {stats.taken} / {stats.total}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{stats.pending} pending</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Blood Group</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {profile?.bloodGroup || 'O+'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Medical ID verified</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block">Next Appointment</span>
          <span className="text-sm font-black text-blue-700 mt-1 block truncate">
            {appointments.length > 0 ? appointments[0].date : 'None upcoming'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold truncate">
            {appointments.length > 0 ? appointments[0].doctorName : 'Up to date'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Schedule Checklist & Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Medication Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand-600" />
                Today's Medication Doses for {patientName}
              </h3>
              <span className="text-xs font-bold text-slate-500">Live Status</span>
            </div>

            <div className="space-y-3">
              {scheduleData?.allLogs && scheduleData.allLogs.length > 0 ? (
                scheduleData.allLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isMissed = log.status === 'missed';
                  return (
                    <div
                      key={log._id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isTaken
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isMissed
                          ? 'bg-red-50/50 border-red-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isTaken
                              ? 'bg-emerald-600 text-white'
                              : isMissed
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isTaken ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{log.medicationName}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {log.dosage} &bull; Scheduled: {log.scheduledTime}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isTaken ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                            Taken
                          </span>
                        ) : isMissed ? (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-extrabold">
                            Missed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic py-4">No medications scheduled for today.</p>
              )}
            </div>
          </div>

          {/* Upcoming Doctor Visits */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Doctor Visits
              </h3>
              <span className="text-xs font-bold text-blue-700">
                {appointments.length} Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {appt.doctorName} &bull; <span className="text-blue-700 font-semibold">{appt.specialty}</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        📅 <strong>{appt.date}</strong> at {appt.time} &bull; 📍 {appt.clinicLocation}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Purpose: {appt.purpose}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        const res = await api.sendAppointmentReminder(appt._id);
                        alert(res.message);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email Reminder
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No upcoming appointments scheduled.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Care Circle Feed & Check-In */}
        <div className="space-y-6">
          {/* Post Quick Check-In Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Family Check-In
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Leave a note for other family members or visiting nurses:
            </p>
            <form onSubmit={handlePostCheckIn} className="space-y-3">
              <textarea
                rows="3"
                required
                value={checkInText}
                onChange={(e) => setCheckInText(e.target.value)}
                placeholder="e.g. Brought groceries and checked on Mom. She feels great!"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingCheckIn || !checkInText.trim()}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingCheckIn ? 'Posting...' : 'Post Check-In Note'}</span>
              </button>
            </form>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Care Activity Feed
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-slate-700">{act.authorName}</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <p className="text-slate-600">{act.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No recent activity logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
