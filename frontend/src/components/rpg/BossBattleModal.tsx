import React, { useState } from 'react'
import { BossData, RPGItem } from '../../types/rpg.types'
import { Button } from '../common/Button'
import { questionGenerator } from '../../services/questionGenerator'
import { Soal } from '../../types/soal.types'
import { Trophy, Skull, Gift } from 'lucide-react'

interface Props {
  boss: BossData
  onClose: () => void
  onWin: (xp: number, coin: number, item?: RPGItem) => void
  playerName: string
}

export const BossBattleModal: React.FC<Props> = ({ boss, onClose, onWin, playerName }) => {
  const [bossHp, setBossHp] = useState(boss.hp)
  const [playerHp, setPlayerHp] = useState(100)
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(5)
  const [currentSoal, setCurrentSoal] = useState<Soal>(() => questionGenerator.generateForDunia(boss.id, 6))
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [log, setLog] = useState<string[]>([`${boss.name} muncul! Siap bertarung?`])
  const [finished, setFinished] = useState<'win' | 'lose' | null>(null)

  const addLog = (msg: string) => setLog(prev => [...prev.slice(-4), msg])

  const handleAttack = () => {
    if (!selected) return
    const isCorrect = selected === currentSoal.jawabanBenar
    setResult(isCorrect)

    if (isCorrect) {
      const damage = 20 + Math.floor(Math.random() * 15)
      const newBossHp = Math.max(0, bossHp - damage)
      setBossHp(newBossHp)
      addLog(`[V] Benar! ${playerName} serang ${boss.name} -${damage} HP!`)
      if (newBossHp <= 0) {
        setFinished('win')
        addLog(`[MENANG] ${boss.name} kalah!`)
        setTimeout(() => onWin(boss.rewardXp, boss.rewardCoin, boss.rewardItem), 2000)
        return
      }
    } else {
      const damage = 15 + Math.floor(Math.random() * 10)
      const newPlayerHp = Math.max(0, playerHp - damage)
      setPlayerHp(newPlayerHp)
      addLog(`[X] Salah! ${boss.name} serang balik -${damage} HP! Benar: ${currentSoal.jawabanBenar}`)
      if (newPlayerHp <= 0) {
        setFinished('lose')
        addLog(`[KALAH] Kamu kalah...`)
        return
      }
    }

    if (round >= maxRounds && bossHp > 0) {
      if (bossHp < 50) {
        setFinished('win')
        addLog(`Waktu habis tapi ${boss.name} sekarat! Menang tipis!`)
        setTimeout(() => onWin(boss.rewardXp, boss.rewardCoin, boss.rewardItem), 1500)
      } else {
        setFinished('lose')
        addLog(`Waktu habis! ${boss.name} masih kuat...`)
      }
      return
    }

    setTimeout(() => {
      setRound(r => r + 1)
      setCurrentSoal(questionGenerator.generateForDunia(boss.id, 6))
      setSelected(null)
      setResult(null)
    }, 2000)
  }

  const themeColor = boss.theme === 'english' ? '#B5533C' : boss.theme === 'math' ? '#D9A24B' : '#6FCF6F'

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="pixel-panel p-0 w-full max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: themeColor }}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center" style={{ background: `${themeColor}30` }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-pixel-dark border-2 flex items-center justify-center text-3xl animate-pixel-pulse" style={{ borderColor: themeColor }}>{boss.emoji}</div>
            <div>
              <h2 className="font-pixel text-[10px] text-pixel-cream">BOSS: {boss.name}</h2>
              <p className="font-vt text-sm text-pixel-cream/50">{boss.description} &bull; Round {round}/{maxRounds}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-pixel-dark border border-[#2A3444] flex items-center justify-center font-pixel text-[8px] text-pixel-cream/50">✕</button>
        </div>

        {/* HP Bars */}
        <div className="p-3 bg-pixel-dark border-b-2 border-[#2A3444] grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between font-pixel text-[6px] text-pixel-cream/60 mb-1"><span>{playerName}</span><span>{playerHp}/100 HP</span></div>
            <div className="pixel-progress"><div className="pixel-progress-fill bg-pixel-green" style={{ width: `${playerHp}%` }} /></div>
          </div>
          <div>
            <div className="flex justify-between font-pixel text-[6px] text-pixel-cream/60 mb-1"><span>{boss.name}</span><span>{bossHp}/{boss.maxHp} HP</span></div>
            <div className="pixel-progress"><div className="pixel-progress-fill bg-pixel-coral" style={{ width: `${(bossHp / boss.maxHp) * 100}%` }} /></div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="px-4 py-2 bg-pixel-navy border-b border-[#2A3444] font-vt text-sm h-[60px] overflow-y-auto">
          {log.map((l, i) => <div key={i} className="text-pixel-cream/60">{`> ${l}`}</div>)}
        </div>

        {finished ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            {finished === 'win' ? (
              <>
                <div className="text-6xl mb-3"><Trophy size={64} className="inline-block text-pixel-amber" /></div>
                <h3 className="font-pixel text-[14px] text-pixel-amber">KAMU MENANG!</h3>
                <p className="font-vt text-lg text-pixel-cream/60 mt-2">+{boss.rewardXp} XP, +{boss.rewardCoin} Coin!</p>
                {boss.rewardItem && <p className="font-vt text-base text-pixel-cream/50 mt-2"><Gift size={16} className="inline-block mr-1" />{boss.rewardItem.emoji} {boss.rewardItem.name}</p>}
                <div className="mt-4 font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-3"><Skull size={64} className="inline-block text-pixel-coral" /></div>
                <h3 className="font-pixel text-[14px] text-pixel-coral">KALAH...</h3>
                <p className="font-vt text-lg text-pixel-cream/50 mt-2">{boss.name} terlalu kuat! Coba lagi!</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={onClose}>KABUR</Button>
                  <Button size="sm" onClick={() => { setPlayerHp(100); setBossHp(boss.maxHp); setRound(1); setFinished(null); setLog([`${boss.name} muncul lagi!`]); setCurrentSoal(questionGenerator.generateForDunia(boss.id, 6)); setSelected(null); setResult(null) }}>COBA LAGI</Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="bg-pixel-amber/10 border-2 border-pixel-amber/20 p-2 text-center mb-4">
              <p className="font-pixel text-[7px] text-pixel-amber">ROUND {round}/{maxRounds}</p>
            </div>
            <h4 className="font-vt text-2xl text-pixel-cream leading-relaxed">{currentSoal.pertanyaan}</h4>
            <div className="mt-4 space-y-2">
              {[
                { k: 'A', t: currentSoal.opsiA },
                { k: 'B', t: currentSoal.opsiB },
                { k: 'C', t: currentSoal.opsiC },
                { k: 'D', t: currentSoal.opsiD },
              ].map(opt => (
                <button key={opt.k} onClick={() => result === null && setSelected(opt.k)}
                  className={`w-full text-left px-4 py-2.5 border-2 flex items-center gap-2 font-vt text-lg transition
                    ${selected === opt.k ? 'border-pixel-amber bg-pixel-amber/10 text-pixel-cream' : 'border-[#2A3444] bg-pixel-dark/50 text-pixel-cream/70'}
                    ${result !== null && opt.k === currentSoal.jawabanBenar ? 'border-pixel-green bg-pixel-green/10 text-pixel-green' : ''}
                    ${result === false && selected === opt.k ? 'border-pixel-coral bg-pixel-coral/10 text-pixel-coral' : ''}`}>
                  <span className={`w-7 h-7 flex items-center justify-center font-pixel text-[8px] border-2 ${
                    selected === opt.k ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' :
                    'bg-pixel-dark border-[#2A3444] text-pixel-cream/40'
                  }`}>{opt.k}</span>
                  <span className="flex-1">{opt.t}</span>
                  {result !== null && opt.k === currentSoal.jawabanBenar && <span className="font-pixel text-[8px] text-pixel-green">✓</span>}
                </button>
              ))}
            </div>
            {result === null ? (
              <Button className="w-full mt-5" disabled={!selected} onClick={handleAttack}>SERANG {boss.name}!</Button>
            ) : (
              <div className={`mt-5 p-3 text-center border-2 ${result ? 'bg-pixel-green/10 border-pixel-green/30' : 'bg-pixel-coral/10 border-pixel-coral/30'}`}>
                <p className={`font-pixel text-[8px] ${result ? 'text-pixel-green' : 'text-pixel-coral'}`}>{result ? '[V] BENAR! SERANGAN BERHASIL!' : '[X] SALAH! BOSS SERANG BALIK!'}</p>
                <p className="font-vt text-sm text-pixel-cream/60 mt-1">{currentSoal.pembahasan}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
