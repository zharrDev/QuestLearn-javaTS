import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { typingService } from '../../services/typing.service'
import { duniaService } from '../../services/dunia.service'
import type { Dunia } from '../../types/dunia.types'
import type { TypingStartResponse, DifficultyLevel } from '../../types/typing.types'
import { Globe, Calculator, Brain, Swords, Target, Zap } from 'lucide-react'

const difficultyConfig: Record<DifficultyLevel, { label: string; desc: string; color: string }> = {
  EASY: { label: 'Easy', desc: '3-5 huruf, lambat', color: '#4ade80' },
  MEDIUM: { label: 'Medium', desc: '5-8 huruf, sedang', color: '#fbbf24' },
  HARD: { label: 'Hard', desc: 'Kalimat, cepat', color: '#ff4444' },
}

const duniaIcons: Record<number, React.ReactNode> = {
  1: <Globe size={40} className="text-village-terracotta" />,
  2: <Calculator size={40} className="text-desert-sand" />,
  3: <Brain size={40} className="text-forest-lantern" />,
}

const mockDunias: Dunia[] = [
  { id: 1, nama: "Bahasa Inggris", slug: "bahasa-inggris", deskripsi: "Kata & frasa bahasa Inggris", backgroundColor: "#D97757", urutan: 1, isActive: true, iconUrl: "globe" },
  { id: 2, nama: "Matematika Dasar", slug: "matematika-dasar", deskripsi: "Angka, simbol & persamaan", backgroundColor: "#2C5F5D", urutan: 2, isActive: true, iconUrl: "calculator" },
  { id: 3, nama: "Logika & Umum", slug: "logika-umum", deskripsi: "Teka-teki & istilah logika", backgroundColor: "#E8A93B", urutan: 3, isActive: true, iconUrl: "brain" },
]

export default function TypingSelectPage() {
  const [dunias, setDunias] = useState<Dunia[]>(mockDunias)
  const [selectedDunia, setSelectedDunia] = useState<Dunia | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('EASY')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    duniaService.getAllForUser().then(res => {
      const data = res.data?.data || res.data || []
      if (Array.isArray(data) && data.length > 0) {
        setDunias(data)
      }
    }).catch(() => {})
  }, [])

  const handleStart = async () => {
    if (!selectedDunia) return
    setLoading(true)
    try {
      const data = await typingService.startSession(selectedDunia.id, difficulty)
      navigate(`/typing/arena`, { state: { session: data, difficulty } })
    } catch {
      const mockWords = getMockWords(selectedDunia.id, difficulty)
      const mockSession: TypingStartResponse = {
        sessionId: Date.now(),
        words: mockWords,
        totalWords: mockWords.length,
        level: difficulty,
        duniaNama: selectedDunia.nama,
        duniaId: selectedDunia.id,
      }
      navigate(`/typing/arena`, { state: { session: mockSession, difficulty } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-pixel p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-green-400 mb-2 flex items-center justify-center gap-3">
            <Swords size={32} className="text-green-400" /> Typing Strike
          </h1>
          <p className="text-gray-400">Side-scroller 2D — ketik cepat, tebas kotak huruf!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {dunias.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDunia(d)}
              className={`p-6 rounded-lg border-2 text-center transition-all ${
                selectedDunia?.id === d.id
                  ? 'border-green-400 bg-green-900/30 scale-105'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="mb-3 flex justify-center">
                {duniaIcons[d.id] || <Globe size={40} />}
              </div>
              <div className="font-bold text-lg">{d.nama}</div>
              <div className="text-xs text-gray-400 mt-1">{d.deskripsi}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl mb-4 text-center">Pilih Tingkat Kesulitan</h2>
          <div className="flex gap-4 justify-center">
            {(Object.entries(difficultyConfig) as [DifficultyLevel, typeof difficultyConfig['EASY']][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  difficulty === key
                    ? 'border-white bg-gray-700 scale-105'
                    : 'border-gray-600 bg-gray-700/50 hover:border-gray-400'
                }`}
              >
                <div className="font-bold flex items-center gap-2 justify-center" style={{ color: cfg.color }}>
                  {key === 'EASY' && <Target size={14} />}
                  {key === 'MEDIUM' && <Zap size={14} />}
                  {key === 'HARD' && <Zap size={14} className="text-red-400" />}
                  {cfg.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">{cfg.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!selectedDunia || loading}
            className="px-10 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-xl font-bold transition-all flex items-center gap-2 mx-auto"
          >
            {loading ? 'Memuat...' : <><Swords size={20} /> Mulai Combat!</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function getMockWords(duniaId: number, difficulty: DifficultyLevel): string[] {
  const banks: Record<number, Record<DifficultyLevel, string[]>> = {
    1: {
      EASY: ['book', 'home', 'light', 'apple', 'water', 'house', 'table', 'chair', 'door', 'bird', 'fish', 'tree', 'star', 'moon', 'rain', 'snow', 'fire', 'wind', 'song', 'dance'],
      MEDIUM: ['sunrise', 'village life', 'green forest', 'blue ocean', 'bright star', 'happy day', 'big house', 'small cat', 'old tree', 'new book'],
      HARD: ['The quiet village woke up.', 'A gentle breeze blew through the trees.', 'She opened the old wooden door.', 'He walked along the dusty road.', 'The stars shone brightly above.'],
    },
    2: {
      EASY: ['zero', 'plus', 'minus', 'seven', 'twelve', 'twenty', 'fifty', 'hundred', 'count', 'math', 'sum', 'half', 'double', 'three', 'eight', 'nine', 'four', 'five', 'six', 'ten'],
      MEDIUM: ['y = mx + b', 'x + 5 = 12', '2x = 10', 'a + b = c', 'nine minus four', 'six times seven', 'twenty plus eight', 'three squared', 'square root', 'fifteen percent'],
      HARD: ['2x + 10 = 24, solve for x', 'x squared plus y squared equals z squared', 'the derivative of x squared is 2x', 'if x equals five then y equals ten', 'the square root of 144 is twelve'],
    },
    3: {
      EASY: ['maze', 'rune', 'owl', 'key', 'map', 'gate', 'code', 'hint', 'clue', 'path', 'door', 'lock', 'ring', 'gem', 'orb', 'seal', 'trap', 'logic', 'truth', 'solve'],
      MEDIUM: ['deduce the pattern', 'solve the riddle', 'find the answer', 'think carefully', 'follow the clues', 'unlock the gate', 'light the torch', 'cross the bridge', 'open the chest', 'read the map'],
      HARD: ['If A then B, not B, so not A.', 'All humans are mortal. Socrates is human.', 'Every effect has a cause.', 'I think therefore I am.', 'The map is not the territory.'],
    },
  }
  return (banks[duniaId]?.[difficulty]) || banks[1].EASY
}
