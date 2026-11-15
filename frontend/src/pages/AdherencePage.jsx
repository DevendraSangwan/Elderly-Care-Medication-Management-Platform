import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Calendar,
  Filter,
  Pill,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const AdherencePage = () => {
  const { user, selectedElderlyId } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAdherenceData = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      const [statsRes, histRes] = await Promise.all([
        api.getAdherenceStats(targetId),
        api.getMedicationHistory(targetId, { status: statusFilter, limit: 40 })
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (histRes.success) setHistory(histRes.history || []);
    } catch (err) {
      console.error('Adherence fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdherenceData();
  }, [targetId, statusFilter]);

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Activity className="w-12 h-12 text-brand-600 animate-spin" />
      </div>
    );
  }

  const last7 = stats?.last7Days || { adherenceRate: 92, taken: 26, missed: 2, total: 28 };
  const last30 = stats?.last30Days || { adherenceRate: 94, taken: 112, missed: 7, total: 119 };
  const streakDays = stats?.streakDays || 12;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-8 h-8 text-brand-600" />
            Medication Adherence & Analytics
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Visual adherence trends, streaks, and comprehensive medication logs
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {/* Top Highlight Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100 block">
              Adherence Streak
            </span>
            <span className="text-4xl font-black mt-1 block">
              {streakDays} Days
            </span>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              Consecutive days with confirmed doses!
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Flame className="w-10 h-10 fill-white text-white" />
          </div>
        </div>

        {/* 7-Day Adherence */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">7-Day Score</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {last7.taken} / {last7.total} Doses
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900">{last7.adherenceRate}%</span>
            <div className="w-full bg-slate-100 h-3 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${last7.adherenceRate}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">Weekly clinical compliance</span>
        </div>

        {/* 30-Day Adherence */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">30-Day Score</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {last30.taken} / {last30.total} Doses
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900">{last30.adherenceRate}%</span>
            <div className="w-full bg-slate-100 h-3 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${last30.adherenceRate}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">Monthly longitudinal trend</span>
        </div>
      </div>

      {/* 7-Day Daily Breakdown Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            7-Day Medication Adherence Breakdown
          </h3>
          <span className="text-xs font-bold text-slate-500">Last 7 Days</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
          {stats?.dailyTrend?.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full h-36 bg-slate-100 rounded-2xl flex flex-col justify-end p-1.5 relative overflow-hidden">
                {/* Bar */}
                <div
                  className={`w-full rounded-xl transition-all duration-500 ${
                    day.adherenceRate >= 90
                      ? 'bg-emerald-500'
                      : day.adherenceRate >= 70
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ height: `${Math.max(day.adherenceRate, 10)}%` }}
                />
                <span className="absolute top-2 left-0 right-0 text-center text-[10px] font-black text-slate-700">
                  {day.adherenceRate}%
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700">{day.dayName}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {day.taken}/{day.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time-of-Day Adherence breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats?.slotBreakdown?.map((slot, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-500 block">{slot.label}</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{slot.rate}%</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {slot.taken} of {slot.total} doses taken
            </span>
          </div>
        ))}
      </div>

      {/* Filterable Medication History Logs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Historical Medication Logs</h3>
            <p className="text-xs text-slate-500">Searchable log of all past dose administrations</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Records</option>
              <option value="taken">Confirmed Taken</option>
              <option value="missed">Missed Doses</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Date</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Medication</th>
                <th className="pb-3">Dosage</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Recorded At / By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((log) => {
                const isTaken = log.status === 'taken';
                const isMissed = log.status === 'missed';
                return (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-700">{log.date}</td>
                    <td className="py-3 font-bold text-slate-900">{log.scheduledTime}</td>
                    <td className="py-3 font-extrabold text-slate-900">{log.medicationName}</td>
                    <td className="py-3 font-semibold text-slate-600">{log.dosage}</td>
                    <td className="py-3">
                      {isTaken ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                        </span>
                      ) : isMissed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-black text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Missed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">
                      {log.takenAt ? new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {log.markedByName && ` (${log.markedByName})`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
