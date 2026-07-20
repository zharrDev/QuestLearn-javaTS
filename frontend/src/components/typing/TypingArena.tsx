import { useRef, useEffect, useState, useCallback } from 'react'
import type { EnemyState, DifficultyLevel } from '../../types/typing.types'

type PState = 'idle' | 'run' | 'jump' | 'slash'

interface ArenaProps {
  words: string[]
  difficulty: DifficultyLevel
  duniaId: number
  duniaNama: string
  onSessionEnd: (result: {
    skor: number; wpm: number; akurasi: number
    comboTerpanjang: number; totalMusuhKalah: number
    totalMusuhLolos: number; waktuMillis: number
  }) => void
}

function uid() { return Math.random().toString(36).substring(2, 9) }

const CFG = {
  EASY: { spawnInt: 2800, maxEn: 3, waveSz: 12, spd: 30 },
  MEDIUM: { spawnInt: 1800, maxEn: 5, waveSz: 18, spd: 50 },
  HARD: { spawnInt: 1000, maxEn: 8, waveSz: 25, spd: 75 },
}

const THEMES: Record<number, { bgFile: string; boxFile: string; sky: [string, string] }> = {
  1: { bgFile: '/assets/bg-english-village.png', boxFile: '/assets/crate-blank-32-removebg-preview.png', sky: ['#2a3a5a', '#4a6a8a'] },
  2: { bgFile: '/assets/bg-math-desert.png', boxFile: '/assets/sandstone-block-32-removebg-preview.png', sky: ['#5a3a1a', '#8a6a3a'] },
  3: { bgFile: '/assets/bg-logic-forest.png', boxFile: '/assets/mossy-crate-32-removebg-preview.png', sky: ['#1a2a1a', '#2a4a2a'] },
}

const ANIM = {
  idle: { pre: 'idle_', cnt: 4, fps: 5 },
  run: { pre: 'run_', cnt: 7, fps: 12 },
  jump: { pre: 'jump_', cnt: 2, fps: 6 },
  slash: { pre: 'sword_slash_attack_', cnt: 7, fps: 14 },
}

const loaded: Record<string, HTMLImageElement> = {}
function ld(src: string): Promise<void> {
  if (loaded[src]) return Promise.resolve()
  return new Promise(r => {
    const i = new Image()
    i.onload = () => { loaded[src] = i; r() }
    i.onerror = () => r()
    i.src = src
  })
}
function gi(src: string) { return loaded[src] || null }

const fCache: Record<string, HTMLImageElement[]> = {}
function gf(key: string): HTMLImageElement[] {
  if (fCache[key]) return fCache[key]
  const a = ANIM[key as keyof typeof ANIM]
  if (!a) return []
  const arr: HTMLImageElement[] = []
  for (let i = 1; i <= a.cnt; i++) {
    const n = i < 10 ? `0${i}` : `${i}`
    const f = gi(`/assets/${a.pre}${n}.png`)
    if (f) arr.push(f)
  }
  fCache[key] = arr
  return arr
}

function preloadAll() {
  const all: Promise<void>[] = []
  for (const [k, v] of Object.entries(ANIM))
    for (let i = 1; i <= v.cnt; i++)
      all.push(ld(`/assets/${v.pre}${i < 10 ? `0${i}` : i}.png`))
  for (const t of Object.values(THEMES)) { all.push(ld(t.bgFile)); all.push(ld(t.boxFile)) }
  return Promise.all(all)
}

interface G {
  en: EnemyState[]
  score: number; combo: number; maxCombo: number; kills: number; missed: number
  tKeys: number; cKeys: number
  over: boolean; state: PState; px: number; py: number; pvy: number
  gy: number; parts: PArt[]; slsh: SLsh[]
  t0: number; lastSpawn: number; wvCnt: number; wv: number
  shX: number; shT: number; wpm: number; acc: number
  animT: number; endT: number; stateT: number
  jumping: boolean; jumpY: number
  hp: number; maxHp: number
}
interface PArt { id: string; x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; sz: number }
interface SLsh { id: string; x: number; y: number; t0: number; life: number }

