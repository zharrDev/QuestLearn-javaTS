
import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/auth.types'
import { authService } from '../services/auth.service'
interface AuthContextType { user: User | null; token: string | null; isAuthenticated: boolean; isAdmin: boolean; login: (token: string, user: User) => void; logout: () => void; loading: boolean }
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const savedToken = localStorage.getItem('questlearn_token')
    const savedUser = localStorage.getItem('questlearn_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        if (!savedToken.startsWith('mock-')) {
          authService.me().then(() => {}).catch(() => {})
        }
      } catch { localStorage.removeItem('questlearn_token'); localStorage.removeItem('questlearn_user') }
    }
    setLoading(false)
  }, [])
  const login = (newToken: string, newUser: User) => { localStorage.setItem('questlearn_token', newToken); localStorage.setItem('questlearn_user', JSON.stringify(newUser)); setToken(newToken); setUser(newUser) }
  const logout = () => { localStorage.removeItem('questlearn_token'); localStorage.removeItem('questlearn_user'); setToken(null); setUser(null) }
  return <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isAdmin: user?.role === 'ADMIN', login, logout, loading }}>{children}</AuthContext.Provider>
}
