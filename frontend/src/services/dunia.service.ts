
import api from './api'
import { DuniaRequest } from '../types/dunia.types'
export const duniaService = {
  getAll: (params?: any) => api.get('/dunia', { params }),
  getAllForUser: () => api.get('/dunia/user'),
  getPublic: () => api.get('/public/dunia'),
  getById: (id: number) => api.get(`/dunia/${id}`),
  create: (data: DuniaRequest) => api.post('/admin/dunia', data),
  update: (id: number, data: DuniaRequest) => api.put(`/admin/dunia/${id}`, data),
  delete: (id: number) => api.delete(`/admin/dunia/${id}`),
}
