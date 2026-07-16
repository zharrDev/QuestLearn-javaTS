
import api from './api'
import { SubmitQuestRequest } from '../types/soal.types'
export const progressService = {
  getProgress: (params?: any) => api.get('/progress', { params }),
  submitQuest: (data: SubmitQuestRequest) => api.post('/quest/submit', data),
  getDashboard: () => api.get('/dashboard'),
  getLeaderboard: (period = 'weekly') => api.get('/leaderboard', { params: { period } }),
  getPublicLeaderboard: (period = 'weekly') => api.get('/public/leaderboard', { params: { period } }),
}
