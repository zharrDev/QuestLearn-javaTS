import React, { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { authService } from '../../services/auth.service'
import { useToastContext } from '../../context/ToastContext'
export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const toast = useToastContext()
  const handle = async (e: React.FormEvent) => { e.preventDefault(); if(pwd!==confirm){toast.error('Password tidak cocok'); return} setLoading(true); try { await authService.resetPassword(token||'demo-token', pwd, confirm); toast.success('Password berhasil direset!'); nav('/login') } catch (err:any) { toast.error(err.response?.data?.message||'Gagal reset') } finally { setLoading(false) } }
  return <div className="min-h-[calc(100vh-52px)] flex items-center justify-center p-6"><div className="w-full max-w-[400px] pixel-panel p-8"><div className="font-pixel text-[8px] text-pixel-amber tracking-widest mb-4">RESET PASSWORD</div><h1 className="font-pixel text-[12px] text-pixel-cream">Reset password</h1><form onSubmit={handle} className="mt-6 space-y-4"><Input label="Password baru" type="password" value={pwd} onChange={e=>setPwd(e.target.value)}/><Input label="Konfirmasi password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/><Button type="submit" className="w-full" isLoading={loading}>RESET PASSWORD</Button><Link to="/login" className="block text-center font-vt text-lg text-pixel-cream/40">Kembali ke login</Link></form></div></div>
}
