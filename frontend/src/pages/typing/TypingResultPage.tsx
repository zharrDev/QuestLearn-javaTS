import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { TypingSessionResponse } from '../../types/typing.types'

export default function TypingResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state as { result: TypingSessionResponse } | null
  const result = data?.result

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-pixel">
        <div className="text-center">
          <p className="text-red-400 mb-4">Tidak ada hasil.</p>
          <button onClick={() => navigate('/typing')} className="px-6 py-2 bg-green-600 rounded hover:bg-green-500">
            Kembali
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'WPM', value: result.wpm, unit: 'kata/menit', color: '#4ade80' },
    { label: 'Akurasi', value: `${result.akurasi}%`, unit: '', color: '#60a5fa' },
    { label: 'Skor', value: result.skor, unit: 'pts', color: '#fbbf24' },
    { label: 'Combo Terpanjang', value: result.comboTerpanjang, unit: 'x', color: '#ff4444' },
    { label: 'Musuh Kalah', value: result.totalMusuhKalah, unit: 'enemies', color: '#a78bfa' },
    { label: 'Musuh Lolos', value: result.totalMusuhLolos, unit: 'enemies', color: '#f472b6' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white font-pixel flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🏆</div>
            <h1 className="text-3xl text-green-400">Sesi Selesai!</h1>
            <p className="text-gray-400 text-sm mt-1">{result.duniaNama} - {result.level}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-gray-900/50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
                {card.unit && <div className="text-xs text-gray-500">{card.unit}</div>}
              </div>
            ))}
          </div>

          <div className="text-center mb-6 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <div className="text-sm text-gray-400">XP Didapat</div>
            <div className="text-3xl text-yellow-400 font-bold">+{result.xpDidapat} XP</div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/typing')}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-all"
            >
              🔄 Main Lagi
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
            >
              📊 Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
