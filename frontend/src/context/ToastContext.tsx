import React, { createContext, ReactNode } from 'react'
import { useToast, Toast, ToastType } from '../hooks/useToast'
interface ToastContextType { toasts: Toast[]; addToast: (type: ToastType, message: string) => void; removeToast: (id: string) => void; success: (msg: string) => void; error: (msg: string) => void; warning: (msg: string) => void; info: (msg: string) => void }
export const ToastContext = createContext<ToastContextType | undefined>(undefined)
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toasts, addToast, removeToast } = useToast()
  const value: ToastContextType = { toasts, addToast, removeToast, success: (m) => addToast('success', m), error: (m) => addToast('error', m), warning: (m) => addToast('warning', m), info: (m) => addToast('info', m), }
  return (
    <ToastContext.Provider value={value}>{children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto pixel-toast px-4 py-3 flex items-start gap-2 animate-slideIn ${
            t.type==='success'?'pixel-toast-success text-pixel-green':''} ${
            t.type==='error'?'pixel-toast-error text-pixel-coral':''} ${
            t.type==='warning'?'pixel-toast-warning text-pixel-amber':''} ${
            t.type==='info'?'pixel-toast-info text-village-sky':''}`}>
            <span className="font-vt text-base flex-1">{t.message}</span><button onClick={()=>removeToast(t.id)} className="font-pixel text-[8px] opacity-60 hover:opacity-100">&#x2715;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
export const useToastContext = () => { const ctx = React.useContext(ToastContext); if (!ctx) throw new Error('need toast provider'); return ctx }
