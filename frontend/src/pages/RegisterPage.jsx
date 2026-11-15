import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Mail, Lock, KeyRound, Phone, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

export const RegisterPage = ({ onSwitchToLogin }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'elderly',
    passcode: '1234',
    phone: '',
    relationship: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'elderly',
      title: 'Elderly Individual',
      desc: 'Manage your daily medications & health routines',
      badge: '👵 Patient Mode'
    },
    {
      id: 'family',
      title: 'Family Member',
      desc: 'Keep track of your loved one & receive alerts',
      badge: '👨‍👧 Care Circle'
    },
    {
      id: 'caregiver',
      title: 'Caregiver / Nurse',
      desc: 'Administer schedules, vitals & care records',
      badge: '🩺 Clinical Aide'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-brand-50/40 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/25 mb-3">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Join <span className="text-brand-600">CareBridge</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create an account to protect and manage healthcare routines together
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                Select Your Role *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roles.map((r) => {
                  const isSelected = formData.role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[11px] font-bold block mb-1">{r.badge}</span>
                      <h4 className="font-extrabold text-xs text-slate-900">{r.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Martha Johnson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Password & Passcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Easy Passcode / PIN (Optional)
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength="8"
                    value={formData.passcode}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. 1234"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Relationship (if family/caregiver) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {formData.role !== 'elderly' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Relationship / Role Title
                  </label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Daughter, Son, Home Nurse"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-bold text-brand-600 hover:text-brand-800"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
