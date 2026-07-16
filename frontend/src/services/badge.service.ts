
import api from './api'
import { BadgeRequest } from '../types/badge.types'
export const badgeService = {
  getAll: (params?: any) => api.get('/badges', { params }),
  getUserBadges: () => api.get('/badges/user'),
  getById: (id: number) => api.get(`/badges/${id}`),
  create: (data: BadgeRequest) => api.post('/admin/badges', data),
  update: (id: number, data: BadgeRequest) => api.put(`/admin/badges/${id}`, data),
  delete: (id: number) => api.delete(`/admin/badges/${id}`),
}
