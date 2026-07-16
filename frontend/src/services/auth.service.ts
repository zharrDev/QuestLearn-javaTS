
import api from './api'
import { LoginRequest, RegisterRequest } from '../types/auth.types'
export const authService = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => api.post('/auth/reset-password', { token, newPassword, confirmPassword }),
  me: () => api.get('/auth/me'),
}
