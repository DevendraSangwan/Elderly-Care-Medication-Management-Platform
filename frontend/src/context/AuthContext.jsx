import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('carebridge_token'));
  const [loading, setLoading] = useState(true);
  const [selectedElderlyId, setSelectedElderlyId] = useState(
    localStorage.getItem('carebridge_selected_elderly') || null
  );

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            // Default selected elderly
            if (res.user.role === 'elderly') {
              setSelectedElderlyId(res.user.id);
            } else if (res.user.linkedElderly && res.user.linkedElderly.length > 0) {
              const currentValid = res.user.linkedElderly.some(
                (e) => (e._id || e.id || e) === selectedElderlyId
              );
              if (!currentValid) {
                const first = res.user.linkedElderly[0];
                const firstId = first._id || first.id || first;
                setSelectedElderlyId(firstId);
                localStorage.setItem('carebridge_selected_elderly', firstId);
              }
            }
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleAuthSuccess = (tokenValue, userData) => {
    localStorage.setItem('carebridge_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);

    if (userData.role === 'elderly') {
      setSelectedElderlyId(userData.id);
      localStorage.setItem('carebridge_selected_elderly', userData.id);
    } else if (userData.linkedElderly && userData.linkedElderly.length > 0) {
      const first = userData.linkedElderly[0];
      const firstId = first._id || first.id || first;
      setSelectedElderlyId(firstId);
      localStorage.setItem('carebridge_selected_elderly', firstId);
    }
  };

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      handleAuthSuccess(res.token, res.user);
    }
    return res;
  };

  const loginWithPasscode = async (email, passcode) => {
    const res = await api.loginWithPasscode({ email, passcode });
    if (res.success) {
      handleAuthSuccess(res.token, res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      handleAuthSuccess(res.token, res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('carebridge_token');
    localStorage.removeItem('carebridge_selected_elderly');
    setToken(null);
    setUser(null);
    setSelectedElderlyId(null);
  };

  const changeSelectedElderly = (id) => {
    setSelectedElderlyId(id);
    localStorage.setItem('carebridge_selected_elderly', id);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        selectedElderlyId,
        setSelectedElderlyId: changeSelectedElderly,
        login,
        loginWithPasscode,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
