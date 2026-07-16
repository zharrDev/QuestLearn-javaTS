import React, { useState, useEffect } from 'react'
import { AVATARS, PlayerData } from '../../types/rpg.types'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

interface Props {
  onSave: (data: PlayerData) => void
  initialData?: PlayerData
}

export const PlayerCustomizer: React.FC<Props> = ({ onSave, initialData }) => {
  const [nickname, setNickname] = useState(initialData?.nickname || '')
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar || AVATARS[0].emoji)
  const [selectedColor, setSelectedColor] = useState(initialData?.color || AVATARS[0].color)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('rpg_player')
    if (saved && !initialData) {
      try {
        const parsed = JSON.parse(saved)
        setNickname(parsed.nickname || '')
        setSelectedAvatar(parsed.avatar || AVATARS[0].emoji)
        setSelectedColor(parsed.color || AVATARS[0].color)
      } catch {}
    }
  }, [initialData])

  const handleSave = () => {
    if (!nickname.trim()) { setError('Nickname wajib diisi!'); return }
    if (nickname.length < 2) { setError('Minimal 2 karakter'); return }
    if (nickname.length > 12) { setError('Maksimal 12 karakter'); return }
    const data: PlayerData = { nickname: nickname.trim(), avatar: selectedAvatar, color: selectedColor }
    localStorage.setItem('rpg_player', JSON.stringify(data))
    localStorage.setItem('rpg_nickname', data.nickname)
    localStorage.setItem('rpg_avatar', data.avatar)
    onSave(data)
  }

  return (
    <div className="pixel-panel p-6 max-w-[480px] mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto border-3 shadow-pixel-lg flex items-center justify-center text-4xl" style={{ background: selectedColor, borderColor: '#F4E9D8' }}>
          {selectedAvatar}
        </div>
        <h2 className="font-pixel text-[12px] text-pixel-cream mt-4">KUSTOMISASI KARAKTER</h2>
        <p className="font-vt text-lg text-pixel-cream/50 mt-2">Pilih avatar & nickname untuk petualanganmu!</p>
      </div>

      <div className="space-y-5">
        <Input label="Nickname" placeholder="Masukkan nickname..." value={nickname} onChange={e=>{setNickname(e.target.value); setError('')}} error={error} maxLength={12} hint={`${nickname.length}/12 karakter`} />

        <div>
          <label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">PILIH AVATAR</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {AVATARS.map(av => (
              <button key={av.id} onClick={() => { setSelectedAvatar(av.emoji); setSelectedColor(av.color) }}
                className={`p-3 border-2 flex flex-col items-center gap-1 transition-all ${
                  selectedAvatar === av.emoji ? 'border-pixel-amber bg-pixel-amber/10 shadow-pixel-sm' : 'border-[#2A3444] bg-pixel-dark hover:border-pixel-cream/30'
                }`}>
                <span className="text-2xl">{av.emoji}</span>
                <span className="font-pixel text-[6px] text-pixel-cream/60">{av.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-pixel text-[8px] text-pixel-cream tracking-wider uppercase">WARNA KARAKTER</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['#D97757','#2C5F5D','#E8A93B','#7A9B76','#C97064','#3A322C','#8A7F74','#9333EA'].map(c => (
              <button key={c} onClick={() => setSelectedColor(c)}
                className={`w-8 h-8 border-2 transition-all ${selectedColor === c ? 'border-pixel-cream scale-125 shadow-pixel-sm' : 'border-[#2A3444]'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="pixel-panel-light p-3">
          <p className="font-pixel text-[7px] text-pixel-cream/60">PREVIEW:</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 flex items-center justify-center text-sm border border-pixel-cream/20" style={{ background: selectedColor }}>{selectedAvatar}</div>
            <span className="font-pixel text-[8px] text-pixel-cream">{nickname || 'NICKNAME'}</span>
            <span className="font-vt text-sm text-pixel-cream/30">si Penjelajah</span>
          </div>
        </div>

        <Button className="w-full" onClick={handleSave}>SIMPAN & MASUK DUNIA</Button>
      </div>
    </div>
  )
}
