import api from './api';

export const attendanceService = {
  getAll: (params = {}) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  batchMark: (data) => api.post('/attendance/batch', data),
};
