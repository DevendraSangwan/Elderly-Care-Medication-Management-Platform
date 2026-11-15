import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { speakText } from '../services/speechService';
import {
  Sun,
  CloudSun,
  Sunset,
  Moon,
  CheckCircle2,
  Clock,
  Volume2,
  Calendar,
  AlertTriangle,
  Heart,
  Pill,
  Sparkles,
  PhoneCall,
  Activity
} from 'lucide-react';

export const ElderlyDashboard = ({ onOpenSOS, onOpenVoice, onOpenAI }) => {
  const { user } = useAuth();
  const { seniorMode, highContrast } = useSettings();

  const [scheduleData, setScheduleData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingAloud, setReadingAloud] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [schedRes, apptRes] = await Promise.all([
        api.getDailySchedule(user.id),
        api.getAppointments(user.id, 'scheduled')
      ]);

      if (schedRes.success) setScheduleData(schedRes);
      if (apptRes.success) setAppointments(apptRes.upcoming || []);
    } catch (err) {
      console.error('Error fetching elderly dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Handle 1-click "I Took This" dose mark
  const handleMarkTaken = async (logId, medName) => {
    try {
      const res = await api.updateDoseStatus(logId, 'taken');
      if (res.success) {
        // Joyful celebration confetti for elderly accomplishment!
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });

        // Optional verbal praise
        speakText(`Wonderful job, ${user.name.split(' ')[0]}! You marked ${medName} as taken.`);

        await fetchDashboardData();
      }
    } catch (err) {
      alert(`Could not update: ${err.message}`);
    }
  };

  // Read Aloud Daily Schedule for Seniors
  const handleReadScheduleAloud = () => {
    if (!scheduleData || !scheduleData.allLogs) return;

    setReadingAloud(true);
    const pending = scheduleData.allLogs.filter(l => l.status === 'pending');
    const taken = scheduleData.allLogs.filter(l => l.status === 'taken');

    let textToRead = `Hello ${user.name.split(' ')[0]}. Here is your medication schedule for today. `;
    if (pending.length === 0) {
      textToRead += `Fantastic news! You have already taken all your medications for today. You are doing great!`;
    } else {
      textToRead += `You have ${pending.length} medication doses remaining today. `;
      pending.forEach((p) => {
        textToRead += `At ${p.scheduledTime}, take ${p.medicationName}, dosage ${p.dosage}. `;
      });
      textToRead += `You have already taken ${taken.length} doses. Remember to drink a glass of water with your pills.`;
    }

    speakText(textToRead, () => setReadingAloud(false));
  };

  const slotIcons = {
    morning: { icon: Sun, label: 'Morning Doses', color: 'text-amber-500 bg-amber-50 border-amber-200' },
    afternoon: { icon: CloudSun, label: 'Afternoon Doses', color: 'text-orange-500 bg-orange-50 border-orange-200' },
    evening: { icon: Sunset, label: 'Evening Doses', color: 'text-rose-500 bg-rose-50 border-rose-200' },
    bedtime: { icon: Moon, label: 'Bedtime Doses', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' }
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Pill className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
          <p className="text-base font-bold text-slate-600">Loading your daily medications...</p>
        </div>
      </div>
    );
  }

  const todayStats = scheduleData?.stats || { total: 0, taken: 0, missed: 0, pending: 0, adherenceRate: 100 };
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Friendly Senior Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-3 shadow-inner">
              <Sun className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Good day, {user?.name}!
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-medium mt-1 max-w-xl">
              {todayStats.pending === 0
                ? '🌟 You have taken all your scheduled medications for today! Excellent job staying healthy.'
                : `You have completed ${todayStats.taken} of ${todayStats.total} doses today. Keep up the great routine!`}
            </p>
          </div>

          {/* Senior Voice Read-Aloud Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReadScheduleAloud}
              disabled={readingAloud}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-black text-sm sm:text-base flex items-center gap-2.5 shadow-md shadow-emerald-900/20 transition-all"
            >
              <Volume2 className={`w-5 h-5 text-emerald-600 ${readingAloud ? 'animate-bounce' : ''}`} />
              <span>{readingAloud ? 'Reading Aloud...' : 'Read My Schedule'}</span>
            </button>
            <button
              onClick={onOpenVoice}
              className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Voice Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Adherence Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold uppercase text-slate-500 block">Total Doses</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {todayStats.total}
          </span>
        </div>
        <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs text-center">
          <span className="text-xs font-bold uppercase text-emerald-800 block">Taken</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
            {todayStats.taken}
          </span>
        </div>
        <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs text-center">
          <span className="text-xs font-bold uppercase text-amber-800 block">Pending</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
            {todayStats.pending}
          </span>
        </div>
        <div className="bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-xs text-center">
          <span className="text-xs font-bold uppercase text-blue-800 block">Today's Adherence</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700 mt-1 block">
            {todayStats.adherenceRate}%
          </span>
        </div>
      </div>

      {/* Main Today's Medication Schedule: Grouped by Time Slots */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-brand-600" />
            Today's Medication Routine
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Tap the big button after taking each pill
          </span>
        </div>

        {['morning', 'afternoon', 'evening', 'bedtime'].map((slotKey) => {
          const slot = slotIcons[slotKey];
          const SlotIcon = slot.icon;
          const items = scheduleData?.slots?.[slotKey] || [];

          if (items.length === 0) return null;

          return (
            <div key={slotKey} className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${slot.color}`}>
                    <SlotIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{slot.label}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {items.filter(i => i.status === 'taken').length} of {items.length} Taken
                </span>
              </div>

              {/* Cards for medications in this slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isMissed = log.status === 'missed';
                  const pillColor = log.medicationId?.pillColor || 'blue';
                  const pillShape = log.medicationId?.pillShape || 'round';

                  return (
                    <div
                      key={log._id}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isTaken
                          ? 'bg-emerald-50/50 border-emerald-300/80'
                          : isMissed
                          ? 'bg-red-50/50 border-red-300'
                          : 'bg-white border-slate-200 hover:border-brand-400 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {/* Visual Pill Indicator */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs ${getPillColorClass(pillColor)}`}
                            title={`Color: ${pillColor}, Shape: ${pillShape}`}
                          >
                            <Pill className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                              {log.medicationName}
                            </h4>
                            <p className="text-xs font-bold text-slate-600 mt-0.5">
                              Dosage: {log.dosage}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.scheduledTime}</span>
                        </div>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs text-slate-600 font-medium mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {log.medicationId?.instructions || 'Take with water after food'}
                      </p>

                      {/* Action Button: Giant, unmistakable "I Took This" button */}
                      {isTaken ? (
                        <div className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-inner">
                          <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />
                          <span>Taken at {log.takenAt ? new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled Time'}</span>
                        </div>
                      ) : isMissed ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Marked Missed</span>
                          </div>
                          <button
                            onClick={() => handleMarkTaken(log._id, log.medicationName)}
                            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                          >
                            Take Now
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkTaken(log._id, log.medicationName)}
                          className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-black text-base shadow-md shadow-brand-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          <span>I TOOK THIS PILL</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Doctor Appointment Notice */}
      {nextAppointment && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-blue-700 tracking-wider">
                Upcoming Doctor Visit
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">
                {nextAppointment.doctorName} ({nextAppointment.specialty})
              </h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                📅 {nextAppointment.date} at {nextAppointment.time} &bull; 📍 {nextAppointment.clinicLocation}
              </p>
              {nextAppointment.preparationNotes && (
                <p className="text-xs text-amber-700 font-semibold mt-1">
                  ⚠️ Note: {nextAppointment.preparationNotes}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => speakText(`You have an upcoming appointment with ${nextAppointment.doctorName} on ${nextAppointment.date} at ${nextAppointment.time}.`)}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-2 hover:bg-blue-50"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </div>
      )}
    </div>
  );
};
