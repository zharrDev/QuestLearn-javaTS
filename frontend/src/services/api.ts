
import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use((config) => { const token = localStorage.getItem('questlearn_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401) {
    const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register')
    const token = localStorage.getItem('questlearn_token')
    if (!isAuthPage && token && !token.startsWith('mock-')) {
      localStorage.removeItem('questlearn_token')
      localStorage.removeItem('questlearn_user')
    }
  }
  return Promise.reject(err)
})
export default api
