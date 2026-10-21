import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy, Zap } from 'lucide-react'
import type { TypingSessionResponse } from '../../types/typing.types'
import { resolveWorld } from '../../config/worlds'
import { detectUiLang, uiText } from '../../config/i18n'

export default function TypingResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state as { result: TypingSessionResponse } | null
  const result = data?.result
  const lang = useMemo(() => detectUiLang(), [])
  const t = uiText(lang)
  const world = useMemo(
    () => resolveWorld({ name: result?.duniaNama, id: result?.duniaId }),
    [result?.duniaNama, result?.duniaId],
  )

  if (!result) {
    return (
      <div className="min-h-[calc(100dvh-52px)] bg-pixel-bg flex items-center justify-center p-4">
        <div className="pixel-panel p-8 text-center max-w-sm">
          <p className="font-pixel text-[10px] text-pixel-coral mb-4">{lang === 'id' ? 'Tidak ada hasil.' : 'No result found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/typing')}
            className="px-5 py-2.5 bg-pixel-amber text-pixel-navy border-2 border-[#B8842A] font-pixel text-[8px]"
          >
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: t.wpm, value: result.wpm, color: '#6FCF6F' },
    { label: t.acc, value: `${result.akurasi}%`, color: '#8FC1D9' },
    { label: t.score, value: result.skor.toLocaleString(), color: '#E8A93B' },
    { label: t.longestCombo, value: `${result.comboTerpanjang}x`, color: '#E37B6B' },
    { label: t.cratesSlain, value: result.totalMusuhKalah, color: '#B9A7E0' },
    { label: t.cratesMissed, value: result.totalMusuhLolos, color: '#E89FB0' },
  ]

  return (
    <div className="min-h-[calc(100dvh-52px)] bg-pixel-bg text-pixel-cream flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-xl">
        <div
          className="relative pixel-panel p-6 sm:p-8 overflow-hidden"
          style={{ borderColor: world.color }}
        >
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: world.color }} />
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{world.flag}</div>
            <div className="inline-flex items-center gap-2 font-pixel text-[7px] text-pixel-amber mb-3">
              <Trophy size={13} /> {t.resultTitle}
            </div>
            <h1 className="font-pixel text-[18px] sm:text-[22px] text-pixel-cream text-shadow-pixel">
              {world.nativeName}
            </h1>
            <p className="font-pixel text-[7px] text-pixel-cream/40 mt-2">
              {result.level} · {result.duniaNama}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            {stats.map((card) => (
              <div key={card.label} className="bg-pixel-dark/60 border-2 border-[#2A3444] p-3 text-center">
                <div className="font-pixel text-[6px] text-pixel-cream/35 mb-1.5">{card.label}</div>
                <div className="font-pixel text-[14px]" style={{ color: card.color }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-2 border-emerald-400/25 bg-emerald-400/10 px-4 py-3 mb-6">
            <div className="flex items-center gap-2 font-pixel text-[8px] text-emerald-300">
              <Zap size={14} /> {t.xpEarned}
            </div>
            <div className="font-pixel text-[18px] text-pixel-amber">+{result.xpDidapat}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/typing')}
              className="flex-1 py-3 bg-emerald-500 text-[#0B1410] border-2 border-emerald-300 shadow-[3px_3px_0_#000] font-pixel text-[9px] hover:bg-emerald-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center justify-center gap-2"
            >
              <RotateCcw size={13} /> {t.playAgain}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-pixel-panel border-2 border-[#2A3444] text-pixel-cream/70 font-pixel text-[9px] hover:text-pixel-cream hover:border-[#4A5A6A] inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={13} /> {t.dashboard}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
