import api from './api';

export const noticeService = {
  getAll: () => api.get('/notices'),
  getPublic: () => api.get('/notices/public'),
  create: (data) => api.post('/notices', data),
  delete: (id) => api.delete(`/notices/${id}`),
};
