import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Heart, Lock, Mail, KeyRound, ArrowRight, ShieldCheck, UserCheck, Eye, Type } from 'lucide-react';

export const LoginPage = ({ onSwitchToRegister }) => {
  const { login, loginWithPasscode } = useAuth();
  const { seniorMode, toggleSeniorMode, highContrast, toggleHighContrast } = useSettings();

  const [activeTab, setActiveTab] = useState('passcode'); // Default to passcode for elderly ease!
  const [email, setEmail] = useState('martha@carebridge.health');
  const [password, setPassword] = useState('password123');
  const [passcode, setPasscode] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithPasscode(email, passcode);
    } catch (err) {
      setError(err.message || 'Incorrect passcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Fill
  const handleQuickDemo = (demoEmail, demoPasscode, demoPassword) => {
    setEmail(demoEmail);
    setPasscode(demoPasscode);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-brand-50/40 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Accessibility Bar */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={toggleSeniorMode}
          className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
            seniorMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-amber-600" />
          Senior Mode: {seniorMode ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={toggleHighContrast}
          className={`p-1.5 rounded-full border shadow-sm transition-all ${
            highContrast ? 'bg-black text-yellow-300 border-black' : 'bg-white text-slate-700 border-slate-300'
          }`}
          title="Toggle High Contrast"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/25 mb-4">
          <Heart className="w-9 h-9 fill-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Care<span className="text-brand-600">Bridge</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          Elderly Care & Medication Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80">
          {/* Quick Demo Selector */}
          <div className="mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center mb-2">
              ⚡ Quick 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('martha@carebridge.health', '1234', 'password123')}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all ${
                  email === 'martha@carebridge.health'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                👵 Elderly
                <span className="block text-[10px] font-normal opacity-90">Martha (1234)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('david@carebridge.health', '2345', 'password123')}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all ${
                  email === 'david@carebridge.health'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                👨‍👦 Family
                <span className="block text-[10px] font-normal opacity-90">David (2345)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah@carebridge.health', '3456', 'password123')}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all ${
                  email === 'sarah@carebridge.health'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                🩺 Nurse
                <span className="block text-[10px] font-normal opacity-90">Sarah (3456)</span>
              </button>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setActiveTab('passcode')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'passcode'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Senior Quick PIN
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'password'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              Email & Password
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* PASSCODE / PIN LOGIN FORM */}
          {activeTab === 'passcode' && (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-600">
                    4-Digit Passcode / PIN
                  </label>
                  <span className="text-[11px] text-brand-700 font-bold">
                    Demo PIN: {email.includes('martha') ? '1234' : email.includes('david') ? '2345' : '3456'}
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    maxLength="8"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-lg font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                    placeholder="••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                <span>{loading ? 'Verifying PIN...' : 'Sign In With Passcode'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* STANDARD PASSWORD LOGIN FORM */}
          {activeTab === 'password' && (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-brand-600 hover:text-brand-800"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
