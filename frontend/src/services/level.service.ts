
import api from './api'
import { LevelRequest } from '../types/level.types'
export const levelService = {
  getAll: (params?: any) => api.get('/levels', { params }),
  getByDunia: (duniaId: number) => api.get(`/dunia/${duniaId}/levels`),
  getById: (id: number) => api.get(`/levels/${id}`),
  create: (data: LevelRequest) => api.post('/admin/levels', data),
  update: (id: number, data: LevelRequest) => api.put(`/admin/levels/${id}`, data),
  delete: (id: number) => api.delete(`/admin/levels/${id}`),
}
