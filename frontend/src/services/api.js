import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT Bearer Token ────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 Globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if the failed request was a login attempt
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
