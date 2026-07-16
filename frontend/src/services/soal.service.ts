
import api from './api'
import { SoalRequest } from '../types/soal.types'
export const soalService = {
  getAll: (params?: any) => api.get('/soal', { params }),
  getByLevel: (levelId: number) => api.get(`/levels/${levelId}/soal`),
  getById: (id: number) => api.get(`/soal/${id}`),
  createJson: (data: SoalRequest) => api.post('/admin/soal/json', data),
  createWithFile: (data: SoalRequest, file?: File) => {
    const fd = new FormData()
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (file) fd.append('file', file)
    return api.post('/admin/soal', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  updateJson: (id: number, data: SoalRequest) => api.put(`/admin/soal/${id}/json`, data),
  delete: (id: number) => api.delete(`/admin/soal/${id}`),
}
