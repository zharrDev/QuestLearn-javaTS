import React, { useEffect, useState } from 'react'
import { Level } from '../../types/level.types'
import { levelService } from '../../services/level.service'
import { Button } from '../../components/common/Button'
import { Pagination } from '../../components/common/Pagination'
import { mockLevels } from '../../services/mockData'
import { Crown } from 'lucide-react'
export const ManageLevelPage: React.FC = () => {
  const [data, setData] = useState<Level[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const fetchL = () => { levelService.getAll({ page, size, search: search||undefined }).then(res=>{ const d=res.data.data; if(d.content){ setData(d.content); setTotal(d.totalElements); setTotalPages(d.totalPages)} }).catch(()=>{ setData(mockLevels); setTotal(mockLevels.length); setTotalPages(1) }) }
  useEffect(()=>{ fetchL() },[page,size])
  return <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="font-pixel text-[8px] text-pixel-green tracking-widest mb-2">CRUD</div>
    <h1 className="font-pixel text-[14px] text-pixel-cream">KELOLA LEVEL</h1>
    <div className="pixel-panel p-5 mt-6">
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari level..." className="flex-1 pixel-input"/>
        <Button size="sm" variant="secondary" onClick={()=>{setPage(0); fetchL()}}>FILTER</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="font-pixel text-[7px] text-pixel-cream/40 border-b-2 border-[#2A3444]">
            <th className="text-left py-2">NAMA</th><th>DUNIA</th><th>URUTAN</th><th>XP</th><th>BOSS?</th><th>STATUS</th>
          </tr></thead>
          <tbody>{data.map(l=>(
            <tr key={l.id} className="border-b border-[#2A3444]/50 hover:bg-pixel-dark/50">
              <td className="py-2 font-vt text-lg">{l.nama}</td>
              <td className="font-vt text-base text-pixel-cream/50">{l.duniaNama||l.duniaId}</td>
              <td className="text-center font-vt text-lg">{l.urutan}</td>
              <td className="text-center font-pixel text-[8px] text-pixel-amber">{l.xpReward}</td>
              <td className="text-center">{l.isBossLevel ? <Crown size={16} className="inline-block" /> : ''}</td>
              <td className="text-center"><span className={`font-pixel text-[6px] px-2 py-1 border ${l.isActive?'bg-pixel-green/15 text-pixel-green border-pixel-green/30':'bg-pixel-dark text-pixel-cream/30 border-[#2A3444]'}`}>{l.isActive?'AKTIF':'OFF'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Pagination page={page} size={size} totalElements={total} totalPages={totalPages} onPageChange={setPage} onSizeChange={setSize}/>
    </div>
  </div>
}
