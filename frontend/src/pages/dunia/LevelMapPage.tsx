import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Level } from '../../types/level.types'
import { levelService } from '../../services/level.service'
import { mockLevels, mockDunia } from '../../services/mockData'
import { useAuth } from '../../hooks/useAuth'
import {
  Lock,
  CheckCircle2,
  Crown,
  Star,
  Zap,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'

const WORLD_BACKGROUNDS: Record<number, string> = {
  1: '/assets/backgrounds/bg-english-village.png',
  2: '/assets/backgrounds/bg-math-desert.png',
  3: '/assets/backgrounds/bg-logic-forest.png',
}

const WORLD_STYLES: Record<
  number,
  { accent: string; nodeClass: string; hudClass: string }
> = {
  1: {
    accent: '#B5533C',
    nodeClass: 'node-village',
    hudClass: 'hud-world-village',
  },
  2: {
    accent: '#D9A24B',
    nodeClass: 'node-desert',
    hudClass: 'hud-world-desert',
  },
  3: {
    accent: '#2A5E42',
    nodeClass: 'node-forest',
    hudClass: 'hud-world-forest',
  },
}

const WORLD_LABELS: Record<number, string> = {
  1: 'BAHASA INGGRIS',
  2: 'MATEMATIKA DASAR',
  3: 'LOGIKA & UMUM',
}

const WORLD_ICONS: Record<number, React.ReactNode> = {
  1: <BookOpen size={24} />,
  2: <Sparkles size={24} />,
  3: <Star size={24} />,
}

const LevelNode: React.FC<{
  level: Level
  isLeft: boolean
  worldStyle: (typeof WORLD_STYLES)[1]
  duniaId: number
}> = ({ level, isLeft, worldStyle, duniaId }) => {
  const locked = level.status === 'LOCKED'
  const completed = level.status === 'COMPLETED'
  const isOpen = level.status === 'OPEN'

  return (
    <div
      className={`relative flex ${
        isLeft ? 'md:justify-start' : 'md:justify-end'
      } justify-center`}
    >
      <div
        className={`relative w-full max-w-[380px] ${
          locked ? 'level-node-locked' : ''
        }`}
      >
        <div
          className={`level-node ${
            completed
              ? 'level-node-completed'
              : isOpen
              ? 'level-node-open'
              : 'level-node-locked'
          } ${worldStyle.nodeClass}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 ${
                completed
                  ? 'bg-pixel-green/20 border-pixel-green text-pixel-green'
                  : isOpen
                  ? 'bg-pixel-amber/20 border-pixel-amber text-pixel-amber'
                  : 'bg-[#1E2A38] border-[#2A3444] text-pixel-cream/30'
              }`}
            >
              {locked ? (
                <Lock size={16} />
              ) : completed ? (
                <CheckCircle2 size={16} />
              ) : level.isBossLevel ? (
                <Crown size={18} />
              ) : (
                <Star size={18} />
              )}
            </div>

            <div className="flex gap-1.5">
              {level.isBossLevel && (
                <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-coral/20 text-pixel-coral border border-pixel-coral/30">
                  BOSS
                </span>
              )}
              {completed && (
                <span className="font-pixel text-[7px] px-2 py-1 bg-pixel-green/20 text-pixel-green border border-pixel-green/30">
                  CLEAR
                </span>
              )}
            </div>
          </div>

          <h3 className="font-pixel text-[11px] text-pixel-cream leading-relaxed">
            {level.nama}
          </h3>
          <p className="font-vt text-lg text-pixel-cream/60 mt-1 line-clamp-2">
            {level.deskripsi}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <span className="font-pixel text-[7px] px-2 py-1 bg-[#1E2A38] border border-[#2A3444] text-pixel-cream/60">
              {level.totalSoal} SOAL
            </span>
            <span
              className="font-pixel text-[7px] px-2 py-1 border"
              style={{
                backgroundColor: `${
                  WORLD_STYLES[duniaId]?.accent || '#E8A93B'
                }15`,
                borderColor: `${
                  WORLD_STYLES[duniaId]?.accent || '#E8A93B'
                }30`,
                color: WORLD_STYLES[duniaId]?.accent || '#E8A93B',
              }}
            >
              +{level.xpReward} XP
            </span>
          </div>

          {!locked ? (
            <Link
              to={`/quest/${level.id}`}
              className={`mt-4 w-full pixel-btn text-center justify-center ${
                completed ? 'pixel-btn-success' : 'pixel-btn-primary'
              }`}
            >
              {completed ? 'ULANGI' : 'MULAI QUEST'}
            </Link>
          ) : (
            <div className="mt-4 w-full pixel-btn pixel-btn-ghost text-center justify-center opacity-40 cursor-not-allowed">
              TERKUNCI
            </div>
          )}
        </div>

        <div
          className={`hidden md:block absolute top-1/2 w-4 h-4 border-[3px] border-pixel-bg -translate-y-1/2 ${
            isLeft ? '-right-[11px]' : '-left-[11px]'
          } ${
            completed
              ? 'bg-pixel-green border-pixel-green'
              : isOpen
              ? 'bg-pixel-amber border-pixel-amber'
              : 'bg-[#2A3444] border-[#2A3444]'
          }`}
        />
      </div>
    </div>
  )
}

export const LevelMapPage: React.FC = () => {
  const { id } = useParams()
  const duniaId = Number(id)
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const dunia = mockDunia.find((d) => d.id === duniaId)
  const worldStyle = WORLD_STYLES[duniaId] || WORLD_STYLES[1]
  const { user } = useAuth()

  useEffect(() => {
    levelService
      .getByDunia(duniaId)
      .then((res) => {
        const data = res.data.data
        if (Array.isArray(data)) setLevels(data)
        else setLevels(mockLevels.filter((l) => l.duniaId === duniaId))
      })
      .catch(() => setLevels(mockLevels.filter((l) => l.duniaId === duniaId)))
      .finally(() => setLoading(false))
  }, [duniaId])

  if (loading) {
    return (
      <div className="starfield min-h-screen flex items-center justify-center">
        <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">
          MEMUAT PETA LEVEL...
        </div>
      </div>
    )
  }

  const sortedLevels = [...levels].sort((a, b) => a.urutan - b.urutan)
  const completedCount = sortedLevels.filter(
    (l) => l.status === 'COMPLETED'
  ).length
  const totalXp = sortedLevels.reduce((acc, l) => acc + (l.xpReward || 0), 0)

  return (
    <div
      className="level-map-bg"
      style={{ backgroundImage: `url(${WORLD_BACKGROUNDS[duniaId]})` }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        <Link
          to="/worldmap"
          className="font-pixel text-[8px] text-pixel-cream/40 hover:text-pixel-cream transition inline-flex items-center gap-1"
        >
          <ChevronLeft size={12} /> KEMBALI KE PETA DUNIA
        </Link>

        {/* Quest HUD */}
        <div className="quest-hud mt-4 -mx-4 px-4">
          <div className="quest-hud-inner">
            <div className="flex items-center gap-3">
              <Link
                to="/worldmap"
                className="font-pixel text-[7px] px-2 py-1 bg-pixel-panel-light border border-hud-border text-pixel-cream/50 hover:text-pixel-cream transition inline-flex items-center gap-1"
              >
                <ChevronLeft size={10} /> PETA
              </Link>
              <span className={`hud-item ${worldStyle.hudClass}`}>
                {WORLD_LABELS[duniaId] || 'DUNIA'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hud-item hud-xp">
                <Zap size={10} />
                <span>{user?.totalXp || totalXp}</span>
              </div>
              <div className="hud-item hud-level">
                <span>Lv</span>
                <span>
                  {completedCount}/{sortedLevels.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* World header */}
        <div className="mt-8 flex items-start gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center border-2 bg-pixel-panel text-pixel-cream/60"
            style={{ borderColor: worldStyle.accent }}
          >
            {WORLD_ICONS[duniaId] || <BookOpen size={24} />}
          </div>
          <div>
            <h1 className="font-pixel text-[14px] text-pixel-cream leading-[2] text-shadow-pixel">
              {dunia?.nama || `Dunia ${duniaId}`}
            </h1>
            <p className="font-vt text-xl text-pixel-cream/50 max-w-[600px]">
              {dunia?.deskripsi}
            </p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="font-pixel text-[7px] px-2.5 py-1 bg-pixel-green/15 text-pixel-green border border-pixel-green/30 inline-flex items-center gap-1">
                <CheckCircle2 size={10} /> {completedCount}/{sortedLevels.length} CLEAR
              </span>
              <span
                className="font-pixel text-[7px] px-2.5 py-1 border inline-flex items-center gap-1"
                style={{
                  backgroundColor: `${worldStyle.accent}15`,
                  borderColor: `${worldStyle.accent}30`,
                  color: worldStyle.accent,
                }}
              >
                <Zap size={10} /> {totalXp} XP TOTAL
              </span>
            </div>
          </div>
        </div>

        {/* Level map */}
        <div className="relative py-8">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[3px] bg-[#2A3444] -translate-x-1/2">
            <div className="absolute inset-0 bg-gradient-to-b from-pixel-green/30 via-pixel-amber/30 to-pixel-cream/10" />
          </div>

          <div className="space-y-8">
            {sortedLevels.map((level, idx) => (
              <LevelNode
                key={level.id}
                level={level}
                isLeft={idx % 2 === 0}
                worldStyle={worldStyle}
                duniaId={duniaId}
              />
            ))}
          </div>
        </div>

        {/* Mastery tip */}
        <div className="mt-8 pixel-panel-light p-5 flex gap-3">
          <Lightbulb size={20} className="text-pixel-amber shrink-0 mt-0.5" />
          <div>
            <p className="font-pixel text-[8px] text-pixel-cream">
              SISTEM MASTERY
            </p>
            <p className="font-vt text-lg text-pixel-cream/50 mt-1">
              Kamu harus dapat minimal 70% untuk lulus dan membuka level
              berikutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
