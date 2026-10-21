import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Globe2, Keyboard, Check, Swords, Target, Zap } from 'lucide-react'
import { typingService } from '../../services/typing.service'
import { duniaService } from '../../services/dunia.service'
import type { Dunia } from '../../types/dunia.types'
import type { TypingStartResponse, DifficultyLevel } from '../../types/typing.types'
import { DURATION_OPTIONS } from '../../config/game.config'
import { WORLD_DEFS, WORLD_BY_SLUG, fallbackWords, type WorldDef } from '../../config/worlds'
import { useUiLang, uiText, type UiLang } from '../../config/i18n'

type DurationOption = 30 | 60 | 300

interface WorldOption {
  id: number
  def: WorldDef
}

const difficultyCopy: Record<
  DifficultyLevel,
  { key: 'easy' | 'medium' | 'hard'; descKey: 'easyDesc' | 'mediumDesc' | 'hardDesc'; color: string }
> = {
  EASY: { key: 'easy', descKey: 'easyDesc', color: '#6FCF6F' },
  MEDIUM: { key: 'medium', descKey: 'mediumDesc', color: '#E8A93B' },
  HARD: { key: 'hard', descKey: 'hardDesc', color: '#E37B6B' },
}

function fallbackOptions(): WorldOption[] {
  // Same order as the backend seed (English first) so the default selection is
  // stable in offline and online modes.
  return WORLD_DEFS.map((def, index) => ({ id: index + 1, def }))
}

