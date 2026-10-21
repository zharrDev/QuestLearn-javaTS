import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import TypingArena from '../../components/typing/TypingArena'
import type { TypingStartResponse, DifficultyLevel, SubmitTypingRequest } from '../../types/typing.types'
import { typingService } from '../../services/typing.service'

interface LocationState {
  session: TypingStartResponse
  difficulty: DifficultyLevel
  durationSec: 30 | 60 | 300
}

export default function TypingArenaPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  if (!state?.session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-pixel">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">Session tidak valid. Silakan pilih level lagi.</p>
          <button
            onClick={() => navigate('/typing')}
            className="px-6 py-2 bg-green-600 rounded hover:bg-green-500"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  const handleSessionEnd = async (result: {
    skor: number
    wpm: number
    akurasi: number
    comboTerpanjang: number
    totalMusuhKalah: number
    totalMusuhLolos: number
    waktuMillis: number
  }) => {
    try {
      const res = await typingService.submitSession({
        duniaId: state.session.duniaId,
        level: state.difficulty,
        ...result,
      })
      navigate('/typing/result', { state: { result: res } })
    } catch {
      // If submission fails, still show result with local data
      navigate('/typing/result', {
        state: {
          result: {
            id: 0,
            duniaId: state.session.duniaId,
            duniaNama: state.session.duniaNama,
            level: state.difficulty,
            ...result,
            xpDidapat: result.skor,
            waktuMulai: new Date().toISOString(),
            waktuSelesai: new Date().toISOString(),
          },
        },
      })
    }
  }

  return (
    <TypingArena
      words={state.session.words}
      difficulty={state.difficulty}
      duniaId={state.session.duniaId}
      duniaNama={state.session.duniaNama}
      duniaSlug={state.session.duniaSlug}
      durationSec={state.durationSec}
      onSessionEnd={handleSessionEnd}
    />
  )
}
