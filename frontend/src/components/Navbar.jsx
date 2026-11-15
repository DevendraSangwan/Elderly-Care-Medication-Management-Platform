import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import {
  Heart,
  Pill,
  Calendar,
  Activity,
  User,
  Bell,
  Mail,
  Mic,
  Sparkles,
  AlertOctagon,
  LogOut,
  Sliders,
  Eye,
  Type,
  Users,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  onOpenVoice,
  onOpenAI,
  onOpenEmailInbox,
  unreadCount = 0
}) => {
  const { user, logout, selectedElderlyId, setSelectedElderlyId } = useAuth();
  const { seniorMode, toggleSeniorMode, highContrast, toggleHighContrast } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleLabels = {
    elderly: { label: 'Elderly Individual', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    family: { label: 'Family Member', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    caregiver: { label: 'Caregiver / Nurse', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'adherence', label: 'Adherence', icon: Activity },
    { id: 'profile', label: 'Health Profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 focus:outline-none group text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                  Care<span className="text-brand-600">Bridge</span>
                </span>
                <span className="hidden sm:block text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Elderly Care Ecosystem
                </span>
              </div>
            </button>

            {/* Role Badge */}
            {user && (
              <span
                className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                  roleLabels[user.role]?.color || 'bg-slate-100 text-slate-700'
                }`}
              >
                {roleLabels[user.role]?.label || user.role}
              </span>
            )}

            {/* Patient Selector for Family/Caregiver */}
            {user && user.role !== 'elderly' && user.linkedElderly && user.linkedElderly.length > 0 && (
              <div className="relative ml-2">
                <select
                  value={selectedElderlyId || ''}
                  onChange={(e) => setSelectedElderlyId(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {user.linkedElderly.map((elder) => {
                    const id = elder._id || elder.id || elder;
                    const name = elder.name || `Patient (${id.substring(0, 5)})`;
                    return (
                      <option key={id} value={id}>
                        Patient: {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                      : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100'
                  } ${seniorMode ? 'text-base' : 'text-sm'}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Action Center (Accessibility, Tools, SOS, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Senior Mode Toggle */}
            <button
              onClick={toggleSeniorMode}
              title={seniorMode ? 'Disable Senior Mode (Normal text)' : 'Enable Senior Mode (Extra large fonts & big buttons)'}
              className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all text-xs font-bold ${
                seniorMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Type className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Senior Mode</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
              className={`p-2 rounded-xl border transition-all ${
                highContrast
                  ? 'bg-slate-900 text-yellow-300 border-black'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Voice Assistant */}
            <button
              onClick={onOpenVoice}
              title="Voice Assistant (Speak commands)"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Mic className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Voice</span>
            </button>

            {/* AI Assistant */}
            <button
              onClick={onOpenAI}
              title="AI Healthcare Routine & Medication Assistant"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">AI Guide</span>
            </button>

            {/* Live Email Inspector */}
            <button
              onClick={onOpenEmailInbox}
              title="View Automated Emails sent by CareBridge"
              className="relative p-2 rounded-xl bg-slate-100 text-slate-750 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <Mail className="w-4 h-4 text-slate-700" />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-brand-600 text-white text-[10px] font-extrabold rounded-full">
                Mail
              </span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl bg-slate-100 text-slate-750 hover:bg-slate-200 border border-slate-200 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* EMERGENCY SOS BEACON BUTTON */}
            <button
              onClick={onOpenSOS}
              className="px-3 sm:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-red-500/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
              title="Emergency SOS Alert: Broadcasts instantly to all family & caregivers"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SOS</span>
            </button>

            {/* User Profile / Logout */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-xs text-slate-800">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    {user?.linkCode && (
                      <p className="text-xs font-mono font-bold text-brand-700 mt-1 bg-brand-50 px-2 py-0.5 rounded">
                        Link Code: {user.linkCode}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Manage Health Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
