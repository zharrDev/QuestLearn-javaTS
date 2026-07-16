import React, { useState } from 'react'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { authService } from '../../services/auth.service'
import { useToastContext } from '../../context/ToastContext'
import { Link } from 'react-router-dom'
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const toast = useToastContext()
  const handle = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { await authService.forgotPassword(email); setSent(true); toast.success('Link reset dikirim!') } catch { setSent(true); toast.success('Link reset telah dikirim (demo)') } finally { setLoading(false) } }
  return <div className="min-h-[calc(100vh-52px)] flex items-center justify-center p-6"><div className="w-full max-w-[400px] pixel-panel p-8"><div className="font-pixel text-[8px] text-pixel-coral tracking-widest mb-4">PASSWORD RESET</div><h1 className="font-pixel text-[12px] text-pixel-cream">Lupa password?</h1><p className="font-vt text-lg text-pixel-cream/50 mt-2">Masukkan email, kami kirim link reset</p>{sent ? <div className="mt-6 pixel-panel-light p-4"><p className="font-pixel text-[8px] text-pixel-green">EMAIL TERKIRIM!</p><p className="font-vt text-base text-pixel-cream/60 mt-2">Cek email atau console log backend untuk demo.</p><Link to="/login" className="mt-3 inline-block font-vt text-lg text-pixel-amber hover:underline">Kembali ke login</Link></div> : <form onSubmit={handle} className="mt-6 space-y-4"><Input label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="kamu@email.com"/><Button type="submit" className="w-full" isLoading={loading}>KIRIM LINK RESET</Button><Link to="/login" className="block text-center font-vt text-lg text-pixel-cream/40 hover:text-pixel-cream">Kembali ke login</Link></form>}</div></div>
}
