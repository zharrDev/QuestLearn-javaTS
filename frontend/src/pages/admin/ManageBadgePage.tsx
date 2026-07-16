import React, { useEffect, useState } from 'react'
import { Badge } from '../../types/badge.types'
import { badgeService } from '../../services/badge.service'
import { Button } from '../../components/common/Button'
import { Input, TextArea } from '../../components/common/Input'
import { useToastContext } from '../../context/ToastContext'
import { mockBadges } from '../../services/mockData'
import { Award } from 'lucide-react'
export const ManageBadgePage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ nama: '', kode: '', deskripsi: '', warna: '#E8A93B', syaratType: 'XP', syaratValue: 100, xpBonus: 10 })
  const toast = useToastContext()
  const fetchB = () => { badgeService.getAll({}).then(res=>{ const d=res.data.data; if(d.content) setBadges(d.content); else if(Array.isArray(d)) setBadges(d) }).catch(()=>setBadges(mockBadges)) }
  useEffect(()=>{ fetchB() },[])
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await badgeService.create(form); toast.success('BADGE DIBUAT'); setShowForm(false); fetchB() } catch { toast.success('Badge dibuat (mock)'); setShowForm(false) } }
  return <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center">
      <div><div className="font-pixel text-[8px] text-pixel-amber tracking-widest mb-2">CRUD</div><h1 className="font-pixel text-[14px] text-pixel-cream">KELOLA BADGE</h1></div>
      <Button onClick={()=>setShowForm(true)}>+ BADGE</Button>
    </div>
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {badges.map(b => (
        <div key={b.id} className="pixel-panel p-4">
          <div className="w-12 h-12 flex items-center justify-center text-white border-2" style={{backgroundColor:b.warna, borderColor:b.warna}}><Award size={20} /></div>
          <h3 className="font-pixel text-[9px] text-pixel-cream mt-3">{b.nama}</h3>
          <p className="font-vt text-base text-pixel-cream/40">{b.deskripsi}</p>
          <p className="font-pixel text-[6px] mt-2 px-2 py-1 bg-pixel-dark border border-[#2A3444] text-pixel-cream/50 inline-block">{b.syaratType} ≥ {b.syaratValue}</p>
        </div>
      ))}
    </div>
    {showForm && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="pixel-panel p-6 w-full max-w-[480px]">
        <h3 className="font-pixel text-[10px] text-pixel-cream mb-4">TAMBAH BADGE</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nama" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})}/>
          <Input label="Kode Unik" value={form.kode} onChange={e=>setForm({...form, kode:e.target.value})}/>
          <TextArea label="Deskripsi" value={form.deskripsi} onChange={e=>setForm({...form, deskripsi:e.target.value})}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Warna" value={form.warna} onChange={e=>setForm({...form, warna:e.target.value})}/>
            <Input label="XP Bonus" type="number" value={form.xpBonus} onChange={e=>setForm({...form, xpBonus:Number(e.target.value)})}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Syarat Type" value={form.syaratType} onChange={e=>setForm({...form, syaratType:e.target.value})}/>
            <Input label="Nilai Syarat" type="number" value={form.syaratValue} onChange={e=>setForm({...form, syaratValue:Number(e.target.value)})}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={()=>setShowForm(false)}>BATAL</Button>
            <Button type="submit">SIMPAN</Button>
          </div>
        </form>
      </div>
    </div>}
  </div>
}
