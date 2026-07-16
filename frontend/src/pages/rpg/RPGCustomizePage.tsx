import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerCustomizer } from '../../components/rpg/PlayerCustomizer'
import { PlayerData } from '../../types/rpg.types'
import { useToastContext } from '../../context/ToastContext'
import { Gamepad2, Sparkles, Lightbulb } from 'lucide-react'

export const RPGCustomizePage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToastContext()
  const [saved, setSaved] = useState(false)

  const handleSave = (data: PlayerData) => {
    setSaved(true)
    toast.success(`Karakter ${data.nickname} ${data.avatar} siap berpetualang!`)
    setTimeout(() => navigate('/rpg'), 500)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-pixel-dark flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2"><Gamepad2 size={48} className="inline-block mr-2" /><Sparkles size={36} className="inline-block text-pixel-amber" /></div>
          <h1 className="font-pixel text-[14px] font-bold">Selamat Datang di Dunia QuestLearn</h1>
          <p className="text-pixel-cream/50 text-sm mt-1">Sebelum masuk, kustomisasi dulu karakter RPG kamu!</p>
        </div>
        <PlayerCustomizer onSave={handleSave} />
        <div className="mt-4 text-center text-xs text-pixel-cream/50">
          <p><Lightbulb size={14} className="inline-block mr-1" />Kamu bisa ganti nickname & avatar kapan aja di halaman ini</p>
          <p>Progress tetap kesimpan di local, bisa lanjut kapan pun</p>
        </div>
      </div>
    </div>
  )
}