export default function TypingArena({ words, difficulty, duniaId, duniaNama, onSessionEnd }: ArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const gRef = useRef<G>(null!)
  const raf = useRef(0)
  const alive = useRef(true)
  const cbRef = useRef(onSessionEnd)
  cbRef.current = onSessionEnd
  const cfg = CFG[difficulty]

  const [hud, setHud] = useState({ score: 0, combo: 0, maxCombo: 0, kills: 0, wave: 1, wpm: 0, acc: 100, over: false, hp: 5, maxHp: 5 })

  useEffect(() => {
    alive.current = true
    preloadAll()
    const g: G = {
      en: [], score: 0, combo: 0, maxCombo: 0, kills: 0, missed: 0,
      tKeys: 0, cKeys: 0, over: false,       state: 'run',
      px: 0, py: 0, pvy: 0, gy: 0, parts: [], slsh: [],
      t0: Date.now(), lastSpawn: Date.now(), wvCnt: 0, wv: 1,
      shX: 0, shT: 0, wpm: 0, acc: 100, animT: 0, endT: 0,
      stateT: 0, jumping: false, jumpY: 0, hp: 5, maxHp: 5,
    }
    gRef.current = g
    return () => { alive.current = false; cancelAnimationFrame(raf.current) }
  }, [])

  function spawnEn(g: G): EnemyState {
    const word = words[Math.floor(Math.random() * words.length)]
    const cw = canvasRef.current?.width || 800
    const x = cw + 160 + Math.random() * 250

    const rx = Math.random()
    let y: number
    if (rx < 0.35) y = g.gy - 35 - Math.random() * 25
    else if (rx < 0.65) y = g.gy - 80 - Math.random() * 25
    else y = g.gy - 135 - Math.random() * 30

    const aliveEn = g.en.filter(e => e.alive)
    let attempts = 0
    while (attempts < 10) {
      let overlap = false
      for (const e of aliveEn) {
        const dy = Math.abs(e.position[1] - y)
        if (dy < 40) { overlap = true; break }
      }
      if (!overlap) break
      y = g.gy - 35 - Math.random() * 140
      attempts++
    }

    return {
      id: uid(), word, typedIndex: 0, hp: word.length, maxHp: word.length,
      position: [x, y, 0], targetPosition: [0, 0, 0],
      alive: true, speed: cfg.spd * (0.7 + Math.random() * 0.6),
      letterStatuses: word.split('').map(() => 'pending' as const),
    }
  }

  function addP(g: G, x: number, y: number, c: string, n = 6) {
    for (let i = 0; i < n; i++) g.parts.push({
      id: uid(), x, y, vx: (Math.random() - 0.5) * 200, vy: -Math.random() * 260 - 40,
      life: 0, maxLife: 0.3 + Math.random() * 0.3, color: c, sz: 3 + Math.random() * 4,
    })
  }

  function doSpawn(g: G) {
    if (g.over) return
    if (g.wvCnt >= cfg.waveSz) { g.wv++; g.wvCnt = 0 }
    if (g.en.filter(e => e.alive).length >= cfg.maxEn) return
    g.en.push(spawnEn(g))
    g.wvCnt++
  }

  const onKey = useCallback((e: KeyboardEvent) => {
    const g = gRef.current
    if (!g || g.over) return
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
    e.preventDefault()
    g.tKeys++
    const ch = e.key.toLowerCase()

    const aliveEn = g.en.filter(e => e.alive && e.typedIndex < e.word.length)
    const match = aliveEn.filter(e => e.word[e.typedIndex].toLowerCase() === ch)
    if (match.length > 0) {
      match.sort((a, b) => Math.abs(a.position[0] - g.px) - Math.abs(b.position[0] - g.px))
      const t = match[0]
      g.cKeys++
      g.combo++
      if (g.combo > g.maxCombo) g.maxCombo = g.combo

      const bx = t.position[0] - (t.word.length * 60) / 2 + t.typedIndex * 60
      const by = t.position[1]
      t.letterStatuses[t.typedIndex] = 'correct'
      g.slsh.push({ id: uid(), x: bx, y: by, t0: Date.now(), life: 200 })
      addP(g, bx, by, '#4ade80', 5)
      g.state = 'slash'
      g.stateT = Date.now()
      g.animT = 0

      if (t.position[1] < g.gy - 70 && !g.jumping) {
        g.jumping = true
        g.pvy = -620
        g.jumpY = t.position[1]
        g.state = 'jump'
      }

      if (t.typedIndex + 1 >= t.word.length) {
        const mult = difficulty === 'HARD' ? 3 : difficulty === 'MEDIUM' ? 2 : 1
        g.score += Math.round(t.word.length * 10 * mult * (1 + Math.floor(g.combo / 10) * 0.5))
        g.kills++
        t.alive = false; t.hp = 0
        addP(g, bx, by, '#fbbf24', 14)
      } else {
        t.typedIndex++
        t.hp--
      }
    } else {
      g.combo = 0
      g.shT = 4
    }
  }, [difficulty])

  useEffect(() => { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onKey])

  useEffect(() => {
    const iv = setInterval(() => {
      const g = gRef.current
      if (!g) return
      const el = Date.now() - g.t0; const min = el / 60000
      if (min > 0) g.wpm = Math.round((g.kills * 5) / min)
      g.acc = g.tKeys > 0 ? Math.round((g.cKeys / g.tKeys) * 100) : 100
      setHud({ score: g.score, combo: g.combo, maxCombo: g.maxCombo, kills: g.kills, wave: g.wv, wpm: g.wpm, acc: g.acc, over: g.over, hp: g.hp, maxHp: g.maxHp })
    }, 300)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const cv = canvasRef.current; const wr = wrapRef.current
    if (!cv || !wr) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const cvs: HTMLCanvasElement = cv; const wrap: HTMLDivElement = wr; const cctx: CanvasRenderingContext2D = ctx

    function resize() { const r = wrap.getBoundingClientRect(); cvs.width = r.width; cvs.height = r.height }
    resize()
    window.addEventListener('resize', resize)

    function drawBg(w: number, h: number, g: G) {
      const t = THEMES[duniaId]
      const gr = cctx.createLinearGradient(0, 0, 0, h)
      gr.addColorStop(0, t.sky[0]); gr.addColorStop(1, t.sky[1])
      cctx.fillStyle = gr; cctx.fillRect(0, 0, w, h)
      const b = gi(t.bgFile)
      if (b) {
        const sc = Math.max(w / b.width, h / b.height)
        cctx.drawImage(b, 0, 0, b.width, b.height,
          Math.round((w - b.width * sc) / 2), Math.round((h - b.height * sc) / 2),
          Math.ceil(b.width * sc), Math.ceil(b.height * sc))
      }
      g.gy = h * 0.78
    }

    function drawBoxes(g: G) {
      const box = gi(THEMES[duniaId].boxFile)
      for (const en of g.en) {
        if (!en.alive) continue
        const chars = en.word.split('')
        for (let i = 0; i < chars.length; i++) {
          if (i < en.typedIndex && en.letterStatuses[i] === 'correct') continue
          const gap = 60
          const ox = - (chars.length * gap) / 2 + i * gap
          const fx = en.position[0] + ox
          cctx.save()
          cctx.translate(fx, en.position[1])
          const sz = 36
          if (box) { cctx.drawImage(box, -sz / 2, -sz / 2, sz, sz) }
          else { cctx.fillStyle = '#5a4a3a'; cctx.fillRect(-sz / 2, -sz / 2, sz, sz); cctx.strokeStyle = '#3a2a1a'; cctx.lineWidth = 1; cctx.strokeRect(-sz / 2, -sz / 2, sz, sz) }
          const isTarget = i === en.typedIndex && en.letterStatuses[i] === 'pending'
          if (isTarget) { cctx.strokeStyle = '#ffff00'; cctx.lineWidth = 2.5; cctx.strokeRect(-sz / 2 - 2, -sz / 2 - 2, sz + 4, sz + 4) }
          cctx.fillStyle = '#fff'
          cctx.font = 'bold 18px monospace'
          cctx.textAlign = 'center'; cctx.textBaseline = 'middle'
          cctx.shadowColor = 'rgba(0,0,0,0.95)'; cctx.shadowBlur = 5
          cctx.fillText(chars[i] === ' ' ? '_' : chars[i], 0, 1)
          cctx.shadowBlur = 0
          cctx.restore()
        }
      }
    }

    function drawChar(g: G, w: number, h: number) {
      const baseY = g.gy
      const tx = w * 0.12

      if (g.jumping) {
        g.pvy += 620 / 60
        g.py += g.pvy / 60
        if (g.py >= baseY - 50) { g.py = baseY - 50; g.jumping = false; g.pvy = 0; if (g.state !== 'slash') g.state = 'run'; g.animT = 0 }
      } else {
        const dx = tx - g.px
        if (Math.abs(dx) > 1) g.px += Math.sign(dx) * Math.min(Math.abs(dx) * 0.08, 3)
        g.py = baseY - 50
      }
      g.animT += 0.04

      const bob = !g.jumping && g.state === 'run' ? Math.sin(g.animT * 14) * 2 : g.state === 'slash' ? Math.sin(g.animT * 16) : g.jumping ? 0 : Math.sin(g.animT * 1.5) * 0.4
      const tilt = g.state === 'run' ? Math.sin(g.animT * 14) * 0.06 : g.jumping ? -0.2 : g.state === 'slash' ? -0.15 : 0

      cctx.save()

      cctx.fillStyle = 'rgba(0,0,0,0.12)'
      cctx.beginPath()
      cctx.ellipse(g.px, baseY + 2, 18, 3, 0, 0, Math.PI * 2)
      cctx.fill()

      cctx.translate(g.px, g.py + bob)
      cctx.rotate(tilt)

      let frames: HTMLImageElement[] = []
      let fi = 0
      if (g.jumping) { frames = gf('jump'); fi = Math.floor(g.animT * 8) % Math.max(1, frames.length) }
      else if (g.state === 'run') { frames = gf('run'); fi = Math.floor(g.animT * 14) % Math.max(1, frames.length) }
      else if (g.state === 'slash') { frames = gf('slash'); fi = Math.floor(g.animT * 18) % Math.max(1, frames.length) }
      else { frames = gf('idle'); fi = Math.floor(g.animT * 5) % Math.max(1, frames.length) }

      if (frames.length > 0 && fi < frames.length) {
        const f = frames[fi]
        const sc = 1.6
        cctx.drawImage(f, -f.width * sc / 2, -f.height * sc + 4, f.width * sc, f.height * sc)
      } else {
        cctx.fillStyle = '#ff00ff'
        cctx.fillRect(-22, -48, 44, 60)
      }

      cctx.restore()
    }

    function drawFX(g: G) {
      const now = Date.now()
      for (const p of g.parts) {
        const prog = p.life / p.maxLife
        cctx.globalAlpha = 1 - prog
        cctx.fillStyle = p.color
        cctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz)
      }
      cctx.globalAlpha = 1
      for (const s of g.slsh) {
        const age = now - s.t0; const prog = Math.min(age / s.life, 1)
        if (prog >= 1) continue
        cctx.save()
        cctx.globalAlpha = 1 - prog
        cctx.strokeStyle = '#4ade80'
        cctx.lineWidth = 3
        cctx.translate(s.x, s.y)
        cctx.rotate(prog * Math.PI * 2)
        const len = 35 * (1 - prog * 0.3)
        cctx.beginPath(); cctx.moveTo(-len, 0); cctx.lineTo(len, 0); cctx.stroke()
        cctx.restore()
      }
    }

    function frame() {
      if (!alive.current) return
      const w = cvs.width; const h = cvs.height
      const g = gRef.current
      const now = Date.now()

      if (g.over && g.endT > 0 && now - g.endT > 1200) {
        const el = now - g.t0; const min = el / 60000
        const fwpm = min > 0 ? Math.round((g.kills * 5) / min) : 0
        const facc = g.tKeys > 0 ? Math.round((g.cKeys / g.tKeys) * 100) : 0
        g.wpm = fwpm; g.acc = facc
        cbRef.current({ skor: g.score, wpm: fwpm, akurasi: facc, comboTerpanjang: g.maxCombo, totalMusuhKalah: g.kills, totalMusuhLolos: g.missed, waktuMillis: el })
        return
      }

      if (!g.over) {
        if (now - g.lastSpawn >= cfg.spawnInt) { doSpawn(g); g.lastSpawn = now }
        for (const en of g.en) {
          if (!en.alive) continue
          en.position[0] -= en.speed / 60
          if (en.position[0] < -200) { en.alive = false; g.missed++; g.combo = 0; g.shT = 5; g.hp--; if (g.hp <= 0) { g.over = true; g.endT = Date.now() } }
        }
        g.en = g.en.filter(e => e.alive)
        for (const p of g.parts) { p.life += 1 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 300 / 60 }
        g.parts = g.parts.filter(p => p.life < p.maxLife)
        g.slsh = g.slsh.filter(s => now - s.t0 < s.life)
        if (g.shT > 0) g.shT *= 0.92
        if (g.shT < 0.1) g.shT = 0
        if (g.state === 'slash' && now - g.stateT > 200) { g.state = g.jumping ? 'jump' : 'run' }
      }

      g.shX = g.shT > 0 ? (Math.random() - 0.5) * g.shT * 2.5 : g.shX * 0.8

      cctx.save()
      cctx.translate(Math.round(g.shX), 0)
      drawBg(w, h, g)
      drawBoxes(g)
      drawChar(g, w, h)
      drawFX(g)
      cctx.restore()

      raf.current = requestAnimationFrame(frame)
    }

    raf.current = requestAnimationFrame(frame)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf.current) }
  }, [duniaId, cfg])

  return (
    <div ref={wrapRef} className="relative w-full h-screen overflow-hidden bg-black select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between pointer-events-none z-10">
        <div className="bg-black/60 px-3 py-2 rounded border border-green-500/30 text-[11px] font-mono">
          <div className="grid grid-cols-2 gap-x-3 gap-y-0">
            <span className="text-green-400">SKOR</span><span className="text-white text-right">{hud.score.toLocaleString()}</span>
            <span className="text-yellow-400">COMBO</span><span className="text-white text-right">{hud.combo > 0 ? hud.combo : '-'}</span>
            <span className="text-purple-400">KILLS</span><span className="text-white text-right">{hud.kills}</span>
            <span className="text-blue-400">WAVE</span><span className="text-white text-right">{hud.wave}</span>
            <span className="text-red-400">HP</span><span className="text-white text-right">{'♥'.repeat(hud.hp)}{'♡'.repeat(Math.max(0, hud.maxHp - hud.hp))}</span>
          </div>
        </div>
        <div className="bg-black/60 px-3 py-2 rounded border border-green-500/30 text-center text-[10px] font-mono">
          <div className="text-gray-400">{duniaNama} <span style={{ color: difficulty === 'EASY' ? '#4ade80' : difficulty === 'MEDIUM' ? '#fbbf24' : '#ff4444' }}>{difficulty}</span></div>
          <div className="flex gap-2 mt-0.5"><span className="text-gray-500">WPM</span><span className="text-green-400">{hud.wpm}</span><span className="text-gray-500">AKR</span><span className="text-blue-400">{hud.acc}%</span></div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/70 px-4 py-2 rounded border border-green-500/40 text-center text-green-400 text-base font-mono min-w-[200px]">
          Ketik huruf → tebas!
        </div>
      </div>
      {hud.over && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="bg-gray-900 border-2 border-red-500 px-8 py-6 rounded text-center">
            <div className="text-3xl text-red-500 font-bold font-mono mb-2">GAME OVER</div>
            <p className="text-gray-400 text-xs font-mono">Menghitung hasil...</p>
          </div>
        </div>
      )}
    </div>
  )
}
