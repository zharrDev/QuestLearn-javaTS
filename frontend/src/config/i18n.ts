import { useCallback, useEffect, useState } from 'react'

/**
 * Minimal UI localization for the typing game. Gameplay content already uses
 * the selected world's language; this dictionary makes the surrounding interface
 * readable for international players too.
 */
export type UiLang = 'en' | 'id'

const STORAGE_KEY = 'questlearn.uiLang'

const COPY = {
  en: {
    selectTitle: 'TYPING STRIKE',
    selectSubtitle: 'Pick a language world, type fast, slash the letter crates.',
    chooseWorld: 'CHOOSE A LANGUAGE',
    chooseWorldHint: 'Words appear in the language you pick.',
    difficulty: 'DIFFICULTY',
    duration: 'SESSION LENGTH',
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
    easyDesc: 'Short words, relaxed pace',
    mediumDesc: 'Phrases, steady pace',
    hardDesc: 'Full sentences, fast pace',
    seconds: 'sec',
    minutes: 'min',
    start: 'START RUN',
    loading: 'LOADING...',
    pickWorldFirst: 'SELECT A WORLD TO START',
    howToPlay: 'HOW TO PLAY',
    howToPlayBody:
      'Type the glowing letter to slash its crate. Finish the whole word before the crates reach your hero. Spaces and punctuation count!',
    back: 'BACK',
    score: 'SCORE',
    combo: 'COMBO',
    kills: 'WORDS',
    lives: 'LIVES',
    miss: 'MISSED',
    wave: 'WAVE',
    wpm: 'WPM',
    acc: 'ACC',
    typeHint: 'Type the highlighted letter!',
    lockedWord: 'TARGET',
    readyTitle: 'READY TO STRIKE?',
    readyBody: 'Crates will march in from the right. Type each word before they reach you.',
    startRun: 'PRESS ENTER / TAP START',
    paused: 'PAUSED',
    pausedBody: 'Take your time. The clock is frozen.',
    resume: 'RESUME',
    restart: 'RESTART',
    gameOver: 'GAME OVER',
    timesUp: "TIME'S UP",
    saving: 'Saving your run...',
    resultTitle: 'RUN COMPLETE',
    xpEarned: 'XP EARNED',
    longestCombo: 'BEST COMBO',
    cratesSlain: 'WORDS CLEARED',
    cratesMissed: 'WORDS MISSED',
    playAgain: 'PLAY AGAIN',
    dashboard: 'DASHBOARD',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND OFF',
    pause: 'PAUSE',
    tapKeyboard: 'TAP HERE TO TYPE',
  },
  id: {
    selectTitle: 'TYPING STRIKE',
    selectSubtitle: 'Pilih dunia bahasa, ketik cepat, tebas kotak hurufnya.',
    chooseWorld: 'PILIH BAHASA',
    chooseWorldHint: 'Kata yang muncul mengikuti bahasa yang kamu pilih.',
    difficulty: 'TINGKAT KESULITAN',
    duration: 'DURASI SESI',
    easy: 'MUDAH',
    medium: 'SEDANG',
    hard: 'SULIT',
    easyDesc: 'Kata pendek, santai',
    mediumDesc: 'Frasa, tempo sedang',
    hardDesc: 'Kalimat penuh, cepat',
    seconds: 'detik',
    minutes: 'menit',
    start: 'MULAI',
    loading: 'MEMUAT...',
    pickWorldFirst: 'PILIH DUNIA UNTUK MULAI',
    howToPlay: 'CARA BERMAIN',
    howToPlayBody:
      'Ketik huruf yang menyala untuk menebas kotaknya. Selesaikan kata sebelum kotak mencapai karaktermu. Spasi dan tanda baca ikut dihitung!',
    back: 'KEMBALI',
    score: 'SKOR',
    combo: 'COMBO',
    kills: 'KATA',
    lives: 'NYAWA',
    miss: 'LEWAT',
    wave: 'WAVE',
    wpm: 'WPM',
    acc: 'AKR',
    typeHint: 'Ketik huruf yang menyala!',
    lockedWord: 'TARGET',
    readyTitle: 'SIAP BERTARUNG?',
    readyBody: 'Kotak huruf datang dari kanan. Ketik tiap kata sebelum mereka sampai.',
    startRun: 'TEKAN ENTER / TAP UNTUK MULAI',
    paused: 'JEDA',
    pausedBody: 'Santai dulu. Waktunya berhenti.',
    resume: 'LANJUT',
    restart: 'ULANGI',
    gameOver: 'GAME OVER',
    timesUp: 'WAKTU HABIS',
    saving: 'Menyimpan hasil...',
    resultTitle: 'SESI SELESAI',
    xpEarned: 'XP DIDAPAT',
    longestCombo: 'COMBO TERBAIK',
    cratesSlain: 'KATA SELESAI',
    cratesMissed: 'KATA LOLOS',
    playAgain: 'MAIN LAGI',
    dashboard: 'DASHBOARD',
    soundOn: 'SUARA AKTIF',
    soundOff: 'SUARA MATI',
    pause: 'JEDA',
    tapKeyboard: 'TAP UNTUK MENGETIK',
  },
} as const

export type Copy = Record<keyof typeof COPY.en, string>

export function detectUiLang(): UiLang {
  if (typeof window === 'undefined') return 'en'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'id') return saved
  return navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en'
}

export function uiText(lang: UiLang): Copy {
  return COPY[lang]
}

export function setUiLang(lang: UiLang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Storage can be disabled; the UI still works for this session.
  }
}

export function useUiLang(): [UiLang, (lang: UiLang) => void] {
  const [lang, setLang] = useState<UiLang>(() => detectUiLang())
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'id')) {
        setLang(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const change = useCallback((next: UiLang) => {
    setUiLang(next)
    setLang(next)
  }, [])
  return [lang, change]
}
