import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();

  const [seniorMode, setSeniorMode] = useState(() => {
    const saved = localStorage.getItem('carebridge_senior_mode');
    if (saved !== null) return saved === 'true';
    return true; // Default enabled for accessibility
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('carebridge_high_contrast') === 'true';
  });

  const [speechEnabled, setSpeechEnabled] = useState(() => {
    return localStorage.getItem('carebridge_speech_enabled') !== 'false';
  });

  // When user logs in, adopt their preferences if stored
  useEffect(() => {
    if (user && user.preferences) {
      if (user.preferences.seniorMode !== undefined) {
        setSeniorMode(user.preferences.seniorMode);
      }
      if (user.preferences.highContrast !== undefined) {
        setHighContrast(user.preferences.highContrast);
      }
    } else if (user && user.role === 'elderly') {
      setSeniorMode(true);
    }
  }, [user]);

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => {
      const next = !prev;
      localStorage.setItem('carebridge_senior_mode', String(next));
      return next;
    });
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('carebridge_high_contrast', String(next));
      return next;
    });
  };

  const toggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('carebridge_speech_enabled', String(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        seniorMode,
        setSeniorMode,
        toggleSeniorMode,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        speechEnabled,
        toggleSpeech
      }}
    >
      <div className={`${highContrast ? 'high-contrast-mode' : ''} ${seniorMode ? 'senior-mode' : ''}`}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
