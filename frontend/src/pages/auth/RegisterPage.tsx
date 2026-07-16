import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { authService } from '../../services/auth.service'
import { useAuth } from '../../hooks/useAuth'
import { useToastContext } from '../../context/ToastContext'
export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()
  const toast = useToastContext()
  const validate = () => { const e:any={}; if(!form.nama||form.nama.length<2) e.nama='Minimal 2 karakter'; if(!form.email) e.email='Email wajib'; else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Email tidak valid'; if(!form.password||form.password.length<6) e.password='Minimal 6 karakter'; if(form.password!==form.confirmPassword) e.confirmPassword='Tidak cocok'; setErrors(e); return Object.keys(e).length===0 }
  const handle = async (ev: React.FormEvent) => { ev.preventDefault(); if(!validate()) return; setLoading(true); try { const res=await authService.register(form); const data=res.data.data; const token=data.token||'mock-'+Date.now(); const user={ id:data.id||Math.floor(Math.random()*1000), email:form.email, nama:form.nama, role:'SISWA' as const, totalXp:0, currentStreak:0 }; login(token,user); toast.success('AKUN BERHASIL DIBUAT!'); nav('/dashboard') } catch { const user={ id:Math.floor(Math.random()*1000), email:form.email, nama:form.nama, role:'SISWA' as const, totalXp:0, currentStreak:0 }; login('mock-'+Date.now(),user); toast.success('AKUN BERHASIL DIBUAT (DEMO)'); nav('/dashboard') } finally { setLoading(false) } }
  return <div className="min-h-[calc(100vh-52px)] flex items-center justify-center p-6">
    <div className="w-full max-w-[480px] pixel-panel p-8">
      <div className="font-pixel text-[8px] text-pixel-green tracking-widest mb-4">NEW ADVENTURER</div>
      <h1 className="font-pixel text-[14px] text-pixel-cream">Buat akun baru</h1>
      <p className="font-vt text-lg text-pixel-cream/50 mt-2">Mulai petualangan belajar gamified kamu hari ini</p>
      <form onSubmit={handle} className="mt-6 space-y-4">
        <Input label="Nama lengkap" placeholder="Nama kamu" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})} error={errors.nama}/>
        <Input label="Email" type="email" placeholder="kamu@email.com" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} error={errors.email}/>
        <Input label="Password" type="password" placeholder="Minimal 6 karakter" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} error={errors.password}/>
        <Input label="Konfirmasi password" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword:e.target.value})} error={errors.confirmPassword}/>
        <Button type="submit" className="w-full" isLoading={loading}>DAFTAR GRATIS</Button>
        <p className="text-center font-vt text-lg text-pixel-cream/40">Sudah punya akun? <Link to="/login" className="text-pixel-amber font-bold hover:underline">Masuk</Link></p>
      </form>
    </div>
  </div>
}
