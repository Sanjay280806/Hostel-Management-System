import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Initialize state from localStorage on app load ──────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('hms_token');
    const storedUser = localStorage.getItem('hms_user');

    if (storedToken && storedUser) {
      try {
        // Check token expiry
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired: clear storage
          localStorage.removeItem('hms_token');
          localStorage.removeItem('hms_user');
        }
      } catch {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
      }
    }
    setLoading(false);
  }, []);

  // ─── Persist token & user to localStorage ────────────────────────────────────
  const persistSession = (token, user) => {
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // ─── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (email, password, role) => {
    const { data } = await api.post('/auth/register', { email, password, role });
    if (data.success) {
      persistSession(data.token, data.user);
    }
    return data;
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      persistSession(data.token, data.user);
    }
    return data;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom Hook ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
