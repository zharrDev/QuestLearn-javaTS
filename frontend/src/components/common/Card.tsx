
import React from 'react'
import { cn } from '../../utils/validators'
export const Card: React.FC<{ className?: string; children: React.ReactNode; hover?: boolean; style?: React.CSSProperties }> = ({ className, children, hover, style }) => {
  return <div style={style} className={cn("pixel-panel p-5", hover && "pixel-card-hover cursor-pointer transition-all", className)}>{children}</div>
}
