
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pixel-bg"><div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
export const RoleRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pixel-bg"><div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!roles.includes(user?.role || '')) return <Navigate to="/403" replace />
  return <>{children}</>
}
