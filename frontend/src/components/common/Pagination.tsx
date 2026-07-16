
import React from 'react'
import { Button } from './Button'
interface PaginationProps { page: number; totalPages: number; totalElements: number; size: number; onPageChange: (page: number) => void; onSizeChange?: (size: number) => void }
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, totalElements, size, onPageChange, onSizeChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      <div className="font-vt text-sm text-pixel-cream/60">Total {totalElements} data &bull; Halaman {page + 1} dari {totalPages || 1}</div>
      <div className="flex items-center gap-2">
        {onSizeChange && <select value={size} onChange={e=>onSizeChange(Number(e.target.value))} className="pixel-select text-sm px-3 py-1.5"><option value={5}>5 / page</option><option value={10}>10 / page</option><option value={20}>20 / page</option></select>}
        <Button variant="ghost" size="sm" disabled={page===0} onClick={()=>onPageChange(page-1)}>&lsaquo; Prev</Button>
        <div className="flex gap-1">{Array.from({ length: Math.min(totalPages,5) }, (_, i) => { let p = i; if (totalPages>5) { if (page<=2) p=i; else if (page>=totalPages-3) p=totalPages-5+i; else p=page-2+i } return <button key={p} onClick={()=>onPageChange(p)} className={`font-pixel text-[8px] w-8 h-8 flex items-center justify-center border-2 transition ${p===page ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' : 'bg-pixel-panel text-pixel-cream border-[#2A3444] hover:border-pixel-cream/40'}`}>{p+1}</button> })}</div>
        <Button variant="ghost" size="sm" disabled={page>=totalPages-1} onClick={()=>onPageChange(page+1)}>Next &rsaquo;</Button>
      </div>
    </div>
  )
}
