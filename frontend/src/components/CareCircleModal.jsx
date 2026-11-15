import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, X, Link, Copy, Check, RefreshCw, AlertCircle, Shield } from 'lucide-react';

export const CareCircleModal = ({ isOpen, onClose, careCircle = [], onLinkedSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const isElderly = user?.role === 'elderly';

  const handleLink = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.linkProfile(code.trim());
      if (res.success) {
        setSuccessMsg(res.message);
        setCode('');
        await refreshUser();
        if (onLinkedSuccess) onLinkedSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to connect profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (user?.linkCode) {
      navigator.clipboard.writeText(user.linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (confirm('Regenerate your Link Code? Family and caregivers using the old code will need the new one.')) {
      try {
        await api.regenerateLinkCode();
        await refreshUser();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Connected Care Circle</h2>
              <p className="text-xs text-slate-400">
                Secure profile linking for family & caregivers
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

        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <Check className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Elderly User: Show their Link Code */}
          {isElderly && (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 text-center space-y-3">
              <span className="text-xs font-bold uppercase text-brand-800 tracking-wider">
                Your Personal Care Link Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-black text-brand-900 tracking-widest bg-white px-4 py-2 rounded-xl border border-brand-300 shadow-sm">
                  {user?.linkCode || 'CB-1001'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-sm"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleRegenerate}
                  className="p-3 rounded-xl bg-white border border-brand-300 hover:bg-brand-100 text-brand-800 font-bold transition-all shadow-sm"
                  title="Regenerate New Code"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-brand-700 font-medium max-w-sm mx-auto">
                Give this code to your sons, daughters, or nurse. Entering this code allows them to monitor your adherence safely.
              </p>
            </div>
          )}

          {/* Family/Caregiver: Link to Elderly */}
          {!isElderly && (
            <form onSubmit={handleLink} className="space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-600">
                Connect To Another Elderly Individual
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit Code (e.g. CB-1001)"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  <Link className="w-4 h-4" />
                  <span>{loading ? 'Linking...' : 'Connect'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Authorized Members in Care Circle */}
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-3">
              Active Care Circle Members:
            </span>
            <div className="space-y-2">
              {careCircle && careCircle.length > 0 ? (
                careCircle.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {member.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">
                          {member.role === 'caregiver' ? '🩺 Caregiver / Nurse' : '👨‍👩‍👧 Family Member'}
                          {member.relationship ? ` (${member.relationship})` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Authorized
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  No members currently linked. Share your code to connect!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
