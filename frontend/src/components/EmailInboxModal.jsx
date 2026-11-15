import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Mail, RefreshCw, Trash2, X, ExternalLink, Clock, User, AlertCircle, Play } from 'lucide-react';

export const EmailInboxModal = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schedulerRunning, setSchedulerRunning] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.getSentEmails();
      if (res.success) {
        setEmails(res.emails);
        if (res.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(res.emails[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching sent emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  const handleClear = async () => {
    if (confirm('Clear sent email history?')) {
      await api.clearEmails();
      setEmails([]);
      setSelectedEmail(null);
    }
  };

  const handleRunScheduler = async () => {
    setSchedulerRunning(true);
    try {
      await api.runSchedulerCheck();
      await fetchEmails();
    } catch (err) {
      alert(`Scheduler run error: ${err.message}`);
    } finally {
      setSchedulerRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Live Email Notification Inspector</h2>
              <p className="text-xs text-slate-400">
                Inspect real automated emails dispatched by Nodemailer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScheduler}
              disabled={schedulerRunning}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              title="Run Automated Reminder Cycle Immediately"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {schedulerRunning ? 'Checking...' : 'Run Reminder Check'}
            </button>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Refresh Emails"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {emails.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition-all"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Email List */}
          <div className="w-full md:w-2/5 border-r border-slate-200 overflow-y-auto bg-slate-50 p-3 space-y-2">
            {emails.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="font-bold text-sm">No emails in queue</p>
                <p className="text-xs mt-1">
                  Click "Run Reminder Check" or test an action to generate automated reminder emails.
                </p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-400'
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold truncate max-w-[150px]">To: {email.to}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                      {email.subject}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {email.text}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                        {email.type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                        {email.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Email Header Meta */}
                <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ID: {selectedEmail.id}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(selectedEmail.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                    {selectedEmail.subject}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-400 block">From:</span>
                      <span className="font-semibold text-slate-800">{selectedEmail.from}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block">To:</span>
                      <span className="font-semibold text-slate-800">{selectedEmail.to}</span>
                    </div>
                  </div>
                </div>

                {/* Email HTML Render Preview */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex items-start justify-center">
                  <div
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-xl w-full"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select an email on the left to preview its contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
