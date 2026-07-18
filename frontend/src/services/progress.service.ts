import api from './api'

export const progressService = {
  getProgress: (params?: any) => api.get('/progress', { params }),
  getDashboard: () => api.get('/dashboard'),
  getLeaderboard: (period = 'weekly') => api.get('/leaderboard', { params: { period } }),
  getPublicLeaderboard: (period = 'weekly') => api.get('/public/leaderboard', { params: { period } }),
}
