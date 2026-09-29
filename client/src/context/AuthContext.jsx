import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('icenet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('icenet_token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('icenet_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('icenet_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('icenet_token', token);
    } else {
      localStorage.removeItem('icenet_token');
    }
  }, [token]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginAsDemoRole = async (role) => {
    let email = 'admin@icenet.bg';
    if (role === 'provider') email = 'provider@frigotrans.bg';
    if (role === 'merchant') email = 'merchant@lacta.bg';
    return await login(email, 'password123', role);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('icenet_user');
    localStorage.removeItem('icenet_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsDemoRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