export default function TypingSelectPage() {
  const [lang, setLang] = useUiLang()
  const t = uiText(lang)
  const [options, setOptions] = useState<WorldOption[]>(fallbackOptions)
  const [selected, setSelected] = useState<WorldOption | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('EASY')
  const [durationSec, setDurationSec] = useState<DurationOption>(60)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    duniaService
      .getAllForUser()
      .then((res) => {
        const data: Dunia[] = res.data?.data || res.data || []
        if (!Array.isArray(data) || data.length === 0) return
        const mapped = data
          .map((d) => {
            const def = WORLD_BY_SLUG[d.slug]
            return def && d.isActive !== false ? { id: d.id, def } : null
          })
          .filter((o): o is WorldOption => o !== null)
        if (mapped.length > 0) {
          setOptions(mapped)
          // The first render uses the offline catalog, whose numeric ids may not
          // match the database. Re-select by slug so the highlighted world and
          // the world that actually starts always agree.
          setSelected((prev) => {
            if (!prev) return mapped[0]
            return mapped.find((o) => o.def.slug === prev.def.slug) || mapped[0]
          })
        }
      })
      .catch(() => {
        // Offline / demo mode: the catalog and word banks still work.
        setOptions(fallbackOptions())
      })
      .finally(() => setLoading(false))
  }, [])

  // Keep a selection even if the API payload arrives after the first render.
  useEffect(() => {
    if (!selected && options.length > 0) setSelected(options[0])
  }, [options, selected])

  const selectedWorld = selected?.def
  const worldHint = useMemo(
    () => (selectedWorld ? selectedWorld.description : t.pickWorldFirst),
    [selectedWorld, t.pickWorldFirst],
  )

  const handleStart = async () => {
    if (!selected || starting) return
    setStarting(true)
    try {
      const data = await typingService.startSession(selected.id, difficulty)
      const session: TypingStartResponse = {
        ...data,
        duniaSlug: data.duniaSlug || selected.def.slug,
        duniaNama: data.duniaNama || selected.def.nativeName,
        duniaId: data.duniaId || selected.id,
      }
      navigate('/typing/arena', { state: { session, difficulty, durationSec } })
    } catch {
      const words = fallbackWords(selected.def, difficulty)
      const session: TypingStartResponse = {
        sessionId: Date.now(),
        words,
        totalWords: words.length,
        level: difficulty,
        duniaNama: selected.def.nativeName,
        duniaSlug: selected.def.slug,
        duniaId: selected.id,
      }
      navigate('/typing/arena', { state: { session, difficulty, durationSec } })
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-52px)] bg-pixel-bg text-pixel-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 font-pixel text-[8px] text-pixel-cream/50 hover:text-pixel-cream transition"
          >
            <ArrowLeft size={12} /> {t.back}
          </Link>
          <div className="flex items-center gap-1 bg-pixel-panel border-2 border-[#2A3444] p-1">
            {(['en', 'id'] as UiLang[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 font-pixel text-[7px] transition ${
                  lang === code ? 'bg-pixel-amber text-pixel-navy' : 'text-pixel-cream/50 hover:text-pixel-cream'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-400/10 border-2 border-emerald-400/25 font-pixel text-[7px] text-emerald-300 mb-5">
            <Globe2 size={12} /> 6 LANGUAGES · WORLDWIDE
          </div>
          <h1 className="font-pixel text-[22px] sm:text-[34px] text-pixel-cream text-shadow-pixel flex items-center justify-center gap-3">
            <Swords size={28} className="text-emerald-400" /> {t.selectTitle}
          </h1>
          <p className="font-vt text-xl text-pixel-cream/50 mt-3 max-w-2xl mx-auto">{t.selectSubtitle}</p>
        </div>

        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-pixel text-[10px] text-pixel-amber">{t.chooseWorld}</h2>
            <span className="font-vt text-base text-pixel-cream/30 hidden sm:block">{t.chooseWorldHint}</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {options.map((option) => {
              const def = option.def
              const active = selected?.id === option.id
              return (
                <button
                  key={`${option.id}-${def.slug}`}
                  type="button"
                  onClick={() => setSelected(option)}
                  aria-pressed={active}
                  className={`relative text-left p-4 sm:p-5 border-2 transition-all overflow-hidden ${
                    active
                      ? 'bg-pixel-panel border-pixel-amber shadow-[4px_4px_0_#000] -translate-y-0.5'
                      : 'bg-pixel-panel/60 border-[#2A3444] hover:border-[#4A5A6A] hover:bg-pixel-panel'
                  }`}
                >
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: def.color }} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl sm:text-4xl leading-none">{def.flag}</span>
                    {active && (
                      <span className="w-5 h-5 bg-pixel-amber text-pixel-navy flex items-center justify-center border border-[#B8842A]">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h3 className="font-pixel text-[10px] sm:text-[12px] text-pixel-cream mt-3">{def.nativeName}</h3>
                  <p className="font-vt text-sm sm:text-base text-pixel-cream/45 mt-1 leading-snug line-clamp-2">
                    {def.description}
                  </p>
                  <div className="font-pixel text-[6px] text-pixel-cream/25 mt-3 flex items-center gap-1.5">
                    <span style={{ color: def.color }}>{def.name.toUpperCase()}</span>
                    <span>·</span>
                    <span>3 LEVELS</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4 mb-6">
          <section className="pixel-panel p-5">
            <h2 className="font-pixel text-[10px] text-pixel-cream mb-4 text-center">{t.difficulty}</h2>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(difficultyCopy) as DifficultyLevel[]).map((key) => {
                const copy = difficultyCopy[key]
                const active = difficulty === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficulty(key)}
                    aria-pressed={active}
                    className={`px-2 py-3 border-2 transition-all ${
                      active ? 'border-white bg-white/10' : 'border-[#2A3444] bg-black/20 hover:border-[#4A5A6A]'
                    }`}
                  >
                    <div className="font-pixel text-[8px] flex items-center justify-center gap-1" style={{ color: copy.color }}>
                      {key === 'EASY' && <Target size={11} />}
                      {key === 'MEDIUM' && <Zap size={11} />}
                      {key === 'HARD' && <Zap size={11} />}
                      {t[copy.key]}
                    </div>
                    <div className="font-vt text-sm text-pixel-cream/35 mt-1 leading-tight">{t[copy.descKey]}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="pixel-panel p-5">
            <h2 className="font-pixel text-[10px] text-pixel-cream mb-4 text-center">{t.duration}</h2>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => {
                const active = durationSec === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDurationSec(option.value)}
                    aria-pressed={active}
                    className={`px-2 py-4 border-2 transition-all font-pixel text-[8px] ${
                      active
                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                        : 'border-[#2A3444] bg-black/20 text-pixel-cream/60 hover:border-[#4A5A6A]'
                    }`}
                  >
                    {lang === 'id' ? option.labelId : option.labelEn}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <div className="pixel-panel p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="text-4xl">{selectedWorld?.flag || '🌐'}</div>
            <div>
              <div className="font-pixel text-[10px] text-pixel-cream">
                {selectedWorld?.nativeName || t.chooseWorld}
              </div>
              <p className="font-vt text-base text-pixel-cream/45 max-w-sm">{worldHint}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={!selected || starting || loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-[#0B1410] border-2 border-emerald-300 shadow-[4px_4px_0_#000] font-pixel text-[10px] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center justify-center gap-2"
          >
            <Keyboard size={15} />
            {starting ? t.loading : selected ? t.start : t.pickWorldFirst}
          </button>
        </div>

        <p className="text-center font-vt text-base text-pixel-cream/25 mt-6">{t.howToPlayBody}</p>
      </div>
    </div>
  )
}
