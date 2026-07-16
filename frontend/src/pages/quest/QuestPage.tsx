import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SubmitQuestRequest } from '../../types/soal.types'
import { QuestCard } from '../../components/quest/QuestCard'
import { Button } from '../../components/common/Button'
import { progressService } from '../../services/progress.service'
import { mockLevels } from '../../services/mockData'
import { useToastContext } from '../../context/ToastContext'
import { useQuestionPool } from '../../hooks/useQuestionPool'
import { useAuth } from '../../hooks/useAuth'
import {
  Zap,
  Heart,
  ChevronLeft,
  RefreshCw,
  Trophy,
  ShieldAlert,
} from 'lucide-react'

const WORLD_NAMES: Record<number, string> = {
  1: 'BAHASA INGGRIS',
  2: 'MATEMATIKA DASAR',
  3: 'LOGIKA & UMUM',
}

const WORLD_HUD_CLASS: Record<number, string> = {
  1: 'hud-world-village',
  2: 'hud-world-desert',
  3: 'hud-world-forest',
}

export const QuestPage: React.FC = () => {
  const { levelId } = useParams()
  const id = Number(levelId)
  const level = mockLevels.find((l) => l.id === id)
  const duniaId = level?.duniaId || 1
  const { user } = useAuth()
  const {
    questions: soal,
    loading,
    answeredCount,
    markAnswered,
    forceNewBatch,
    reload,
  } = useQuestionPool(duniaId, id)

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const toast = useToastContext()

  const handleSubmit = async () => {
    if (Object.keys(answers).length < soal.length) {
      toast.warning('Jawab semua soal dulu!')
      return
    }
    setSubmitting(true)
    const payload: SubmitQuestRequest = {
      levelId: id,
      jawaban: Object.entries(answers).map(([soalId, jawabanUser]) => ({
        soalId: Number(soalId),
        jawabanUser,
      })),
    }
    try {
      const res = await progressService.submitQuest(payload)
      const data = res.data.data
      setResult(data)
      setShowResult(true)
      markAnswered(soal.map((s) => s.id), data.isLulus)
      const msg =
        res.data.message ||
        (data.isLulus
          ? 'LEVEL LULUS! Level selanjutnya kebuka!'
          : `Skor ${data.skor}% — harus 70% buat lanjut!`)
      if (data.isLulus) toast.success(msg)
      else toast.warning(msg)
    } catch {
      let benar = 0
      soal.forEach((s) => {
        if (answers[s.id] === s.jawabanBenar) benar++
      })
      const total = soal.length
      const skor = Math.round((benar / total) * 100)
      const isLulus = skor >= 70
      const xp = benar * 10 + (isLulus ? (level?.xpReward || 50) : 0)
      setResult({ skor, jawabanBenar: benar, totalSoal: total, isLulus, xpDidapat: xp })
      setShowResult(true)
      markAnswered(soal.map((s) => s.id), isLulus)
      toast.success(
        isLulus
          ? `LULUS ${skor}% +${xp} XP! Level selanjutnya kebuka!`
          : `Skor ${skor}% — butuh 70%!`
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleNextLevel = () => {
    const sameDuniaLevels = mockLevels
      .filter((l) => l.duniaId === duniaId)
      .sort((a, b) => a.urutan - b.urutan)
    const currentIdx = sameDuniaLevels.findIndex((l) => l.id === id)
    const next = sameDuniaLevels[currentIdx + 1]
    if (next) {
      if (result?.isLulus) navigate(`/rpg/dunia/${duniaId}`)
      else toast.warning('Selesaikan dulu level ini dengan 70%!')
    } else {
      navigate(`/rpg/dunia/${duniaId}`)
    }
  }

  if (loading) {
    return (
      <div className="starfield min-h-screen flex items-center justify-center">
        <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">
          MEMUAT QUEST...
        </div>
      </div>
    )
  }

  const progress = (Object.keys(answers).length / soal.length) * 100
  const worldName = WORLD_NAMES[duniaId] || 'DUNIA'
  const hudClass = WORLD_HUD_CLASS[duniaId] || 'hud-world-village'
  const lives = 3

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Quest HUD — Sticky at top */}
      <div className="quest-hud -mx-4 px-4 mb-6">
        <div className="quest-hud-inner">
          <div className="flex items-center gap-3">
            <Link
              to={`/rpg/dunia/${duniaId}`}
              className="font-pixel text-[7px] px-2 py-1 bg-pixel-panel-light border border-hud-border text-pixel-cream/50 hover:text-pixel-cream transition inline-flex items-center gap-1"
            >
              <ChevronLeft size={10} /> KEMBALI
            </Link>
            <span className={`hud-item ${hudClass}`}>{worldName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hud-item hud-xp">
              <Zap size={10} />
              <span>{user?.totalXp || 0}</span>
            </div>
            <div className="hud-item hud-lives">
              <Heart size={10} />
              <span>{lives}</span>
            </div>
            <div className="hud-item hud-level">
              <span>Lv</span>
              <span>{level?.urutan || id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level info header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-[10px] text-pixel-cream">{level?.nama || `Level ${id}`}</h1>
            <p className="font-vt text-sm text-pixel-cream/40 mt-1">
              {Object.keys(answers).length}/{soal.length} terjawab &bull; {answeredCount} soal
              pernah dijawab
            </p>
          </div>
          <div className="text-right">
            <div className="pixel-progress w-32">
              <div
                className="pixel-progress-fill bg-pixel-amber"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-pixel text-[6px] text-pixel-cream/30 mt-1">
              BUTUH 70% UNTUK LANJUT
            </p>
          </div>
        </div>
      </div>

      {/* Auto-update info */}
      <div className="pixel-panel-light p-4 mb-6 flex gap-3">
        <RefreshCw size={18} className="text-pixel-amber shrink-0 mt-0.5" />
        <div>
          <p className="font-pixel text-[8px] text-pixel-amber">SOAL AUTO-UPDATE!</p>
          <p className="font-vt text-base text-pixel-cream/50 mt-1">
            {duniaId === 1 && 'Soal vocabulary & grammar random. Harus 70% untuk lanjut!'}
            {duniaId === 2 && 'Soal hitungan random. Jawab benar buka level berikutnya!'}
            {duniaId === 3 && 'Teka-teki logika murni! Soal ganti otomatis.'}
          </p>
        </div>
      </div>

      {!showResult ? (
        <>
          <div className="space-y-5">
            {soal.map((s, idx) => (
              <QuestCard
                key={s.id}
                soal={s}
                index={idx}
                selected={answers[s.id]}
                onSelect={(val) => setAnswers((prev) => ({ ...prev, [s.id]: val }))}
              />
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleSubmit}
              isLoading={submitting}
              className="min-w-[280px]"
            >
              KUMPULKAN JAWABAN
            </Button>
            <button
              onClick={forceNewBatch}
              className="font-vt text-sm text-pixel-cream/30 hover:text-pixel-cream underline inline-flex items-center gap-1"
            >
              <RefreshCw size={12} /> Mau soal baru? Generate ulang
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Result card */}
          <div
            className={`pixel-panel p-8 text-center border-2 ${
              result.isLulus ? 'border-pixel-green' : 'border-pixel-coral'
            }`}
          >
            <div className="mb-3">
              {result.isLulus ? (
                <Trophy size={48} className="text-pixel-amber mx-auto" />
              ) : (
                <ShieldAlert size={48} className="text-pixel-coral mx-auto" />
              )}
            </div>
            <h2 className="font-pixel text-[14px] text-pixel-cream">
              {result.isLulus ? 'LEVEL LULUS!' : 'BELUM 70% — COBA LAGI!'}
            </h2>
            <p className="font-vt text-xl text-pixel-cream/50 mt-2">
              Skor:{' '}
              <span className="text-pixel-cream text-2xl">{result.skor}%</span> (
              {result.jawabanBenar}/{result.totalSoal} benar)
            </p>
            <div className="mt-3 inline-flex px-4 py-1.5 bg-pixel-amber/20 border-2 border-pixel-amber text-pixel-amber font-pixel text-[9px]">
              +{result.xpDidapat} XP
            </div>
            {!result.isLulus && (
              <p className="font-vt text-lg text-pixel-cream/40 mt-3">
                Butuh 70% untuk buka level selanjutnya.
              </p>
            )}
            {result.isLulus && (
              <p className="font-vt text-lg text-pixel-green/70 mt-3">
                Level selanjutnya sudah kebuka!
              </p>
            )}
          </div>

          {/* Review questions */}
          <div className="space-y-5">
            {soal.map((s, idx) => (
              <QuestCard
                key={s.id}
                soal={s}
                index={idx}
                selected={answers[s.id]}
                showResult
                onSelect={() => {}}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setShowResult(false)
                setAnswers({})
                forceNewBatch()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              SOAL BARU
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowResult(false)
                setAnswers({})
                reload()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              ULANGI SOAL SAMA
            </Button>
            {result.isLulus ? (
              <Button onClick={handleNextLevel}>LANJUT LEVEL BERIKUTNYA</Button>
            ) : (
              <Button disabled>TERKUNCI (BUTUH 70%)</Button>
            )}
            <Button variant="secondary" onClick={() => navigate(`/rpg/dunia/${duniaId}`)}>
              KEMBALI
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
