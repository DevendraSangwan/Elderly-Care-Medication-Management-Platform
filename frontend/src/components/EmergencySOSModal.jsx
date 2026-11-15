import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertOctagon, Phone, MapPin, Heart, ShieldAlert, X, Volume2, CheckCircle } from 'lucide-react';

export const EmergencySOSModal = ({ isOpen, onClose }) => {
  const { user, selectedElderlyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emergencyCard, setEmergencyCard] = useState(null);
  const [sosSent, setSosSent] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [reason, setReason] = useState('Immediate medical or safety assistance requested.');

  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  // Load emergency card data
  useEffect(() => {
    if (isOpen && targetId) {
      api.getEmergencyCard(targetId)
        .then((res) => {
          if (res.success) setEmergencyCard(res.card);
        })
        .catch(console.error);
    }
  }, [isOpen, targetId]);

  // Play browser emergency alarm beep using Web Audio API
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.setValueAtTime(440, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      setAlarmActive(true);
      setTimeout(() => setAlarmActive(false), 800);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported yet');
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    playAlarmSound();
    try {
      const res = await api.triggerEmergencySOS(targetId, { reason });
      if (res.success) {
        setSosSent(true);
      }
    } catch (err) {
      alert(`SOS Alert Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-red-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner">
            <AlertOctagon className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Emergency SOS Beacon
          </h2>
          <p className="text-red-100 text-sm mt-1 font-semibold">
            One-touch broadcast to all authorized family members & caregivers
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {sosSent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                EMERGENCY ALERT BROADCASTED!
              </h3>
              <p className="text-slate-600 font-medium max-w-md mx-auto text-base">
                Urgent notifications and emails have been dispatched to all family members and caregivers with patient vitals, emergency contacts, and location info.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => playAlarmSound()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" /> Sound Beacon
                </button>
                <button
                  onClick={() => {
                    setSosSent(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Giant SOS Trigger Button */}
              <div className="text-center">
                <button
                  onClick={handleTriggerSOS}
                  disabled={loading}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-98 text-white font-black text-2xl tracking-wider uppercase shadow-xl shadow-red-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <ShieldAlert className="w-8 h-8 animate-bounce" />
                  {loading ? 'SENDING SOS BROADCAST...' : 'PRESS TO BROADCAST SOS'}
                </button>
                <p className="text-xs text-slate-500 font-bold mt-2">
                  Immediately emails & alerts all caregivers and family on the care circle
                </p>
              </div>

              {/* Patient Quick Emergency Card */}
              {emergencyCard && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient</span>
                      <h4 className="text-lg font-black text-slate-900">{emergencyCard.name}</h4>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 font-black text-sm rounded-lg border border-red-200">
                      Blood: {emergencyCard.bloodGroup || 'O+'}
                    </span>
                  </div>

                  {/* Medical Conditions & Allergies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-amber-700 block mb-1">⚠️ Severe Allergies:</span>
                      <p className="font-semibold text-slate-700">
                        {emergencyCard.allergies && emergencyCard.allergies.length > 0
                          ? emergencyCard.allergies.join(', ')
                          : 'None documented'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-blue-700 block mb-1">🩺 Chronic Conditions:</span>
                      <p className="font-semibold text-slate-700">
                        {emergencyCard.medicalConditions && emergencyCard.medicalConditions.length > 0
                          ? emergencyCard.medicalConditions.join(', ')
                          : 'None documented'}
                      </p>
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Primary Contacts to Call:
                    </span>
                    <div className="space-y-2">
                      {emergencyCard.emergencyContacts && emergencyCard.emergencyContacts.length > 0 ? (
                        emergencyCard.emergencyContacts.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200"
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.relationship}</p>
                            </div>
                            <a
                              href={`tel:${c.phone}`}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call {c.phone}
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No contacts added yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  {emergencyCard.primaryPhysician?.name && (
                    <div className="text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200">
                      <span><strong>Doctor:</strong> {emergencyCard.primaryPhysician.name}</span>
                      <span>{emergencyCard.primaryPhysician.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
