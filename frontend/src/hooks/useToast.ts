
import { useState, useCallback } from 'react'
export type ToastType = 'success' | 'error' | 'warning' | 'info'
export interface Toast { id:string; type:ToastType; message:string }
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, addToast, removeToast }
}
