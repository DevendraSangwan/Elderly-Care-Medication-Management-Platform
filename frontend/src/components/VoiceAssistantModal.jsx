import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/speechService';
import { Mic, MicOff, Volume2, Sparkles, X, MessageSquare, Check, HelpCircle } from 'lucide-react';

export const VoiceAssistantModal = ({ isOpen, onClose, onRefreshSchedule }) => {
  const { user, selectedElderlyId } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizer, setRecognizer] = useState(null);

  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setAssistantReply('Hello! I am your CareBridge voice assistant. How can I help with your medications or appointments today?');
      speakText('Hello! I am your CareBridge voice assistant. How can I help with your medications or appointments today?');
    } else {
      stopSpeaking();
    }
  }, [isOpen]);

  const processVoiceCommand = async (commandText) => {
    const text = commandText.toLowerCase();
    let reply = '';

    // 1. "What pills do I take today?" or "Schedule"
    if (text.includes('pill') || text.includes('medication') || text.includes('schedule') || text.includes('today')) {
      try {
        const res = await api.getDailySchedule(targetId);
        if (res.success && res.allLogs) {
          const pending = res.allLogs.filter(l => l.status === 'pending');
          const taken = res.allLogs.filter(l => l.status === 'taken');

          if (pending.length === 0) {
            reply = `Great job! You have taken all your scheduled medications for today.`;
          } else {
            const list = pending.map(p => `${p.medicationName} (${p.dosage}) at ${p.scheduledTime}`).join(', ');
            reply = `You have ${pending.length} pending doses today: ${list}. You have already taken ${taken.length} doses.`;
          }
        }
      } catch (e) {
        reply = `I could not fetch your schedule right now. Please check your dashboard.`;
      }
    }
    // 2. "Mark taken" or "I took my pills"
    else if (text.includes('take') || text.includes('taken') || text.includes('drank') || text.includes('swallowed')) {
      try {
        const res = await api.getDailySchedule(targetId);
        if (res.success && res.allLogs) {
          const firstPending = res.allLogs.find(l => l.status === 'pending');
          if (firstPending) {
            await api.updateDoseStatus(firstPending._id, 'taken');
            reply = `Wonderful! I have marked your ${firstPending.medicationName} dose as taken. Good health to you!`;
            if (onRefreshSchedule) onRefreshSchedule();
          } else {
            reply = `All your scheduled doses for today are already marked as taken!`;
          }
        }
      } catch (e) {
        reply = `Sorry, I could not record that. Please tap the Mark Taken button directly on your screen.`;
      }
    }
    // 3. "Doctor appointment"
    else if (text.includes('appointment') || text.includes('doctor') || text.includes('clinic')) {
      try {
        const res = await api.getAppointments(targetId, 'scheduled');
        if (res.success && res.upcoming && res.upcoming.length > 0) {
          const next = res.upcoming[0];
          reply = `Your next appointment is with ${next.doctorName} on ${next.date} at ${next.time} for ${next.purpose}.`;
        } else {
          reply = `You have no upcoming doctor appointments scheduled in the next few days.`;
        }
      } catch (e) {
        reply = `Unable to look up appointments right now.`;
      }
    }
    // 4. Default: Query AI healthcare routine assistance
    else {
      try {
        const res = await api.askAI(commandText, targetId);
        if (res.success) {
          reply = res.answer.replace(/[*#]/g, '').substring(0, 300);
        } else {
          reply = `I am listening. You can ask: "What pills do I take today?", "Mark my pills as taken", or "When is my doctor appointment?"`;
        }
      } catch (e) {
        reply = `I am listening. You can ask: "What pills do I take today?", or "Mark my pills as taken".`;
      }
    }

    setAssistantReply(reply);
    setIsSpeaking(true);
    speakText(reply, () => setIsSpeaking(false));
  };

  const startListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or click the sample voice commands below.');
      return;
    }

    stopSpeaking();
    setIsListening(true);
    setTranscript('Listening for your voice...');

    const rec = createSpeechRecognizer({
      onResult: (text) => {
        setTranscript(text);
        setIsListening(false);
        processVoiceCommand(text);
      },
      onError: (err) => {
        setTranscript(`Could not recognize speech: ${err}`);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (rec) {
      rec.start();
      setRecognizer(rec);
    }
  };

  const stopListening = () => {
    if (recognizer) {
      recognizer.stop();
    }
    setIsListening(false);
  };

  const handleQuickCommand = (text) => {
    setTranscript(text);
    processVoiceCommand(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 text-center relative">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black">Voice Healthcare Assistant</h2>
          <p className="text-blue-100 text-xs font-semibold">
            Speak naturally to check schedules or mark your medications
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Microphone Button */}
          <div className="text-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto shadow-xl transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white ring-8 ring-red-200 animate-pulse scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 ring-4 ring-blue-100'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-10 h-10" />
                  <span className="text-[10px] font-black uppercase mt-1">Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10" />
                  <span className="text-[10px] font-black uppercase mt-1">Tap & Speak</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 font-bold mt-3">
              {isListening ? 'Speak now into your microphone...' : 'Tap the microphone to start speaking'}
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                You said:
              </span>
              <p className="text-slate-800 font-semibold text-base italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Assistant Voice Output Box */}
          {assistantReply && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> CareBridge Voice
                </span>
                <button
                  onClick={() => speakText(assistantReply)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Repeat Audio
                </button>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed">
                {assistantReply}
              </p>
            </div>
          )}

          {/* Sample Voice Prompts (Useful for 1-click testing or non-mic setups!) */}
          <div>
            <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
              Or tap any voice command to try:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickCommand('What pills do I take today?')}
                className="p-2.5 text-left rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
                "What pills do I take today?"
              </button>
              <button
                onClick={() => handleQuickCommand('Mark my morning pill as taken')}
                className="p-2.5 text-left rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                "Mark my morning pill as taken"
              </button>
              <button
                onClick={() => handleQuickCommand('When is my next doctor appointment?')}
                className="p-2.5 text-left rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                "When is my next appointment?"
              </button>
              <button
                onClick={() => handleQuickCommand('Can I take Aspirin with Warfarin?')}
                className="p-2.5 text-left rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                "Drug interaction check"
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
