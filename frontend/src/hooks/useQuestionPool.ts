import { useState, useEffect, useCallback } from 'react'
import { Soal } from '../types/soal.types'
import { questionGenerator } from '../services/questionGenerator'
import { soalService } from '../services/soal.service'
import { mockSoal } from '../services/mockData'

const ANSWERED_KEY = 'rpg_answered_soal'
const XP_KEY = 'rpg_xp'

function getAnsweredIds(): Set<number> {
  try {
    const raw = localStorage.getItem(ANSWERED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch { return new Set() }
}

function saveAnsweredIds(ids: Set<number>) {
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(Array.from(ids)))
}

export const useQuestionPool = (duniaId: number, levelId: number) => {
  const [questions, setQuestions] = useState<Soal[]>([])
  const [loading, setLoading] = useState(true)
  const [answeredCount, setAnsweredCount] = useState(0)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const answeredIds = getAnsweredIds()
    setAnsweredCount(answeredIds.size)

    try {
      // Try backend first
      const res = await soalService.getByLevel(levelId)
      let backendSoal: Soal[] = []
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        backendSoal = res.data.data
      } else {
        backendSoal = mockSoal.filter(s => s.levelId === levelId)
        if (backendSoal.length === 0) backendSoal = mockSoal.slice(0, 8)
      }

      // Filter out already answered (for auto-update feature)
      const freshFromBackend = backendSoal.filter(s => !answeredIds.has(s.id))

      // If not enough fresh, generate new ones
      const needed = 8 - freshFromBackend.length
      let generated: Soal[] = []
      if (needed > 0) {
        generated = questionGenerator.generateBatch(duniaId, levelId, needed, answeredIds)
      }

      const finalPool = [...freshFromBackend, ...generated].slice(0, 8)
      
      // If still less than 8 (all answered), generate all new
      if (finalPool.length < 8) {
        const more = questionGenerator.generateBatch(duniaId, levelId, 8 - finalPool.length, answeredIds)
        finalPool.push(...more)
      }

      // If backend had 0 fresh and we want auto-update, prioritize generated
      // To ensure soal baru terus, mix 50% generated after first completion
      const hasCompletedBefore = localStorage.getItem(`rpg_completed_${levelId}`)
      if (hasCompletedBefore) {
        // After first completion, show 6 new + 2 old for review
        const newOnes = questionGenerator.generateBatch(duniaId, levelId, 6, answeredIds)
        const oldOnes = freshFromBackend.slice(0, 2)
        setQuestions([...newOnes, ...oldOnes])
      } else {
        setQuestions(finalPool.slice(0, 8))
      }
    } catch {
      // Fallback: generate all
      const gen = questionGenerator.generateBatch(duniaId, levelId, 8, answeredIds)
      setQuestions(gen)
    } finally {
      setLoading(false)
    }
  }, [duniaId, levelId])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  const markAnswered = useCallback((soalIds: number[], isLulus: boolean) => {
    const answeredIds = getAnsweredIds()
    soalIds.forEach(id => answeredIds.add(id))
    saveAnsweredIds(answeredIds)
    setAnsweredCount(answeredIds.size)
    
    if (isLulus) {
      localStorage.setItem(`rpg_completed_${levelId}`, 'true')
      // Bonus: generate preview of next new questions for this level
      // Store count
      const current = parseInt(localStorage.getItem(XP_KEY) || '0')
      localStorage.setItem(XP_KEY, current.toString())
    }
  }, [levelId])

  const forceNewBatch = useCallback(() => {
    const answeredIds = getAnsweredIds()
    const newBatch = questionGenerator.generateBatch(duniaId, levelId, 8, answeredIds)
    setQuestions(newBatch)
  }, [duniaId, levelId])

  const resetPool = useCallback(() => {
    localStorage.removeItem(ANSWERED_KEY)
    localStorage.removeItem(`rpg_completed_${levelId}`)
    setAnsweredCount(0)
    loadQuestions()
  }, [loadQuestions, levelId])

  return {
    questions,
    loading,
    answeredCount,
    totalAnswered: getAnsweredIds().size,
    markAnswered,
    forceNewBatch,
    resetPool,
    reload: loadQuestions,
  }
}
