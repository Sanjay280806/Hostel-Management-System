import api from './api';

export const visitorService = {
  getAll: (params = {}) => api.get('/visitors', { params }),
  checkIn: (data) => api.post('/visitors', data),
  checkOut: (id) => api.put(`/visitors/${id}/checkout`),
};
