import api from './api';

export const feeService = {
  getAll: (params = {}) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  markAsPaid: (id) => api.put(`/fees/${id}/pay`),
};
