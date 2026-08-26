import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ehub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ehub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('ehub_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyStoredAuth();
  }, [token]);

  const login = (authData) => {
    const userData = {
      id: authData.userId || authData.id,
      fullName: authData.fullName,
      email: authData.email,
      registrationNumber: authData.registrationNumber,
      role: authData.role,
      verified: !authData.requiresOtpVerification
    };

    setToken(authData.token);
    setUser(userData);
    localStorage.setItem('ehub_token', authData.token);
    localStorage.setItem('ehub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ehub_token');
    localStorage.removeItem('ehub_user');
  };

  const markVerified = () => {
    if (user) {
      const updated = { ...user, verified: true };
      setUser(updated);
      localStorage.setItem('ehub_user', JSON.stringify(updated));
    }
  };

  const isOrganizer = user?.role === 'ROLE_ORGANIZER';
  const isParticipant = user?.role === 'ROLE_PARTICIPANT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isOrganizer,
        isParticipant,
        login,
        logout,
        markVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
