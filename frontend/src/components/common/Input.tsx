
import React from 'react'
import { cn } from '../../utils/validators'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string }
export const Input: React.FC<InputProps> = ({ label, error, hint, className, ...props }) => {
  return <div className="w-full space-y-1.5">{label && <label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">{label}</label>}<input className={cn("pixel-input", error && "pixel-input-error", className)} {...props} />{error && <p className="font-vt text-sm text-pixel-coral">{error}</p>}{hint && !error && <p className="font-vt text-sm text-pixel-cream/50">{hint}</p>}</div>
}
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({ label, error, className, ...props }) => (
  <div className="w-full space-y-1.5">{label && <label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">{label}</label>}<textarea className={cn("pixel-input min-h-[90px] resize-y", error && "pixel-input-error", className)} {...props} />{error && <p className="font-vt text-sm text-pixel-coral">{error}</p>}</div>
)
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }> = ({ label, error, className, children, ...props }) => (
  <div className="w-full space-y-1.5">{label && <label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">{label}</label>}<select className={cn("pixel-select", error && "pixel-input-error", className)} {...props}>{children}</select>{error && <p className="font-vt text-sm text-pixel-coral">{error}</p>}</div>
)
