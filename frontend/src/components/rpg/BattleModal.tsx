import React, { useState } from 'react'
import { RPGEnemy } from '../../types/rpg.types'
import { Button } from '../common/Button'
import { mockSoal } from '../../services/mockData'
import { Trophy, Sparkles } from 'lucide-react'

interface Props {
  enemy: RPGEnemy
  onClose: () => void
  onWin: (xp: number) => void
  theme: 'english' | 'math' | 'logic' | 'hub'
}

export const BattleModal: React.FC<Props> = ({ enemy, onClose, onWin, theme }) => {
  const [soal] = useState(() => {
    const filtered = mockSoal.filter(s => {
      if (theme === 'english') return s.levelId <= 6
      if (theme === 'math') return true
      return true
    })
    return filtered[Math.floor(Math.random() * filtered.length)] || mockSoal[0]
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<boolean | null>(null)

  const handleAttack = () => {
    if (!selected) return
    const isCorrect = selected === soal.jawabanBenar
    setResult(isCorrect)
    if (isCorrect) {
      setTimeout(() => onWin(enemy.xpReward), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="pixel-panel p-0 w-full max-w-[500px] overflow-hidden" style={{ borderColor: '#E37B6B' }}>
        <div className="bg-pixel-coral/20 border-b-2 border-pixel-coral/30 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pixel-dark border-2 border-pixel-coral flex items-center justify-center text-2xl shadow-pixel-sm">{enemy.emoji}</div>
            <div>
              <h3 className="font-pixel text-[9px] text-pixel-cream">VS {enemy.name}</h3>
              <p className="font-vt text-sm text-pixel-cream/40">HP: {enemy.hp}/{enemy.maxHp} &bull; +{enemy.xpReward} XP</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-pixel-dark border border-[#2A3444] flex items-center justify-center font-pixel text-[8px] text-pixel-cream/50">✕</button>
        </div>

        <div className="p-5">
          <div className="bg-pixel-coral/10 border-2 border-pixel-coral/20 p-3 mb-4 text-center">
            <p className="font-pixel text-[7px] text-pixel-coral">BATTLE QUIZ — JAWAB BENAR UNTUK SERANG!</p>
          </div>

          <h4 className="font-vt text-2xl text-pixel-cream leading-relaxed">{soal.pertanyaan}</h4>

          <div className="mt-4 space-y-2">
            {[
              { k: 'A', t: soal.opsiA },
              { k: 'B', t: soal.opsiB },
              { k: 'C', t: soal.opsiC },
              { k: 'D', t: soal.opsiD },
            ].map(opt => (
              <button key={opt.k} onClick={() => result === null && setSelected(opt.k)}
                className={`w-full text-left px-4 py-2.5 border-2 flex items-center gap-2 font-vt text-lg transition
                  ${selected === opt.k ? 'border-pixel-amber bg-pixel-amber/10 text-pixel-cream' : 'border-[#2A3444] bg-pixel-dark/50 text-pixel-cream/70'}
                  ${result !== null && opt.k === soal.jawabanBenar ? 'border-pixel-green bg-pixel-green/10 text-pixel-green' : ''}
                  ${result === false && selected === opt.k ? 'border-pixel-coral bg-pixel-coral/10 text-pixel-coral' : ''}`}>
                <span className={`w-7 h-7 flex items-center justify-center font-pixel text-[8px] border-2 ${
                  selected === opt.k ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' :
                  'bg-pixel-dark border-[#2A3444] text-pixel-cream/40'
                }`}>{opt.k}</span>
                <span className="flex-1">{opt.t}</span>
                {result !== null && opt.k === soal.jawabanBenar && <span className="font-pixel text-[8px] text-pixel-green">✓</span>}
              </button>
            ))}
          </div>

          {result === null ? (
            <Button className="w-full mt-5" disabled={!selected} onClick={handleAttack}>SERANG!</Button>
          ) : result === true ? (
            <div className="mt-5 bg-pixel-green/10 border-2 border-pixel-green/30 p-4 text-center">
              <div className="text-3xl"><Trophy size={36} className="inline-block text-pixel-amber" /></div>
              <p className="font-pixel text-[9px] text-pixel-green">SERANGAN BERHASIL!</p>
              <p className="font-vt text-base text-pixel-cream/70 mt-2">{enemy.name} kalah! +{enemy.xpReward} XP</p>
              <p className="font-vt text-sm text-pixel-cream/40 mt-1">{soal.pembahasan}</p>
            </div>
          ) : (
            <div className="mt-5 bg-pixel-coral/10 border-2 border-pixel-coral/30 p-4 text-center">
              <div className="text-3xl"><Sparkles size={36} className="inline-block text-pixel-coral" /></div>
              <p className="font-pixel text-[9px] text-pixel-coral">MELESET!</p>
              <p className="font-vt text-base text-pixel-cream/70 mt-2">Jawaban benar: {soal.jawabanBenar}</p>
              <div className="flex gap-2 justify-center mt-3">
                <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setResult(null) }}>COBA LAGI</Button>
                <Button variant="ghost" size="sm" onClick={onClose}>KABUR</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
