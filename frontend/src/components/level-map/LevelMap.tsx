import React from 'react'
import { Link } from 'react-router-dom'
import { Level } from '../../types/level.types'
import { Lock, Star, Crown } from 'lucide-react'
export const LevelMap: React.FC<{ levels: Level[] }> = ({ levels }) => {
  return (
    <div className="relative py-8">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[3px] bg-[#2A3444] -translate-x-1/2">
        <div className="absolute inset-0 bg-gradient-to-b from-pixel-amber/20 via-pixel-green/20 to-pixel-coral/20"/>
      </div>
      <div className="space-y-8">
        {levels.map((level, idx) => {
          const isLeft = idx % 2 === 0
          const locked = level.status === 'LOCKED'
          const completed = level.status === 'COMPLETED'
          const isOpen = level.status === 'OPEN'
          return (
            <div key={level.id} className={`relative flex ${isLeft ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
              <div className={`relative w-full max-w-[380px] ${locked ? 'opacity-40' : ''} transition-all`}>
                <div className={`pixel-panel p-5 transition-all ${
                  completed ? 'border-pixel-green/60' :
                  isOpen ? 'border-pixel-amber animate-glow-amber' :
                  'border-[#2A3444]'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 flex items-center justify-center text-xl border-2 ${
                      completed ? 'bg-pixel-green/20 border-pixel-green text-pixel-green' :
                      isOpen ? 'bg-pixel-amber/20 border-pixel-amber text-pixel-amber' :
                      'bg-[#1E2A38] border-[#2A3444] text-pixel-cream/30'
                    }`}>
                      {locked ? <Lock size={14} /> : completed ? <span className="font-pixel text-[8px]">✓</span> : level.isBossLevel ? <Crown size={20} /> : <Star size={20} />}
                    </div>
                    {level.isBossLevel && <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-coral/20 text-pixel-coral border border-pixel-coral/30">BOSS</span>}
                    {completed && <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-green/20 text-pixel-green border border-pixel-green/30">CLEAR</span>}
                  </div>
                  <h3 className="font-pixel text-[11px] text-pixel-cream leading-relaxed">{level.nama}</h3>
                  <p className="font-vt text-lg text-pixel-cream/60 mt-1 line-clamp-2">{level.deskripsi}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-pixel text-[7px] px-2 py-1 bg-[#1E2A38] border border-[#2A3444] text-pixel-cream/60">{level.totalSoal} SOAL</span>
                    <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-amber/15 border border-pixel-amber/20 text-pixel-amber">+{level.xpReward} XP</span>
                  </div>
                  {!locked ? (
                    <Link to={`/quest/${level.id}`} className={`mt-4 w-full pixel-btn text-center justify-center ${
                      completed ? 'pixel-btn-success' : 'pixel-btn-primary'
                    }`}>{completed ? 'ULANGI' : 'MULAI QUEST'}</Link>
                  ) : (
                    <div className="mt-4 w-full pixel-btn pixel-btn-ghost text-center justify-center opacity-40 cursor-not-allowed">TERKUNCI</div>
                  )}
                </div>
                <div className={`hidden md:block absolute top-1/2 w-4 h-4 border-[3px] border-pixel-bg -translate-y-1/2 ${
                  isLeft ? '-right-[11px]' : '-left-[11px]'
                } ${
                  completed ? 'bg-pixel-green border-pixel-green' :
                  isOpen ? 'bg-pixel-amber border-pixel-amber' :
                  'bg-[#2A3444] border-[#2A3444]'
                }`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
