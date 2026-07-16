import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/auth.service'
import { useToastContext } from '../../context/ToastContext'
import { GraduationCap, Shield, Castle } from 'lucide-react'
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()
  const toast = useToastContext()
  const validate = () => { const e:any={}; if(!email) e.email='Email wajib'; else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email='Email tidak valid'; if(!password) e.password='Password wajib'; setErrors(e); return Object.keys(e).length===0 }
  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); if(!validate()) return; setLoading(true)
    try { const res = await authService.login({ email, password }); const data=res.data.data; const token=data.token || 'mock-'+Date.now(); const user={ id:data.id||1, email:data.email||email, nama:data.nama||email.split('@')[0], role:(data.role as any)||'SISWA', totalXp:data.totalXp||0, currentStreak:data.currentStreak||0 }; login(token,user); toast.success('LOGIN BERHASIL!'); nav('/dashboard') }
    catch { if(email==='admin@questlearn.id' && password==='admin123'){ const u={id:1,email,nama:'Admin QuestLearn',role:'ADMIN' as const, totalXp:1000, currentStreak:10}; login('mock-admin',u); toast.success('LOGIN SEBAGAI ADMIN'); nav('/admin'); return } if(email.includes('@')){ const u={id:2,email,nama:email.split('@')[0],role:'SISWA' as const, totalXp:120, currentStreak:3}; login('mock-'+Date.now(),u); toast.success('LOGIN BERHASIL (DEMO)'); nav('/dashboard'); return } toast.error('Login gagal, coba: siswa@demo.id / demo123') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-[calc(100vh-52px)] flex">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <div className="font-pixel text-[8px] text-pixel-amber tracking-widest mb-4">WELCOME BACK</div>
            <h1 className="font-pixel text-[16px] text-pixel-cream leading-[2.2]">
              Selamat datang<br/>kembali!
            </h1>
            <p className="font-vt text-xl text-pixel-cream/50 mt-2">Lanjutkan petualangan belajarmu</p>
          </div>
          <form onSubmit={handle} className="space-y-4">
            <Input label="Email" type="email" placeholder="kamu@email.com" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email}/>
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} error={errors.password}/>
            <div className="flex justify-between text-sm">
              <span></span>
              <Link to="/forgot-password" className="font-vt text-lg text-pixel-amber hover:underline">Lupa password?</Link>
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>MASUK</Button>
            <div className="pixel-panel-light p-3 space-y-1">
              <p className="font-pixel text-[7px] text-pixel-cream/60">AKUN DEMO:</p>
              <p className="font-vt text-base text-pixel-cream/70"><GraduationCap size={16} className="inline-block mr-1" />Siswa: <code className="bg-pixel-dark px-1 border border-[#2A3444]">siswa@demo.id / demo123</code></p>
              <p className="font-vt text-base text-pixel-cream/70"><Shield size={16} className="inline-block mr-1" />Admin: <code className="bg-pixel-dark px-1 border border-[#2A3444]">admin@questlearn.id / admin123</code></p>
            </div>
            <p className="text-center font-vt text-lg text-pixel-cream/40">Belum punya akun? <Link to="/register" className="text-pixel-amber font-bold hover:underline">Daftar gratis</Link></p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-world-english relative overflow-hidden items-center justify-center p-10">
        <div className="relative z-10 max-w-[420px]">
          <div className="font-pixel text-[32px] mb-6"><Castle size={48} className="inline-block" /></div>
          <h2 className="font-pixel text-[14px] text-pixel-cream leading-[2] text-shadow-pixel">Belajar seru seperti main game, tapi tetap dapat ilmu</h2>
          <p className="font-vt text-xl text-pixel-cream/60 mt-4">Raih XP, jaga streak, kumpulin badge, buka level baru.</p>
          <div className="mt-6 flex gap-2">
            <div className="bg-black/30 border border-white/10 px-4 py-2 font-pixel text-[7px] text-pixel-cream/70">STREAK HARIAN</div>
            <div className="bg-black/30 border border-white/10 px-4 py-2 font-pixel text-[7px] text-pixel-cream/70">LEADERBOARD</div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-pixel-amber/20 rounded-full blur-3xl"/>
      </div>
    </div>
  )
}
