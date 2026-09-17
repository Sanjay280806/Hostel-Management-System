import api from './api';

export const allocationService = {
  getAll: (params = {}) => api.get('/allocations', { params }),
  getById: (id) => api.get(`/allocations/${id}`),
  allocate: (data) => api.post('/allocations', data),
  vacate: (id, data = {}) => api.put(`/allocations/${id}/vacate`, data),
};
