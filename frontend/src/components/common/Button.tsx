
import React from 'react'
import { cn } from '../../utils/validators'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber' | 'success' | 'navy'; size?: 'sm' | 'md' | 'lg'; isLoading?: boolean }
export const Button: React.FC<ButtonProps> = ({ className, variant='primary', size='md', isLoading, children, disabled, ...props }) => {
  const base = "pixel-btn"
  const variants: Record<string, string> = {
    primary: "pixel-btn-primary",
    secondary: "pixel-btn-navy",
    ghost: "pixel-btn-ghost",
    danger: "pixel-btn-danger",
    amber: "pixel-btn-primary",
    success: "pixel-btn-success",
    navy: "pixel-btn-navy",
  }
  const sizes = { sm: "px-3 py-1.5 text-[8px]", md: "px-5 py-2.5 text-[9px]", lg: "px-7 py-3 text-[10px]" }
  return <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>{isLoading ? <span className="inline-block w-3 h-3 border-2 border-current/30 border-t-current animate-spin mr-1"/> : null}{children}</button>
}
