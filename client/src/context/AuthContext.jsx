import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [company, setCompany] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_company');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('sf_token');
    if (!token) { setLoading(false); return; }

    authAPI.me()
      .then((res) => setCompany(res.data.company))
      .catch(() => {
        localStorage.removeItem('sf_token');
        localStorage.removeItem('sf_company');
        setCompany(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, company: c } = res.data;
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_company', JSON.stringify(c));
    setCompany(c);
    return c;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, company: c } = res.data;
    localStorage.setItem('sf_token', token);
    localStorage.setItem('sf_company', JSON.stringify(c));
    setCompany(c);
    return c;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_company');
    setCompany(null);
  }, []);

  return (
    <AuthContext.Provider value={{ company, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
