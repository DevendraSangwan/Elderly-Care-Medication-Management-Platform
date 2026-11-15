import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Play,
  Calendar,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export const NotificationsPage = ({ onOpenEmailInbox }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerScheduler = async () => {
    setChecking(true);
    try {
      await api.runSchedulerCheck();
      await fetchNotifications();
      alert('Automated reminder check executed! New notifications and emails dispatched if dues detected.');
    } catch (err) {
      alert(`Scheduler error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'medication_reminder': return { icon: Clock, bg: 'bg-brand-100 text-brand-700' };
      case 'medication_missed': return { icon: AlertTriangle, bg: 'bg-red-100 text-red-700' };
      case 'consecutive_missed': return { icon: AlertOctagon, bg: 'bg-red-600 text-white animate-pulse' };
      case 'medication_taken': return { icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-700' };
      case 'appointment_reminder': return { icon: Calendar, bg: 'bg-blue-100 text-blue-700' };
      case 'sos_alert': return { icon: AlertOctagon, bg: 'bg-red-600 text-white' };
      default: return { icon: Bell, bg: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-brand-600" />
            Notification & Alert Center
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time medication reminders, safety alerts, and family updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerScheduler}
            disabled={checking}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Execute automated reminder check immediately"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {checking ? 'Checking...' : 'Run Reminder Check'}
          </button>
          <button
            onClick={onOpenEmailInbox}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            Sent Emails
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-brand-700 hover:underline px-2"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const { icon: Icon, bg } = getIconForType(notif.type);
            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-slate-200 opacity-80'
                    : 'bg-brand-50/40 border-brand-300 shadow-sm ring-1 ring-brand-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif._id);
                    }}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 shrink-0"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">You are all caught up with healthcare alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
