import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { duniaService } from '../../services/dunia.service'
import { mockDunia } from '../../services/mockData'
import { Dunia } from '../../types/dunia.types'
import {
  Castle,
  Mountain,
  TreePine,
  MapPin,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react'

const PORTAL_CONFIG = [
  {
    id: 1,
    label: 'Bahasa Inggris',
    sublabel: 'Littlewood Village',
    ring: 'portal-village',
    gradient: 'portal-gradient-village',
    bgImage: 'public/assets/bg-english-village.png',
    route: '/dunia/1',
    icon: Castle,
    iconColor: '#D4795E',
  },
  {
    id: 2,
    label: 'Matematika Dasar',
    sublabel: 'Pyramid Run',
    ring: 'portal-desert',
    gradient: 'portal-gradient-desert',
    bgImage: 'public/assets/bg-math-desert.png',
    route: '/dunia/2',
    icon: Mountain,
    iconColor: '#D9A24B',
  },
  {
    id: 3,
    label: 'Logika & Umum',
    sublabel: 'Whispering Woods',
    ring: 'portal-forest',
    gradient: 'portal-gradient-forest',
    bgImage: 'public/assets/bg-logic-forest.png',
    route: '/dunia/3',
    icon: TreePine,
    iconColor: '#3D8B5F',
  },
]

const Starfield: React.FC = () => {
  const stars = useMemo(() => {
    const result: { x: number; y: number; size: string; delay: number; dur: number }[] = []
    for (let i = 0; i < 120; i++) {
      const sizeClass = Math.random() < 0.1 ? 'star-lg' : Math.random() < 0.3 ? 'star-md' : 'star-sm'
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: sizeClass,
        delay: Math.random() * 5,
        dur: 2 + Math.random() * 4,
      })
    }
    return result
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <div
          key={i}
          className={`star ${s.size}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animation: `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            opacity: 0.2 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

const Portal: React.FC<{
  config: typeof PORTAL_CONFIG[0]
  dunia: Dunia | undefined
}> = ({ config, dunia }) => {
  const [imgError, setImgError] = useState(false)
  const completed = dunia?.completedLevel || 0
  const total = dunia?.totalLevel || 6
  const hasProgress = completed > 0
  const allDone = completed >= total
  const Icon = config.icon

  return (
    <Link to={config.route} className="group flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={`portal-ring ${config.ring} ${
            hasProgress ? 'portal-completed' : ''
          } ${!hasProgress ? 'portal-dimmed' : ''}`}
        >
          {!imgError ? (
            <img
              src={config.bgImage}
              alt={config.label}
              className="portal-preview"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`portal-preview ${config.gradient}`} />
          )}
        </div>

        {/* Progress badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pixel-dark border-2 border-[#2A3444] px-2 py-0.5 z-10 flex items-center gap-1">
          {allDone ? (
            <CheckCircle2 size={10} className="text-pixel-green" />
          ) : hasProgress ? null : (
            <Lock size={8} className="text-pixel-cream/30" />
          )}
          <span className="font-pixel text-[7px] text-pixel-cream/60">
            {completed}/{total}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-1.5">
          <Icon size={14} style={{ color: config.iconColor }} />
          <h3 className="font-pixel text-[9px] text-pixel-cream group-hover:text-white transition-colors leading-relaxed">
            {config.label}
          </h3>
        </div>
        <p className="font-vt text-sm text-pixel-cream/40 mt-1">
          {config.sublabel}
        </p>
        {allDone && (
          <span className="inline-flex items-center gap-1 mt-1 font-pixel text-[6px] px-2 py-0.5 bg-pixel-green/20 text-pixel-green border border-pixel-green/30">
            <CheckCircle2 size={8} /> ALL CLEAR
          </span>
        )}
      </div>
    </Link>
  )
}

const WizardMarker: React.FC<{ position: number }> = ({ position }) => {
  const positions = [
    { left: '28%', top: '62%' },
    { left: '50%', top: '52%' },
    { left: '72%', top: '62%' },
  ]
  const pos = positions[position] || positions[0]

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
    >
      <div className="wizard-marker">
        <div className="speech-bubble flex items-center gap-1">
          <MapPin size={8} />
          MULAI DI SINI!
        </div>
      </div>
    </div>
  )
}

const DashedPaths: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none z-0"
    viewBox="0 0 800 500"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M 200 200 Q 350 120 500 180"
      fill="none"
      stroke="#2A3444"
      strokeWidth="2"
      strokeDasharray="8 6"
      opacity="0.6"
    />
    <path
      d="M 500 180 Q 550 280 620 220"
      fill="none"
      stroke="#2A3444"
      strokeWidth="2"
      strokeDasharray="8 6"
      opacity="0.6"
    />
    <circle cx="200" cy="200" r="3" fill="#E8A93B" opacity="0.5" />
    <circle cx="500" cy="180" r="3" fill="#E8A93B" opacity="0.3" />
    <circle cx="620" cy="220" r="3" fill="#E8A93B" opacity="0.3" />
  </svg>
)

export const WorldMapPage: React.FC = () => {
  const [duniaList, setDuniaList] = useState<Dunia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    duniaService
      .getAllForUser()
      .then((res) => {
        const data = res.data.data
        if (Array.isArray(data)) setDuniaList(data)
        else if (data?.content) setDuniaList(data.content)
        else setDuniaList(mockDunia)
      })
      .catch(() => setDuniaList(mockDunia))
      .finally(() => setLoading(false))
  }, [])

  const totalXp = duniaList.reduce((acc, d) => acc + ((d.completedLevel || 0) * 60), 0)
  const totalCompleted = duniaList.reduce((acc, d) => acc + (d.completedLevel || 0), 0)

  if (loading) {
    return (
      <div className="starfield min-h-screen flex items-center justify-center">
        <Starfield />
        <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse z-10">
          MEMUAT PETA DUNIA...
        </div>
      </div>
    )
  }

  return (
    <div className="starfield min-h-screen relative flex flex-col">
      <Starfield />

      {/* Title */}
      <div className="relative z-10 text-center pt-8 pb-4">
        <h1 className="font-pixel text-[12px] sm:text-[14px] text-pixel-cream text-shadow-pixel tracking-wider">
          QUESTLEARN
        </h1>
        <p className="font-pixel text-[8px] text-pixel-cream/40 mt-2 tracking-widest">
          PILIH DUNIAMU
        </p>
      </div>

      {/* Compact HUD */}
      <div className="relative z-10 flex justify-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 bg-pixel-amber/10 border-2 border-pixel-amber/25 px-3 py-1">
          <Sparkles size={10} className="text-pixel-amber/70" />
          <span className="font-pixel text-[7px] text-pixel-amber/70">XP</span>
          <span className="font-pixel text-[8px] text-pixel-amber">{totalXp}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-pixel-green/10 border-2 border-pixel-green/25 px-3 py-1">
          <CheckCircle2 size={10} className="text-pixel-green/70" />
          <span className="font-pixel text-[7px] text-pixel-green/70">LEVEL</span>
          <span className="font-pixel text-[8px] text-pixel-green">{totalCompleted}/18</span>
        </div>
      </div>

      {/* Portal Map Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="relative w-full max-w-[800px] aspect-[16/10]">
          <DashedPaths />
          <WizardMarker position={0} />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 place-items-center h-full">
            {PORTAL_CONFIG.map((cfg) => (
              <div key={cfg.id} className="flex flex-col items-center">
                <Portal
                  config={cfg}
                  dunia={duniaList.find((d) => d.id === cfg.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="relative z-10 text-center pb-6">
        <p className="font-vt text-base text-pixel-cream/25 flex items-center justify-center gap-1.5">
          <MapPin size={12} />
          Klik portal untuk memulai petualangan
        </p>
      </div>
    </div>
  )
}
