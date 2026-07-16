
import React from 'react'
import { Soal } from '../../types/soal.types'
interface Props { soal: Soal; index: number; selected?: string; showResult?: boolean; onSelect: (val: string) => void }
export const QuestCard: React.FC<Props> = ({ soal, index, selected, showResult, onSelect }) => {
  const options = [{ key: 'A', text: soal.opsiA }, { key: 'B', text: soal.opsiB }, { key: 'C', text: soal.opsiC }, { key: 'D', text: soal.opsiD }].filter(o=>o.text)
  return (
    <div className="pixel-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 flex items-center justify-center border-2 border-pixel-green bg-pixel-green/20 font-pixel text-[9px] text-pixel-green">{index+1}</div>
        <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-panel-light border border-[#2A3444] text-pixel-cream/60">{soal.tingkatKesulitan}</span>
        <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-amber/15 text-pixel-amber border border-pixel-amber/30">+{soal.xpPoint} XP</span>
      </div>
      <h3 className="font-vt text-2xl text-pixel-cream leading-relaxed mb-5">{soal.pertanyaan}</h3>
      {soal.gambarUrl && <img src={soal.gambarUrl} alt="soal" className="w-full max-h-[200px] object-contain border-2 border-[#2A3444] mb-4" style={{imageRendering:'pixelated'}}/>}
      <div className="space-y-2.5">
        {options.map(opt => {
          const isSelected = selected === opt.key
          const isCorrect = soal.jawabanBenar === opt.key
          let cls = "w-full text-left px-4 py-3 border-2 flex items-center gap-3 transition font-vt text-lg"
          if (showResult) {
            if (isCorrect) cls += " bg-pixel-green/10 border-pixel-green text-pixel-green"
            else if (isSelected && !isCorrect) cls += " bg-pixel-coral/10 border-pixel-coral text-pixel-coral"
            else cls += " bg-pixel-dark/50 border-[#2A3444] text-pixel-cream/30"
          } else {
            cls += isSelected
              ? " bg-pixel-amber/10 border-pixel-amber text-pixel-cream"
              : " bg-pixel-dark/50 border-[#2A3444] text-pixel-cream/70 hover:border-pixel-cream/30"
          }
          return (
            <button key={opt.key} onClick={()=>!showResult && onSelect(opt.key)} className={cls}>
              <span className={`w-8 h-8 flex items-center justify-center font-pixel text-[9px] shrink-0 border-2 ${
                isSelected ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' :
                showResult && isCorrect ? 'bg-pixel-green text-pixel-navy border-pixel-green' :
                'bg-pixel-dark border-[#2A3444] text-pixel-cream/40'
              }`}>{opt.key}</span>
              <span className="flex-1">{opt.text}</span>
              {showResult && isCorrect && <span className="font-pixel text-[8px] text-pixel-green">✓</span>}
            </button>
          )
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 border-2 ${selected===soal.jawabanBenar ? 'bg-pixel-green/5 border-pixel-green/30' : 'bg-pixel-coral/5 border-pixel-coral/30'}`}>
          <p className={`font-pixel text-[8px] ${selected===soal.jawabanBenar ? 'text-pixel-green' : 'text-pixel-coral'}`}>
            {selected===soal.jawabanBenar ? '✓ JAWABAN BENAR!' : '✗ BELUM TEPAT'}
          </p>
          <p className="font-vt text-base text-pixel-cream/70 mt-2"><b className="text-pixel-cream">PEMBAHASAN:</b> {soal.pembahasan}</p>
        </div>
      )}
    </div>
  )
}
