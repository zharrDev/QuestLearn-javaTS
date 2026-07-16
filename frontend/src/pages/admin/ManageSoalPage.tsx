
import React, { useEffect, useState } from 'react'
import { Soal } from '../../types/soal.types'
import { soalService } from '../../services/soal.service'
import { Button } from '../../components/common/Button'
import { Input, TextArea, Select } from '../../components/common/Input'
import { Pagination } from '../../components/common/Pagination'
import { useToastContext } from '../../context/ToastContext'
import { mockSoal } from '../../services/mockData'
export const ManageSoalPage: React.FC = () => {
  const [data, setData] = useState<Soal[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [tingkat, setTingkat] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ levelId: 1, pertanyaan: '', opsiA: '', opsiB: '', opsiC: '', opsiD: '', jawabanBenar: 'A', pembahasan: '', tingkatKesulitan: 'MUDAH', xpPoint: 10 })
  const [file, setFile] = useState<File|undefined>(undefined)
  const toast = useToastContext()
  const fetchS = () => { soalService.getAll({ page, size, search: search||undefined, tingkatKesulitan: tingkat||undefined, sort: 'id', dir: 'desc' }).then(res=>{ const d=res.data.data; if(d.content){ setData(d.content); setTotal(d.totalElements); setTotalPages(d.totalPages)} }).catch(()=>{ setData(mockSoal); setTotal(mockSoal.length); setTotalPages(1) }) }
  useEffect(()=>{ fetchS() },[page,size])
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if(file) await soalService.createWithFile(form, file); else await soalService.createJson(form); toast.success('SOAL DIBUAT!'); setShowForm(false); fetchS() } catch { toast.success('Soal dibuat (mock)'); setShowForm(false) } }
  const handleDelete = async (id:number) => { if(!confirm('Hapus soal?')) return; try { await soalService.delete(id); toast.success('SOAL DIHAPUS'); fetchS() } catch { setData(data.filter(x=>x.id!==id)); toast.success('Soal dihapus (mock)') } }
  return <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center">
      <div><div className="font-pixel text-[8px] text-pixel-amber tracking-widest mb-2">CRUD</div><h1 className="font-pixel text-[14px] text-pixel-cream">KELOLA SOAL ({total})</h1></div>
      <Button onClick={()=>setShowForm(true)}>+ TAMBAH</Button>
    </div>
    <div className="pixel-panel p-5 mt-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari pertanyaan..." className="flex-1 min-w-[200px] pixel-input"/>
        <select value={tingkat} onChange={e=>setTingkat(e.target.value)} className="pixel-select w-auto">
          <option value="">SEMUA TINGKAT</option><option>MUDAH</option><option>SEDANG</option><option>SULIT</option>
        </select>
        <Button size="sm" variant="secondary" onClick={()=>{setPage(0); fetchS()}}>FILTER</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="font-pixel text-[7px] text-pixel-cream/40 border-b-2 border-[#2A3444]">
            <th className="text-left py-2">PERTANYAAN</th><th>LEVEL</th><th>TINGKAT</th><th>XP</th><th>AKSI</th>
          </tr></thead>
          <tbody>{data.map(s=>(
            <tr key={s.id} className="border-b border-[#2A3444]/50 hover:bg-pixel-dark/50">
              <td className="py-3 max-w-[320px] truncate font-vt text-base">{s.pertanyaan}</td>
              <td className="text-center font-vt text-lg">{s.levelId}</td>
              <td className="text-center"><span className={`font-pixel text-[6px] px-2 py-1 border ${s.tingkatKesulitan==='MUDAH'?'bg-pixel-green/15 text-pixel-green border-pixel-green/30':s.tingkatKesulitan==='SULIT'?'bg-pixel-coral/15 text-pixel-coral border-pixel-coral/30':'bg-pixel-amber/15 text-pixel-amber border-pixel-amber/30'}`}>{s.tingkatKesulitan}</span></td>
              <td className="text-center font-pixel text-[8px] text-pixel-amber">{s.xpPoint}</td>
              <td className="text-center"><button onClick={()=>handleDelete(s.id)} className="font-pixel text-[7px] text-pixel-coral hover:underline">HAPUS</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Pagination page={page} size={size} totalElements={total} totalPages={totalPages} onPageChange={setPage} onSizeChange={setSize}/>
    </div>
    {showForm && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="pixel-panel p-6 w-full max-w-[600px]">
        <h3 className="font-pixel text-[10px] text-pixel-cream mb-4">TAMBAH SOAL</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Level ID" type="number" value={form.levelId} onChange={e=>setForm({...form, levelId:Number(e.target.value)})}/>
          <TextArea label="Pertanyaan" value={form.pertanyaan} onChange={e=>setForm({...form, pertanyaan:e.target.value})}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Opsi A" value={form.opsiA} onChange={e=>setForm({...form, opsiA:e.target.value})}/>
            <Input label="Opsi B" value={form.opsiB} onChange={e=>setForm({...form, opsiB:e.target.value})}/>
            <Input label="Opsi C" value={form.opsiC} onChange={e=>setForm({...form, opsiC:e.target.value})}/>
            <Input label="Opsi D" value={form.opsiD} onChange={e=>setForm({...form, opsiD:e.target.value})}/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Benar" value={form.jawabanBenar} onChange={e=>setForm({...form, jawabanBenar:e.target.value})}>
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </Select>
            <Select label="Tingkat" value={form.tingkatKesulitan} onChange={e=>setForm({...form, tingkatKesulitan:e.target.value})}>
              <option>MUDAH</option><option>SEDANG</option><option>SULIT</option>
            </Select>
            <Input label="XP" type="number" value={form.xpPoint} onChange={e=>setForm({...form, xpPoint:Number(e.target.value)})}/>
          </div>
          <TextArea label="Pembahasan" value={form.pembahasan} onChange={e=>setForm({...form, pembahasan:e.target.value})}/>
          <div><label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">GAMBAR (OPSIONAL)</label><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} className="mt-1 pixel-input file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-pixel-amber file:text-pixel-navy file:font-pixel file:text-[7px]"/></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={()=>setShowForm(false)}>BATAL</Button><Button type="submit">SIMPAN</Button></div>
        </form>
      </div>
    </div>}
  </div>
}
