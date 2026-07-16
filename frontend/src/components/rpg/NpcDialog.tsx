import React, { useState } from 'react'
import { RPGNpc } from '../../types/rpg.types'
import { Button } from '../common/Button'

interface Props {
  npc: RPGNpc
  onClose: () => void
}

export const NpcDialog: React.FC<Props> = ({ npc, onClose }) => {
  const [idx, setIdx] = useState(0)

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
      <div className="pixel-panel p-0 w-full max-w-[520px] overflow-hidden">
        <div className="bg-pixel-amber/20 border-b-2 border-pixel-amber/30 p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-pixel-dark border-2 border-pixel-amber flex items-center justify-center text-2xl shadow-pixel-sm">{npc.emoji}</div>
          <div className="flex-1">
            <h3 className="font-pixel text-[9px] text-pixel-cream">{npc.name}</h3>
            <p className="font-vt text-sm text-pixel-cream/40">{npc.role}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-pixel-dark border border-[#2A3444] flex items-center justify-center font-pixel text-[8px] text-pixel-cream/50 hover:text-pixel-cream">✕</button>
        </div>
        <div className="p-5">
          <div className="bg-pixel-dark border-2 border-[#2A3444] p-4 min-h-[80px]">
            <p className="font-vt text-xl text-pixel-cream leading-relaxed">"{npc.dialogs[idx]}"</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-pixel text-[7px] text-pixel-cream/30">{idx + 1}/{npc.dialogs.length}</span>
            <div className="flex gap-2">
              {idx < npc.dialogs.length - 1 ? (
                <Button size="sm" onClick={() => setIdx(idx + 1)}>LANJUT &rarr;</Button>
              ) : (
                <Button size="sm" onClick={onClose}>SIAP!</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
