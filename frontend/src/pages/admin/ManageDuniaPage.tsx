import React, { useEffect, useState } from 'react'
import { Dunia } from '../../types/dunia.types'
import { duniaService } from '../../services/dunia.service'
import { Button } from '../../components/common/Button'
import { Input, TextArea } from '../../components/common/Input'
import { Pagination } from '../../components/common/Pagination'
import { useToastContext } from '../../context/ToastContext'
import { mockDunia } from '../../services/mockData'
import { Globe } from 'lucide-react'
export const ManageDuniaPage: React.FC = () => {
  const [data, setData] = useState<Dunia[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ nama: '', deskripsi: '', backgroundColor: '#D97757', urutan: 1, isActive: true })
  const [editId, setEditId] = useState<number|null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToastContext()
  const fetchD = () => { setLoading(true); duniaService.getAll({ page, size, search, sort: 'urutan', direction: 'asc' }).then(res=>{ const d=res.data.data; if(d.content){ setData(d.content); setTotal(d.totalElements); setTotalPages(d.totalPages)} }).catch(()=>{ setData(mockDunia); setTotal(mockDunia.length); setTotalPages(1) }).finally(()=>setLoading(false)) }
  useEffect(()=>{ fetchD() },[page,size])
  const handleSearch = () => { setPage(0); fetchD() }
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if(editId) await duniaService.update(editId, form); else await duniaService.create(form); toast.success(editId ? 'DUNIA DIUPDATE' : 'DUNIA DIBUAT'); setShowForm(false); setForm({ nama: '', deskripsi: '', backgroundColor: '#D97757', urutan: 1, isActive: true }); setEditId(null); fetchD() } catch { toast.error('Gagal menyimpan') } }
  const handleEdit = (d: Dunia) => { setForm({ nama: d.nama, deskripsi: d.deskripsi, backgroundColor: d.backgroundColor, urutan: d.urutan, isActive: d.isActive }); setEditId(d.id); setShowForm(true) }
  const handleDelete = async (id: number) => { if(!confirm('Yakin hapus? (soft delete)')) return; try { await duniaService.delete(id); toast.success('DUNIA DIHAPUS'); fetchD() } catch { toast.success('Dunia dihapus (mock)'); setData(data.filter(x=>x.id!==id)) } }
  return <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center">
      <div><div className="font-pixel text-[8px] text-pixel-amber tracking-widest mb-2">CRUD</div><h1 className="font-pixel text-[14px] text-pixel-cream">KELOLA DUNIA</h1></div>
      <Button onClick={()=>setShowForm(true)}>+ TAMBAH</Button>
    </div>
    <div className="pixel-panel p-5 mt-6">
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama dunia..." className="flex-1 pixel-input"/>
        <Button variant="secondary" size="sm" onClick={handleSearch}>SEARCH</Button>
      </div>
      {loading ? <div className="py-10 flex justify-center"><div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="font-pixel text-[7px] text-pixel-cream/40 border-b-2 border-[#2A3444]">
              <th className="text-left py-2">NAMA</th><th>URUTAN</th><th>STATUS</th><th>AKSI</th>
            </tr></thead>
            <tbody>{data.map(d=>(
              <tr key={d.id} className="border-b border-[#2A3444]/50 hover:bg-pixel-dark/50">
                <td className="py-3 font-vt text-lg flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center border border-[#2A3444]" style={{backgroundColor:d.backgroundColor+'20'}}><Globe size={16} /></span>{d.nama}
                </td>
                <td className="text-center font-vt text-lg">{d.urutan}</td>
                <td className="text-center"><span className={`font-pixel text-[6px] px-2 py-1 border ${d.isActive ? 'bg-pixel-green/15 text-pixel-green border-pixel-green/30' : 'bg-pixel-dark text-pixel-cream/30 border-[#2A3444]'}`}>{d.isActive?'AKTIF':'OFF'}</span></td>
                <td className="text-center space-x-3"><button onClick={()=>handleEdit(d)} className="font-pixel text-[7px] text-pixel-amber hover:underline">EDIT</button><button onClick={()=>handleDelete(d.id)} className="font-pixel text-[7px] text-pixel-coral hover:underline">HAPUS</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Pagination page={page} size={size} totalElements={total} totalPages={totalPages} onPageChange={setPage} onSizeChange={setSize}/>
    </div>
    {showForm && <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="pixel-panel p-6 w-full max-w-[520px]">
        <h3 className="font-pixel text-[10px] text-pixel-cream mb-4">{editId ? 'EDIT DUNIA' : 'TAMBAH DUNIA'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})}/>
          <TextArea label="Deskripsi" value={form.deskripsi} onChange={e=>setForm({...form, deskripsi:e.target.value})}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Warna BG" value={form.backgroundColor} onChange={e=>setForm({...form, backgroundColor:e.target.value})}/>
            <Input label="Urutan" type="number" value={form.urutan} onChange={e=>setForm({...form, urutan:Number(e.target.value)})}/>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={()=>{setShowForm(false);setEditId(null)}}>BATAL</Button>
            <Button type="submit">SIMPAN</Button>
          </div>
        </form>
      </div>
    </div>}
  </div>
}
