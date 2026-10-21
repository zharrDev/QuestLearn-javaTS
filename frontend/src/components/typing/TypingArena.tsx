import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { DifficultyLevel } from '../../types/typing.types'
import { CFG, hash01, type DifficultyConfig } from '../../config/game.config'
import { resolveWorld, sameChar, type WorldDef, type WorldPalette } from '../../config/worlds'
import { detectUiLang, uiText, type Copy } from '../../config/i18n'
import { sfx } from '../../game/audio'
import { drawPixelUi, type UiAction, type UiHitBox, type UiModel } from '../../game/pixelUi'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Phase = 'ready' | 'countdown' | 'playing' | 'paused' | 'over'
type Action = '' | 'slash' | 'finisher' | 'block'

interface ArenaProps {
  words: string[]
  difficulty: DifficultyLevel
  duniaId: number
  duniaNama: string
  duniaSlug?: string
  durationSec: 30 | 60 | 300
  onSessionEnd: (result: {
    skor: number
    wpm: number
    akurasi: number
    comboTerpanjang: number
    totalMusuhKalah: number
    totalMusuhLolos: number
    waktuMillis: number
  }) => void
}

interface Cell {
  x: number
  y: number
  w: number
  h: number
  space: boolean
}

interface WordLayout {
  cells: Cell[]
  width: number
  height: number
  pad: number
}

interface Platform {
  id: string
  x: number
  tier: number
  width: number
  pad: number
  seed: number
  enemyId: string | null
  cleared: boolean
}

interface CrateEnemy {
  id: string
  word: string
  chars: string[]
  typed: number
  alive: boolean
  platformId: string
  layout: WordLayout
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface SlashFx {
  x: number
  y: number
  at: number
  life: number
  big: boolean
  seed: number
}

interface FloatFx {
  x: number
  y: number
  text: string
  color: string
  life: number
  maxLife: number
}

interface Player {
  y: number
  vy: number
  airborne: boolean
  action: Action
  actionT: number
  animT: number
  lunge: number
  lungeTarget: number
}

interface Game {
  world: WorldDef
  theme: WorldPalette
  cfg: DifficultyConfig
  difficulty: DifficultyLevel
  words: string[]
  phase: Phase
  time: number
  elapsed: number
  durationSec: number
  countdownT: number
  lastCount: number
  viewW: number
  viewH: number
  scale: number
  groundY: number
  tierH: number
  maxBlockW: number
  homeX: number
  camX: number
  score: number
  combo: number
  maxCombo: number
  kills: number
  missed: number
  hp: number
  maxHp: number
  correctKeys: number
  totalKeys: number
  correctChars: number
  platforms: Platform[]
  enemies: CrateEnemy[]
  lockedId: string | null
  player: Player
  particles: Particle[]
  slashes: SlashFx[]
  floats: FloatFx[]
  shake: number
  hurt: number
  wrongFlash: { enemyId: string; index: number; at: number } | null
  pool: string[]
  lastWord: string
  lastPlatformRight: number
  idSeq: number
  submitted: boolean
  overT: number
  overReason: 'time' | 'hp'
  touchMode: boolean
}

const START_COUNTDOWN = 2.4
const GRAVITY = 1900

/* ------------------------------------------------------------------ */
/* Layout & spawn helpers                                             */
/* ------------------------------------------------------------------ */

function makeLayout(word: string, scale: number, maxBlockW: number): WordLayout {
  const cell = Math.round(46 * scale)
  const gap = Math.round(5 * scale)
  const spaceW = Math.round(20 * scale)
  const pad = Math.round(15 * scale)
  const usable = Math.max(cell + gap, maxBlockW - pad * 2)
  const maxCols = Math.max(3, Math.min(8, Math.floor((usable + gap) / (cell + gap))))
  const chars = Array.from(word)

  const rows: number[][] = []
  for (let i = 0; i < chars.length; i++) {
    const row = Math.floor(i / maxCols)
    if (!rows[row]) rows[row] = []
    rows[row].push(i)
  }

  const widthOf = (indexes: number[]) =>
    indexes.reduce((sum, i) => sum + (chars[i] === ' ' ? spaceW : cell), 0) +
    Math.max(0, indexes.length - 1) * gap

  const width = Math.max(...rows.map(widthOf))
  const cells: Cell[] = new Array(chars.length)
  rows.forEach((indexes, row) => {
    let cursor = (width - widthOf(indexes)) / 2
    for (const i of indexes) {
      const w = chars[i] === ' ' ? spaceW : cell
      cells[i] = {
        x: cursor + w / 2,
        y: row * (cell + gap) + cell / 2,
        w,
        h: cell,
        space: chars[i] === ' ',
      }
      cursor += w + gap
    }
  })

  const height = rows.length * cell + (rows.length - 1) * gap
  return { cells, width, height, pad }
}

function pickWord(g: Game): string {
  if (g.pool.length === 0) {
    const list = [...new Set(g.words.filter((w) => typeof w === 'string' && w.trim().length > 0))]
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
    if (list.length > 1 && list[list.length - 1] === g.lastWord) {
      ;[list[list.length - 1], list[0]] = [list[0], list[list.length - 1]]
    }
    g.pool = list
  }
  const word = g.pool.pop() || 'word'
  g.lastWord = word
  return word
}

function platformTop(g: Game, p: Platform): number {
  return g.groundY - p.tier * g.tierH
}

function spawnPlatform(g: Game, opening = false) {
  const word = pickWord(g)
  const layout = makeLayout(word, g.scale, g.maxBlockW)
  const width = layout.width + layout.pad * 2
  const gap = Math.max(48, g.viewW * g.cfg.gapRatio)
  const x = opening
    ? g.platforms.length > 0
      ? g.lastPlatformRight + gap
      : g.camX + g.viewW * 0.55
    : Math.max(g.camX + g.viewW + 40, g.lastPlatformRight + gap)

  // Don't place a tall multi-row word on a cliff that would push it off-screen.
  const maxTierByHeight = Math.max(
    0,
    Math.min(g.cfg.tierMax, Math.floor((g.groundY - layout.height - 90) / Math.max(1, g.tierH))),
  )
  const tier = Math.floor(Math.random() * (maxTierByHeight + 1))
  const platform: Platform = {
    id: `p${g.idSeq++}`,
    x,
    tier,
    width,
    pad: layout.pad,
    seed: Math.floor(Math.random() * 10000),
    enemyId: null,
    cleared: false,
  }
  const enemy: CrateEnemy = {
    id: `e${g.idSeq++}`,
    word,
    chars: Array.from(word),
    typed: 0,
    alive: true,
    platformId: platform.id,
    layout,
  }
  platform.enemyId = enemy.id
  g.platforms.push(platform)
  g.enemies.push(enemy)
  g.lastPlatformRight = x + width
}

function seedOpening(g: Game) {
  g.platforms = []
  g.enemies = []
  g.lastPlatformRight = 0
  for (let i = 0; i < g.cfg.openingGroups; i++) spawnPlatform(g, true)
}

function nearestEnemy(g: Game): CrateEnemy | null {
  let best: CrateEnemy | null = null
  let bestX = Infinity
  for (const enemy of g.enemies) {
    if (!enemy.alive) continue
    const platform = g.platforms.find((p) => p.id === enemy.platformId)
    if (!platform) continue
    if (platform.x < bestX) {
      bestX = platform.x
      best = enemy
    }
  }
  return best
}

function addParticles(g: Game, x: number, y: number, color: string, count: number, power = 220) {
  for (let i = 0; i < count; i++) {
    g.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * power,
      vy: -Math.random() * power - 40,
      life: 0,
      maxLife: 0.32 + Math.random() * 0.34,
      color,
      size: 2 + Math.random() * 4,
    })
  }
}

function addFloat(g: Game, x: number, y: number, text: string, color: string) {
  g.floats.push({ x, y, text, color, life: 0, maxLife: 0.9 })
}

function addSlash(g: Game, x: number, y: number, big: boolean) {
  g.slashes.push({ x, y, at: g.time, life: big ? 0.36 : 0.2, big, seed: Math.random() * 6 })
}

function resetRun(g: Game) {
  g.phase = 'countdown'
  g.time = 0
  g.elapsed = 0
  g.countdownT = START_COUNTDOWN
  g.lastCount = 4
  g.camX = 0
  g.score = 0
  g.combo = 0
  g.maxCombo = 0
  g.kills = 0
  g.missed = 0
  g.hp = g.maxHp
  g.correctKeys = 0
  g.totalKeys = 0
  g.correctChars = 0
  g.particles = []
  g.slashes = []
  g.floats = []
  g.shake = 0
  g.hurt = 0
  g.wrongFlash = null
  g.lockedId = null
  g.pool = []
  g.lastWord = ''
  g.submitted = false
  g.overT = 0
  g.player = { y: 0, vy: 0, airborne: false, action: '', actionT: 0, animT: 0, lunge: 0, lungeTarget: 0 }
  seedOpening(g)
}

function endGame(g: Game, reason: 'time' | 'hp') {
  if (g.phase === 'over') return
  g.phase = 'over'
  g.overReason = reason
  g.overT = 0
  g.player.action = ''
  g.shake = Math.max(g.shake, 6)
}

function hitEnemy(g: Game, enemy: CrateEnemy, ch: string) {
  const platform = g.platforms.find((p) => p.id === enemy.platformId)
  if (!platform) return
  const index = enemy.typed
  const cell = enemy.layout.cells[index]
  if (!cell) return
  const top = platformTop(g, platform)
  const wx = platform.x + platform.pad + cell.x
  const wy = top - enemy.layout.height + cell.y

  g.lockedId = enemy.id
  g.wrongFlash = null
  g.correctKeys++
  g.correctChars++
  enemy.typed++
  g.combo++
  if (g.combo > g.maxCombo) g.maxCombo = g.combo

  const mult = g.difficulty === 'HARD' ? 3 : g.difficulty === 'MEDIUM' ? 2 : 1
  g.score += 2 * mult
  sfx.slash(g.combo % 6)

  const color = cell.space ? g.theme.accentSoft : g.theme.accent
  addParticles(g, wx, wy, color, cell.space ? 3 : 6)

  // The hero dashes and, for cliff platforms, jumps toward the crate.
  const p = g.player
  const screenX = wx - g.camX
  p.lungeTarget = Math.max(0, Math.min(g.viewW * 0.55, screenX - g.homeX - 62 * g.scale))
  if (platformTop(g, platform) < g.groundY - 30 && !p.airborne) {
    p.airborne = true
    p.vy = Math.sqrt(2 * GRAVITY * Math.max(70, platform.tier * g.tierH * 0.9))
  }

  const complete = enemy.typed >= enemy.word.length
  if (complete) {
    enemy.alive = false
    platform.cleared = true
    platform.enemyId = null
    g.lockedId = null
    g.kills++
    const bonus = enemy.word.length * 8 * mult + Math.floor(g.combo / 10) * 5
    g.score += bonus
    g.player.action = 'finisher'
    g.player.actionT = 0
    addParticles(g, wx, wy, '#FFF4C2', 16, 330)
    addSlash(g, wx, wy, true)
    addFloat(g, wx, wy - 20 * g.scale, `+${bonus}`, '#FFE08A')
    g.shake = Math.min(8, g.shake + 2)
    sfx.kill()
  } else {
    g.player.action = 'slash'
    g.player.actionT = 0
    addSlash(g, wx, wy, false)
  }
}

function failChar(g: Game, enemy: CrateEnemy | null) {
  g.combo = 0
  g.shake = Math.min(8, g.shake + 2.5)
  g.player.action = 'block'
  g.player.actionT = 0
  sfx.error()
  if (enemy) {
    g.wrongFlash = { enemyId: enemy.id, index: enemy.typed, at: g.time }
  }
}

function processChar(g: Game, raw: string) {
  if (g.phase !== 'playing' || raw.length !== 1) return
  const ch = raw
  if (ch === '\n' || ch === '\r' || ch === '\t') return
  g.totalKeys++

  let locked = g.enemies.find((e) => e.alive && e.id === g.lockedId) || null
  if (!locked) {
    const candidates = g.enemies.filter(
      (e) => e.alive && e.typed === 0 && e.chars.length > 0 && sameChar(e.chars[0], ch),
    )
    if (candidates.length === 0) {
      failChar(g, nearestEnemy(g))
      return
    }
    candidates.sort((a, b) => {
      const pa = g.platforms.find((p) => p.id === a.platformId)?.x ?? 0
      const pb = g.platforms.find((p) => p.id === b.platformId)?.x ?? 0
      return pa - pb
    })
    locked = candidates[0]
    g.lockedId = locked.id
  }

  const expected = locked.chars[locked.typed]
  if (expected !== undefined && sameChar(expected, ch)) {
    hitEnemy(g, locked, ch)
  } else {
    failChar(g, locked)
  }
}

function updateGame(g: Game, dt: number) {
  g.time += dt
  g.player.animT += dt
  if (g.player.action) {
    g.player.actionT += dt
    const limit = g.player.action === 'finisher' ? 0.42 : g.player.action === 'block' ? 0.24 : 0.22
    if (g.player.actionT > limit) g.player.action = ''
  }
  if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 22)
  if (g.hurt > 0) g.hurt = Math.max(0, g.hurt - dt * 2.4)

  // Lunge easing: dash to the crate, then drift back to the home position.
  const p = g.player
  if (p.action === 'slash' || p.action === 'finisher') {
    p.lunge += (p.lungeTarget - p.lunge) * Math.min(1, dt * 16)
  } else {
    p.lunge += (0 - p.lunge) * Math.min(1, dt * 6)
  }
  if (p.airborne) {
    p.vy -= GRAVITY * dt
    p.y += p.vy * dt
    if (p.y <= 0) {
      p.y = 0
      p.vy = 0
      p.airborne = false
    }
  }

  for (const particle of g.particles) {
    particle.life += dt
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.vy += 800 * dt
  }
  g.particles = g.particles.filter((p2) => p2.life < p2.maxLife)

  g.slashes = g.slashes.filter((s) => g.time - s.at < s.life)
  for (const f of g.floats) {
    f.life += dt
    f.y -= 44 * dt
  }
  g.floats = g.floats.filter((f) => f.life < f.maxLife)

  if (g.phase === 'countdown') {
    g.countdownT -= dt
    const count = Math.max(1, Math.ceil(g.countdownT / 0.8))
    if (count !== g.lastCount) {
      g.lastCount = count
      sfx.countdown(count === 1)
    }
    if (g.countdownT <= 0) {
      g.phase = 'playing'
      g.elapsed = 0
    }
    return
  }

  if (g.phase === 'paused' || g.phase === 'ready') return

  if (g.phase === 'over') {
    g.overT += dt
    return
  }

  // ---- playing ----
  g.elapsed += dt
  g.camX += g.viewW * g.cfg.worldSpeed * dt

  if (g.elapsed >= g.durationSec) {
    endGame(g, 'time')
    return
  }

  // Cull platforms that have scrolled off the left edge.
  g.platforms = g.platforms.filter((p2) => p2.x + p2.width > g.camX - 240)
  const aliveIds = new Set(g.platforms.map((p2) => p2.enemyId).filter(Boolean))
  g.enemies = g.enemies.filter((e) => e.alive || aliveIds.has(e.id))

  // Groups that reach the hero cost one heart.
  for (const platform of g.platforms) {
    if (!platform.enemyId) continue
    const enemy = g.enemies.find((e) => e.id === platform.enemyId && e.alive)
    if (!enemy) {
      platform.enemyId = null
      platform.cleared = true
      continue
    }
    if (platform.x + platform.pad <= g.camX + g.homeX) {
      platform.enemyId = null
      platform.cleared = true
      enemy.alive = false
      if (g.lockedId === enemy.id) g.lockedId = null
      g.combo = 0
      g.missed++
      g.hp = Math.max(0, g.hp - 1)
      g.hurt = 1
      g.shake = 10
      g.player.action = 'block'
      g.player.actionT = 0
      addParticles(
        g,
        platform.x + platform.width / 2,
        platformTop(g, platform) - 20,
        '#E37B6B',
        14,
        260,
      )
      addFloat(g, platform.x + platform.width / 2, platformTop(g, platform) - 44, 'MISS', '#FF8B7B')
      sfx.miss()
      if (g.hp <= 0) {
        endGame(g, 'hp')
        return
      }
    }
  }

  // Keep the lane stocked with crates.
  if (g.enemies.filter((e) => e.alive).length < g.cfg.onScreen) {
    spawnPlatform(g)
  }
}

/* ------------------------------------------------------------------ */
/* Renderer (all art generated in code)                               */
/* ------------------------------------------------------------------ */

function drawRidge(
  ctx: CanvasRenderingContext2D,
  g: Game,
  baseY: number,
  color: string,
  amplitude: number,
  parallax: number,
  step: number,
) {
  ctx.fillStyle = color
  for (let x = -step; x <= g.viewW + step; x += step) {
    const wx = x + g.camX * parallax
    const y =
      baseY -
      (Math.sin(wx * 0.0042) * 0.5 + 0.5) * amplitude -
      (Math.sin(wx * 0.0016 + 1.7) * 0.5 + 0.5) * amplitude * 0.55
    ctx.fillRect(x, y, step + 1, baseY - y)
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.fillStyle = color
  ctx.globalAlpha = 0.8
  ctx.fillRect(x, y, 58 * s, 12 * s)
  ctx.fillRect(x + 10 * s, y - 9 * s, 34 * s, 12 * s)
  ctx.fillRect(x + 22 * s, y - 16 * s, 20 * s, 10 * s)
  ctx.globalAlpha = 1
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = palette.rockDark
  ctx.fillRect(x - 3 * s, baseY - 34 * s, 6 * s, 34 * s)
  ctx.fillStyle = palette.mid
  ctx.fillRect(x - 18 * s, baseY - 56 * s, 36 * s, 20 * s)
  ctx.fillRect(x - 13 * s, baseY - 66 * s, 26 * s, 14 * s)
  ctx.fillStyle = palette.far
  ctx.fillRect(x - 11 * s, baseY - 64 * s, 12 * s, 6 * s)
}

function drawPine(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = palette.rockDark
  ctx.fillRect(x - 2 * s, baseY - 12 * s, 4 * s, 12 * s)
  ctx.fillStyle = palette.near
  for (let i = 0; i < 4; i++) {
    const w = (22 - i * 4) * s
    const y = baseY - 12 * s - i * 12 * s
    ctx.fillRect(x - w / 2, y - 12 * s, w, 12 * s)
  }
  ctx.fillStyle = '#F4F8FB'
  ctx.fillRect(x - 5 * s, baseY - 60 * s, 10 * s, 4 * s)
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = palette.rockDark
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x - 2 * s + i * 2.4 * s, baseY - (i + 1) * 10 * s, 5 * s, 10 * s)
  }
  ctx.fillStyle = palette.mid
  const topY = baseY - 50 * s
  const topX = x + 10 * s
  ctx.fillRect(topX - 20 * s, topY - 4 * s, 40 * s, 5 * s)
  ctx.fillRect(topX - 14 * s, topY - 12 * s, 10 * s, 9 * s)
  ctx.fillRect(topX + 6 * s, topY - 11 * s, 10 * s, 8 * s)
  ctx.fillRect(topX - 4 * s, topY - 16 * s, 8 * s, 8 * s)
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = '#F2E3C8'
  ctx.fillRect(x - 20 * s, baseY - 32 * s, 40 * s, 32 * s)
  ctx.fillStyle = '#B5533C'
  ctx.fillRect(x - 25 * s, baseY - 40 * s, 50 * s, 9 * s)
  ctx.fillRect(x - 20 * s, baseY - 47 * s, 40 * s, 8 * s)
  ctx.fillStyle = '#7A4A32'
  ctx.fillRect(x - 6 * s, baseY - 18 * s, 12 * s, 18 * s)
  ctx.fillStyle = palette.accent
  ctx.fillRect(x + 9 * s, baseY - 26 * s, 7 * s, 7 * s)
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = palette.mid
  ctx.fillRect(x - 4 * s, baseY - 34 * s, 8 * s, 34 * s)
  ctx.fillRect(x - 15 * s, baseY - 25 * s, 11 * s, 6 * s)
  ctx.fillRect(x - 15 * s, baseY - 31 * s, 5 * s, 12 * s)
  ctx.fillRect(x + 5 * s, baseY - 17 * s, 11 * s, 6 * s)
  ctx.fillRect(x + 11 * s, baseY - 24 * s, 5 * s, 13 * s)
}

function drawLighthouse(ctx: CanvasRenderingContext2D, x: number, baseY: number, s: number, palette: WorldPalette) {
  ctx.fillStyle = '#F4F0E6'
  ctx.fillRect(x - 7 * s, baseY - 50 * s, 14 * s, 50 * s)
  ctx.fillStyle = '#C9574A'
  ctx.fillRect(x - 7 * s, baseY - 38 * s, 14 * s, 8 * s)
  ctx.fillRect(x - 7 * s, baseY - 20 * s, 14 * s, 8 * s)
  ctx.fillStyle = palette.accent
  ctx.fillRect(x - 9 * s, baseY - 58 * s, 18 * s, 9 * s)
  ctx.fillStyle = '#FFE9A8'
  ctx.fillRect(x - 4 * s, baseY - 57 * s, 8 * s, 7 * s)
}

function drawDecor(ctx: CanvasRenderingContext2D, g: Game) {
  const theme = g.theme
  const span = g.viewW + 420
  const count = 6
  for (let i = 0; i < count; i++) {
    const raw = (i * (span / count) - g.camX * 0.4) % span
    const x = (raw + span) % span - 140
    const s = 0.75 + hash01(i * 13 + 5) * 0.5
    const baseY = g.groundY + 4
    if (theme.decor === 'village') {
      if (i % 2 === 0) drawHouse(ctx, x, baseY, s, theme)
      else drawTree(ctx, x, baseY, s, theme)
    } else if (theme.decor === 'tropical') {
      drawPalm(ctx, x, baseY, s, theme)
    } else if (theme.decor === 'mesa') {
      if (i % 2 === 0) drawCactus(ctx, x, baseY, s, theme)
      else {
        ctx.fillStyle = theme.far
        ctx.fillRect(x - 26 * s, baseY - 34 * s, 52 * s, 14 * s)
        ctx.fillRect(x - 16 * s, baseY - 48 * s, 32 * s, 14 * s)
      }
    } else if (theme.decor === 'lavender') {
      ctx.fillStyle = theme.mid
      ctx.fillRect(x - 22 * s, baseY - 12 * s, 44 * s, 12 * s)
      ctx.fillStyle = '#9E86C9'
      for (let j = 0; j < 5; j++) {
        ctx.fillRect(x - 20 * s + j * 9 * s, baseY - 20 * s, 5 * s, 9 * s)
      }
    } else if (theme.decor === 'alpine') {
      drawPine(ctx, x, baseY, s, theme)
    } else {
      if (i % 2 === 0) drawLighthouse(ctx, x, baseY, s, theme)
      else {
        ctx.fillStyle = theme.mid
        ctx.fillRect(x - 20 * s, baseY - 16 * s, 40 * s, 16 * s)
      }
    }
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, g: Game) {
  const theme = g.theme
  const w = g.viewW
  const h = g.viewH
  const sky = ctx.createLinearGradient(0, 0, 0, g.groundY)
  sky.addColorStop(0, theme.skyTop)
  sky.addColorStop(1, theme.skyBottom)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, g.groundY)

  if (theme.night) {
    for (let i = 0; i < 46; i++) {
      const x = ((i * 131 - g.camX * 0.03) % (w + 40) + w + 40) % (w + 40) - 20
      const y = (hash01(i * 7 + 3) * g.groundY) / 1.4
      ctx.globalAlpha = 0.25 + hash01(i * 3 + 1) * 0.6
      ctx.fillStyle = '#FFF4D8'
      ctx.fillRect(x, y, 2, 2)
    }
    ctx.globalAlpha = 1
  }

  const sunX = w * 0.8 - ((g.camX * 0.015) % (w * 1.5))
  ctx.globalAlpha = 0.22
  ctx.fillStyle = theme.sun
  ctx.beginPath()
  ctx.arc(sunX, h * 0.20, 52 * g.scale, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = theme.sun
  ctx.beginPath()
  ctx.arc(sunX, h * 0.20, 26 * g.scale, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 5; i++) {
    const span = w + 460
    const raw = (i * 320 + 90 - g.camX * 0.06) % span
    const x = (raw + span) % span - 180
    const y = 50 + hash01(i * 9 + 2) * h * 0.18
    drawCloud(ctx, x, y, 0.7 + hash01(i * 5) * 0.6, theme.cloud)
  }

  if (theme.decor === 'coast') {
    ctx.fillStyle = theme.far
    ctx.fillRect(0, g.groundY - 54 * g.scale, w, 54 * g.scale)
    ctx.fillStyle = theme.accentSoft
    for (let i = 0; i < 8; i++) {
      const x = ((i * 180 - g.camX * 0.25) % (w + 240) + w + 240) % (w + 240) - 120
      ctx.fillRect(x, g.groundY - 30 * g.scale + (i % 3) * 8 * g.scale, 36 * g.scale, 2)
    }
  }

  drawRidge(ctx, g, g.groundY - 2, theme.far, h * 0.19, 0.1, 26)
  drawRidge(ctx, g, g.groundY - 2, theme.mid, h * 0.105, 0.24, 18)
  drawDecor(ctx, g)
}

function drawGround(ctx: CanvasRenderingContext2D, g: Game) {
  const theme = g.theme
  const w = g.viewW
  const groundY = g.groundY
  ctx.fillStyle = theme.ground
  ctx.fillRect(0, groundY, w, g.viewH - groundY)

  ctx.fillStyle = theme.groundTop
  ctx.fillRect(0, groundY, w, Math.max(5, 8 * g.scale))
  ctx.fillStyle = theme.groundDark
  ctx.fillRect(0, groundY + Math.max(5, 8 * g.scale), w, 2)

  // Scrolling dirt strata and pebbles.
  ctx.fillStyle = theme.groundDark
  const tile = 26
  const off = -(g.camX % tile)
  for (let x = off - tile; x < w + tile; x += tile) {
    ctx.fillRect(x, groundY + 22, 14, 2)
    ctx.fillRect(x + 9, groundY + 40, 8, 2)
    if (hash01(x * 0.13) > 0.55) ctx.fillRect(x + 4, groundY + 56, 4, 3)
  }

  // Grass tufts on the surface.
  ctx.fillStyle = theme.groundTop
  for (let x = off - tile; x < w + tile; x += tile) {
    if (hash01(x * 0.37 + 2) > 0.45) {
      ctx.fillRect(x + 5, groundY - 4, 2, 4)
      ctx.fillRect(x + 8, groundY - 6, 2, 6)
      ctx.fillRect(x + 11, groundY - 3, 2, 3)
    }
  }
}

function drawPlatforms(ctx: CanvasRenderingContext2D, g: Game) {
  const theme = g.theme
  const cap = Math.max(7, Math.round(10 * g.scale))
  for (const platform of g.platforms) {
    const x = platform.x - g.camX
    if (x > g.viewW + 80 || x + platform.width < -80) continue
    const top = platformTop(g, platform)

    if (platform.tier === 0) {
      ctx.fillStyle = theme.rockLight
      ctx.fillRect(x, top - 3, platform.width, 3)
      ctx.fillStyle = theme.groundDark
      ctx.fillRect(x, top, platform.width, 2)
      ctx.fillStyle = theme.groundTop
      for (let i = 6; i < platform.width; i += 22) {
        if (hash01(platform.seed + i) > 0.4) ctx.fillRect(x + i, top - 6, 2, 5)
      }
      continue
    }

    const bottom = g.groundY + 2
    // Rock column rooted in the ground — no floating islands.
    ctx.fillStyle = theme.rock
    ctx.fillRect(x + 3, top + cap, platform.width - 6, bottom - top - cap)
    ctx.fillStyle = theme.rockDark
    ctx.fillRect(x + 3, top + cap, 4, bottom - top - cap)
    ctx.fillRect(x + platform.width - 7, top + cap, 4, bottom - top - cap)
    // Wider base so the cliff visibly meets the terrain.
    ctx.fillStyle = theme.rock
    ctx.fillRect(x - 6, bottom - 22, platform.width + 12, 22)
    ctx.fillStyle = theme.rockDark
    ctx.fillRect(x - 6, bottom - 8, platform.width + 12, 8)

    // Brick courses.
    ctx.fillStyle = theme.rockDark
    for (let y = top + cap + 14; y < bottom - 10; y += 16) {
      ctx.fillRect(x + 6, y, platform.width - 12, 1)
    }
    for (let i = 0; i < 5; i++) {
      if (hash01(platform.seed + i * 13) > 0.5) {
        const crackY = top + cap + 20 + hash01(platform.seed + i * 3) * (bottom - top - 40)
        ctx.fillRect(x + 10 + hash01(platform.seed + i) * (platform.width - 24), crackY, 5, 2)
        ctx.fillRect(x + 12 + hash01(platform.seed + i) * (platform.width - 24), crackY + 2, 2, 4)
      }
    }

    // Ledge cap.
    ctx.fillStyle = theme.groundTop
    ctx.fillRect(x, top, platform.width, cap)
    ctx.fillStyle = theme.rockLight
    ctx.fillRect(x, top + cap, platform.width, 2)
    ctx.fillStyle = theme.rockDark
    ctx.fillRect(x, top + cap + 2, platform.width, 2)
    ctx.fillStyle = theme.groundTop
    for (let i = 5; i < platform.width; i += 19) {
      if (hash01(platform.seed + i) > 0.45) {
        const drip = 3 + hash01(platform.seed + i * 2) * 8
        ctx.fillRect(x + i, top + cap, 3, drip)
      }
    }
    if (theme.decor === 'alpine') {
      ctx.fillStyle = '#F4F8FB'
      ctx.fillRect(x, top, platform.width, 3)
    }

    if (platform.cleared) {
      ctx.fillStyle = theme.accent
      const flagX = x + platform.width - 12
      ctx.fillRect(flagX, top - 26, 2, 26)
      ctx.fillRect(flagX + 2, top - 26, 12, 8)
    }
  }
}

function drawCrate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  letter: string,
  palette: WorldPalette,
  isNext: boolean,
  isLocked: boolean,
  isWrong: boolean,
) {
  const half = w / 2
  ctx.save()
  ctx.translate(x, y)

  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillRect(-half + 3, -h / 2 + 4, w, h)

  if (isWrong) {
    ctx.shadowColor = '#FF3B30'
    ctx.shadowBlur = 18
    ctx.strokeStyle = '#FF3B30'
    ctx.lineWidth = 3
    ctx.strokeRect(-half - 2, -h / 2 - 2, w + 4, h + 4)
    ctx.shadowBlur = 0
  } else if (isNext) {
    ctx.shadowColor = palette.accent
    ctx.shadowBlur = 16
    ctx.strokeStyle = palette.accent
    ctx.lineWidth = 3
    ctx.strokeRect(-half - 2, -h / 2 - 2, w + 4, h + 4)
    ctx.shadowBlur = 0
  }

  ctx.fillStyle = isWrong ? '#7A2A24' : palette.boxDark
  ctx.fillRect(-half, -h / 2, w, h)
  ctx.fillStyle = palette.box
  ctx.fillRect(-half + 2, -h / 2 + 2, w - 4, h - 4)
  ctx.fillStyle = palette.boxLight
  ctx.fillRect(-half + 2, -h / 2 + 2, w - 4, 3)
  ctx.fillRect(-half + 2, -h / 2 + 2, 3, h - 4)
  ctx.fillStyle = palette.boxDark
  ctx.fillRect(-half + 2, h / 2 - 5, w - 4, 3)
  ctx.fillRect(half - 5, -h / 2 + 2, 3, h - 4)

  // Corner nails.
  ctx.fillStyle = palette.boxDark
  const nail = Math.max(2, Math.round(w * 0.06))
  ctx.fillRect(-half + 4, -h / 2 + 4, nail, nail)
  ctx.fillRect(half - 4 - nail, -h / 2 + 4, nail, nail)
  ctx.fillRect(-half + 4, h / 2 - 4 - nail, nail, nail)
  ctx.fillRect(half - 4 - nail, h / 2 - 4 - nail, nail, nail)

  const fontSize = Math.round(h * 0.44)
  ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillText(letter, 1, 2)
  ctx.fillStyle = isWrong ? '#FFD0C9' : palette.letter
  ctx.fillText(letter, 0, 1)
  ctx.restore()
}

function drawSpaceCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  palette: WorldPalette,
  isNext: boolean,
) {
  ctx.save()
  if (isNext) {
    ctx.shadowColor = palette.accent
    ctx.shadowBlur = 14
  }
  ctx.strokeStyle = isNext ? palette.accent : palette.boxDark
  ctx.lineWidth = 2
  ctx.setLineDash([3, 3])
  ctx.strokeRect(x - w / 2, y - 7, w, 14)
  ctx.setLineDash([])
  ctx.fillStyle = isNext ? palette.accent : palette.boxLight
  ctx.fillRect(x - 5, y - 1, 10, 2)
  ctx.restore()
}

function drawCrates(ctx: CanvasRenderingContext2D, g: Game) {
  for (const enemy of g.enemies) {
    if (!enemy.alive) continue
    const platform = g.platforms.find((p) => p.id === enemy.platformId)
    if (!platform) continue
    const platformScreenX = platform.x - g.camX
    if (platformScreenX > g.viewW + 120 || platformScreenX + platform.width < -120) continue

    const blockTop = platformTop(g, platform) - enemy.layout.height
    const isLocked = g.lockedId === enemy.id
    const isGroupActive = g.lockedId === null || isLocked

    for (let i = enemy.typed; i < enemy.chars.length; i++) {
      const cell = enemy.layout.cells[i]
      if (!cell) continue
      const x = platform.x + platform.pad + cell.x - g.camX
      const y = blockTop + cell.y
      const isNext = i === enemy.typed && isGroupActive
      const wrong =
        g.wrongFlash !== null &&
        g.wrongFlash.enemyId === enemy.id &&
        g.wrongFlash.index === i &&
        g.time - g.wrongFlash.at < 0.34
      ctx.globalAlpha = isGroupActive ? 1 : 0.82
      if (cell.space) {
        drawSpaceCell(ctx, x, y, cell.w, g.theme, isNext)
      } else {
        drawCrate(ctx, x, y, cell.w, cell.h, enemy.chars[i], g.theme, isNext, isLocked, wrong)
      }
      ctx.globalAlpha = 1

      if (isNext && !cell.space) {
        const bob = Math.sin(g.time * 7) * 3
        ctx.fillStyle = g.theme.accent
        ctx.beginPath()
        ctx.moveTo(x - 6, y - cell.h / 2 - 14 + bob)
        ctx.lineTo(x + 6, y - cell.h / 2 - 14 + bob)
        ctx.lineTo(x, y - cell.h / 2 - 6 + bob)
        ctx.closePath()
        ctx.fill()
      }
    }
  }
}

function drawHero(ctx: CanvasRenderingContext2D, g: Game) {
  const p = g.player
  const theme = g.theme
  const scale = 3.15 * g.scale
  const footX = Math.round(g.homeX + p.lunge)
  const footY = Math.round(g.groundY - p.y)
  const active = g.phase === 'playing'

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(footX, g.groundY + 3, 24 * g.scale, 4 * g.scale, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(footX, footY)
  ctx.scale(scale, scale)

  const stride = active && !p.airborne ? Math.sin(p.animT * 16) : 0
  const idleBob = active ? 0 : Math.sin(p.animT * 2) * 0.3
  const cloak = '#2F4468'
  const cloakLight = '#3F5A85'
  const ink = '#1A2233'
  const skin = '#F2C8A0'
  const boot = '#2A2F3A'

  // Cape / scarf trail behind the hero.
  ctx.fillStyle = '#25344F'
  ctx.fillRect(-8, -17 + idleBob, 4, 10)
  ctx.fillRect(-11 + stride * 0.6, -14 + idleBob, 3, 6)
  ctx.fillStyle = theme.accent
  ctx.fillRect(-9, -20 + idleBob, 5, 2)
  ctx.fillRect(-12 + stride * 0.6, -19 + idleBob, 3, 1.5)

  // Legs.
  ctx.fillStyle = boot
  ctx.fillRect(-4 + stride * 2.2, -6, 3, 6)
  ctx.fillRect(1 - stride * 2.2, -6, 3, 6)
  ctx.fillStyle = '#3A4150'
  ctx.fillRect(-4 + stride * 2.2, -2.4, 4, 2)
  ctx.fillRect(1 - stride * 2.2, -2.4, 4, 2)

  // Body.
  ctx.fillStyle = cloak
  ctx.fillRect(-5, -18 + idleBob, 10, 12)
  ctx.fillStyle = cloakLight
  ctx.fillRect(-5, -18 + idleBob, 10, 2)
  ctx.fillStyle = theme.accent
  ctx.fillRect(-5, -8.5 + idleBob, 10, 1.5)
  ctx.fillStyle = '#223149'
  ctx.fillRect(-5, -14 + idleBob, 2, 5)

  // Head and hood.
  ctx.fillStyle = skin
  ctx.fillRect(-3.5, -24 + idleBob, 7, 6)
  ctx.fillStyle = ink
  ctx.fillRect(-4.5, -26 + idleBob, 9, 3)
  ctx.fillRect(-4.5, -23.5 + idleBob, 1.5, 4)
  ctx.fillStyle = '#0E1420'
  ctx.fillRect(1.6, -22.2 + idleBob, 1.2, 1.2)

  // Front arm.
  ctx.fillStyle = skin
  ctx.fillRect(3, -17 + idleBob, 2.8, 5)
  ctx.fillStyle = theme.accent
  ctx.fillRect(3, -12.4 + idleBob, 2.8, 1.2)

  // Sword.
  const baseAction = p.airborne ? 'jump' : p.action
  ctx.save()
  ctx.translate(4.6, -16 + idleBob)
  let angle = -0.35
  if (baseAction === 'jump') angle = -1.05
  else if (baseAction === 'block') angle = 0.4
  else if (baseAction === 'slash' || baseAction === 'finisher') {
    const t = Math.min(1, p.actionT / (baseAction === 'finisher' ? 0.24 : 0.16))
    angle = -1.9 + t * 2.8
  } else if (active) {
    angle = -0.7 + Math.sin(p.animT * 16) * 0.15
  }
  ctx.rotate(angle)
  ctx.fillStyle = '#4A3320'
  ctx.fillRect(-0.8, 0, 1.6, 3)
  ctx.fillStyle = theme.accent
  ctx.fillRect(-2, -1, 4, 1.2)
  ctx.fillStyle = '#D7E3ED'
  ctx.fillRect(-0.7, -13, 1.4, 12)
  ctx.fillStyle = '#9FB3C8'
  ctx.fillRect(0.7, -13, 0.6, 12)
  ctx.restore()

  if (baseAction === 'slash' || baseAction === 'finisher') {
    const radius = baseAction === 'finisher' ? 12 : 8
    const t = Math.min(1, p.actionT / 0.2)
    ctx.globalAlpha = 1 - t * 0.5
    ctx.strokeStyle = theme.accentSoft
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.arc(4, -14, radius, -1.5 + t * 0.6, 0.9 + t * 0.6)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (baseAction === 'block') {
    ctx.strokeStyle = '#8FD3FF'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.arc(4, -13, 7, -1.1, 1.1)
    ctx.stroke()
  }

  ctx.restore()
}

function drawFx(ctx: CanvasRenderingContext2D, g: Game) {
  for (const particle of g.particles) {
    const t = particle.life / particle.maxLife
    ctx.globalAlpha = Math.max(0, 1 - t)
    ctx.fillStyle = particle.color
    ctx.fillRect(
      Math.round(particle.x - g.camX - particle.size / 2),
      Math.round(particle.y - particle.size / 2),
      particle.size,
      particle.size,
    )
  }
  ctx.globalAlpha = 1

  for (const slash of g.slashes) {
    const age = g.time - slash.at
    const t = Math.min(1, age / slash.life)
    ctx.save()
    ctx.globalAlpha = 1 - t
    ctx.translate(slash.x - g.camX, slash.y)
    ctx.rotate(slash.seed + t * 3)
    const radius = (slash.big ? 46 : 30) * g.scale
    ctx.strokeStyle = g.theme.accent
    ctx.lineWidth = (slash.big ? 6 : 4) * g.scale
    ctx.beginPath()
    ctx.arc(0, 0, radius, -1.1, 0.7)
    ctx.stroke()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, radius - 5, -0.95, 0.55)
    ctx.stroke()
    ctx.restore()
  }
  ctx.globalAlpha = 1

  for (const float of g.floats) {
    const t = float.life / float.maxLife
    ctx.globalAlpha = Math.max(0, 1 - t)
    ctx.fillStyle = float.color
    ctx.font = `bold ${Math.round(14 * g.scale)}px "Press Start 2P", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 4
    ctx.fillText(float.text, float.x - g.camX, float.y)
    ctx.shadowBlur = 0
  }
  ctx.globalAlpha = 1
}

function drawDangerLine(ctx: CanvasRenderingContext2D, g: Game) {
  if (g.phase !== 'playing') return
  const x = g.homeX
  ctx.save()
  ctx.globalAlpha = 0.12 + Math.sin(g.time * 2.4) * 0.04
  ctx.strokeStyle = '#F4E9D8'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 10])
  ctx.beginPath()
  ctx.moveTo(x, 60)
  ctx.lineTo(x, g.groundY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function drawCombo(ctx: CanvasRenderingContext2D, g: Game) {
  if (g.combo < 3) return
  const pulse = 1 + Math.sin(g.time * 8) * 0.05
  ctx.save()
  ctx.font = `${Math.round(18 * g.scale * pulse)}px "Press Start 2P", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = g.combo >= 15 ? '#FF6B5B' : g.combo >= 6 ? '#FFD166' : '#FFF0A8'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 8
  ctx.fillText(`COMBO x${g.combo}`, g.viewW / 2, g.viewH * 0.28)
  ctx.restore()
}

function draw(
  ctx: CanvasRenderingContext2D,
  g: Game,
  copy: Copy,
  nativeName: string,
  touchMode: boolean,
): UiHitBox[] {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, g.viewW, g.viewH)
  ctx.save()
  const shakeX = g.shake > 0 ? (Math.random() - 0.5) * g.shake : 0
  const shakeY = g.shake > 0 ? (Math.random() - 0.5) * g.shake : 0
  ctx.translate(shakeX, shakeY)

  drawBackground(ctx, g)
  drawGround(ctx, g)
  drawDangerLine(ctx, g)
  drawPlatforms(ctx, g)
  drawCrates(ctx, g)
  drawHero(ctx, g)
  drawFx(ctx, g)
  drawCombo(ctx, g)

  if (g.hurt > 0) {
    ctx.globalAlpha = g.hurt * 0.35
    ctx.fillStyle = '#E33B2E'
    ctx.fillRect(0, 0, g.viewW, 70)
    ctx.fillRect(0, g.viewH - 60, g.viewW, 60)
    ctx.fillRect(0, 0, 50, g.viewH)
    ctx.fillRect(g.viewW - 50, 0, 50, g.viewH)
    ctx.globalAlpha = 1
  }
  ctx.restore()

  // The HUD, buttons and overlays are painted into this same canvas so the
  // whole screen is one pixel-art render surface.
  const target = g.enemies.find((e) => e.alive && e.id === g.lockedId)
  const minutes = Math.max(g.elapsed, 0.001) / 60
  const model: UiModel = {
    phase: g.phase,
    score: g.score,
    combo: g.combo,
    maxCombo: g.maxCombo,
    kills: g.kills,
    missed: g.missed,
    hp: g.hp,
    maxHp: g.maxHp,
    wpm: g.correctChars > 0 ? Math.round(g.correctChars / 5 / minutes) : 0,
    acc: g.totalKeys > 0 ? Math.round((g.correctKeys / g.totalKeys) * 100) : 100,
    timeLeft: Math.max(0, Math.ceil(g.durationSec - g.elapsed)),
    durationSec: g.durationSec,
    countdown: Math.max(1, Math.ceil(g.countdownT / 0.8)),
    targetWord: target?.word ?? '',
    targetTyped: target?.typed ?? 0,
    overReason: g.overReason,
    difficulty: g.difficulty,
    muted: sfx.muted,
  }
  return drawPixelUi(
    ctx,
    model,
    { w: g.viewW, h: g.viewH, theme: g.theme, nativeName, description: g.world.description, touchMode },
    copy,
  )
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function TypingArena({
  words,
  difficulty,
  duniaId,
  duniaNama,
  duniaSlug,
  durationSec,
  onSessionEnd,
}: ArenaProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gameRef = useRef<Game | null>(null)
  const rafRef = useRef(0)
  const cbRef = useRef(onSessionEnd)
  cbRef.current = onSessionEnd

  const world = useMemo(
    () => resolveWorld({ slug: duniaSlug, name: duniaNama, id: duniaId }),
    [duniaSlug, duniaNama, duniaId],
  )
  const lang = useMemo(() => detectUiLang(), [])
  const t = useMemo(() => uiText(lang), [lang])
  const cfg = CFG[difficulty]

  // Hit boxes painted by the canvas HUD, rebuilt every frame.
  const hitsRef = useRef<UiHitBox[]>([])

  const startRun = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    sfx.unlock()
    sfx.ui()
    resetRun(g)
    // Focus synchronously inside the user gesture so mobile browsers open the
    // soft keyboard immediately.
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const resumeRun = useCallback(() => {
    const g = gameRef.current
    if (!g || g.phase !== 'paused') return
    g.phase = 'playing'
    sfx.ui()
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const togglePause = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    if (g.phase === 'playing') {
      g.phase = 'paused'
      sfx.ui()
    } else if (g.phase === 'paused') {
      resumeRun()
    }
  }, [resumeRun])

  const toggleMute = useCallback(() => {
    const next = !sfx.muted
    sfx.setMuted(next)
    if (!next) sfx.ui()
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const runAction = useCallback(
    (action: UiAction) => {
      sfx.unlock()
      if (action === 'mute') toggleMute()
      else if (action === 'pause') togglePause()
      else if (action === 'start' || action === 'restart') startRun()
      else if (action === 'resume') resumeRun()
      else inputRef.current?.focus({ preventScroll: true })
    },
    [resumeRun, startRun, toggleMute, togglePause],
  )

  // Initialise the game and run the render/update loop.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = wrap.getBoundingClientRect()
    const startW = Math.max(320, rect.width || 1280)
    const startH = Math.max(360, rect.height || 700)
    const scale = Math.max(0.7, Math.min(1.1, Math.min(startW / 1180, startH / 700)))
    const g: Game = {
      world,
      theme: world.palette,
      cfg,
      difficulty,
      words,
      phase: 'ready',
      time: 0,
      elapsed: 0,
      durationSec,
      countdownT: START_COUNTDOWN,
      lastCount: 4,
      viewW: startW,
      viewH: startH,
      scale,
      groundY: startH * 0.8,
      tierH: Math.min(112, startH * 0.16),
      maxBlockW: startW < 640 ? startW * 0.7 : startW * 0.46,
      homeX: startW * 0.22,
      camX: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      kills: 0,
      missed: 0,
      hp: cfg.hearts,
      maxHp: cfg.hearts,
      correctKeys: 0,
      totalKeys: 0,
      correctChars: 0,
      platforms: [],
      enemies: [],
      lockedId: null,
      player: { y: 0, vy: 0, airborne: false, action: '', actionT: 0, animT: 0, lunge: 0, lungeTarget: 0 },
      particles: [],
      slashes: [],
      floats: [],
      shake: 0,
      hurt: 0,
      wrongFlash: null,
      pool: [],
      lastWord: '',
      lastPlatformRight: 0,
      idSeq: 1,
      submitted: false,
      overT: 0,
      overReason: 'time',
      touchMode: typeof window !== 'undefined' && navigator.maxTouchPoints > 0,
    }
    gameRef.current = g
    seedOpening(g)

    // Dev-only inspection hook used by the automated playtest. It is stripped
    // from production builds.
    if (import.meta.env.DEV) {
      ;(window as unknown as { __typingGame?: () => unknown }).__typingGame = () => {
        const locked = g.enemies.find((e) => e.alive && e.id === g.lockedId) || nearestEnemy(g)
        const platform = locked ? g.platforms.find((p) => p.id === locked.platformId) : null
        return {
          phase: g.phase,
          lockedId: g.lockedId,
          nextTarget: locked
            ? {
                word: locked.word,
                typed: locked.typed,
                screenX: platform ? platform.x + platform.pad - g.camX : 0,
                platformTier: platform?.tier ?? 0,
              }
            : null,
          score: g.score,
          kills: g.kills,
          missed: g.missed,
          hp: g.hp,
          combo: g.combo,
          maxCombo: g.maxCombo,
          correctChars: g.correctChars,
          totalKeys: g.totalKeys,
          wpm: g.correctChars > 0 ? Math.round(g.correctChars / 5 / (Math.max(g.elapsed, 0.001) / 60)) : 0,
          accuracy: g.totalKeys > 0 ? Math.round((g.correctKeys / g.totalKeys) * 100) : 100,
          timeLeft: Math.max(0, g.durationSec - g.elapsed),
          viewW: g.viewW,
          viewH: g.viewH,
          groundY: g.groundY,
          tierH: g.tierH,
          rock: g.theme.rock,
          skyTop: g.theme.skyTop,
          platforms: g.platforms.map((p) => ({
            tier: p.tier,
            screenX: Math.round(p.x - g.camX),
            width: p.width,
            top: Math.round(platformTop(g, p)),
          })),
          enemies: g.enemies.filter((e) => e.alive).length,
          ui: hitsRef.current.map((box) => ({ ...box })),
        }
      }
    }

    let disposed = false
    let last = performance.now()

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.max(320, r.width)
      const h = Math.max(300, r.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      g.viewW = w
      g.viewH = h
      g.scale = Math.max(0.7, Math.min(1.1, Math.min(w / 1180, h / 700)))
      g.groundY = h * 0.8
      g.tierH = Math.min(112, h * 0.16)
      g.maxBlockW = w < 640 ? w * 0.7 : w * 0.46
      g.homeX = w * 0.22
    }
    resize()

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    observer?.observe(wrap)
    window.addEventListener('resize', resize)

    const frame = (now: number) => {
      if (disposed) return
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      updateGame(g, dt)

      if (g.phase === 'over' && !g.submitted && g.overT > 1.5) {
        g.submitted = true
        const minutes = Math.max(g.elapsed, 0.001) / 60
        const wpm = g.correctChars > 0 ? Math.round(g.correctChars / 5 / minutes) : 0
        const acc = g.totalKeys > 0 ? Math.round((g.correctKeys / g.totalKeys) * 100) : 0
        cbRef.current({
          skor: g.score,
          wpm,
          akurasi: acc,
          comboTerpanjang: g.maxCombo,
          totalMusuhKalah: g.kills,
          totalMusuhLolos: g.missed,
          waktuMillis: Math.round(g.elapsed * 1000),
        })
      }

      hitsRef.current = draw(ctx, g, t, world.nativeName, g.touchMode)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    const pauseOnHide = () => {
      if (g.phase === 'playing') g.phase = 'paused'
    }
    document.addEventListener('visibilitychange', pauseOnHide)
    window.addEventListener('blur', pauseOnHide)

    return () => {
      disposed = true
      cancelAnimationFrame(rafRef.current)
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', pauseOnHide)
      window.removeEventListener('blur', pauseOnHide)
      if (import.meta.env.DEV) {
        delete (window as unknown as { __typingGame?: unknown }).__typingGame
      }
    }
  }, [world, difficulty, durationSec, words, cfg, t])

  // Keyboard: Escape/Enter always work; printable keys are the fallback when the
  // hidden input is not focused (desktop). The input itself drives mobile input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = gameRef.current
      if (!g) return
      if (e.key === 'Escape') {
        if (g.phase === 'playing' || g.phase === 'paused') {
          e.preventDefault()
          togglePause()
        }
        return
      }
      if (e.key === 'Enter') {
        if (g.phase === 'ready') {
          e.preventDefault()
          startRun()
        } else if (g.phase === 'paused') {
          e.preventDefault()
          resumeRun()
        }
        return
      }
      if (g.phase !== 'playing') return
      if (e.target === inputRef.current) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key.length === 1) {
        e.preventDefault()
        if (!e.repeat) processChar(g, e.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resumeRun, startRun, togglePause])

  const focusInput = () => {
    const g = gameRef.current
    if (g?.phase === 'playing') inputRef.current?.focus({ preventScroll: true })
  }

  const hitAt = (clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const slop = 6
    return hitsRef.current.find(
      (box) =>
        x >= box.x - slop &&
        x <= box.x + box.w + slop &&
        y >= box.y - slop &&
        y <= box.y + box.h + slop,
    )
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-[calc(100dvh-52px)] overflow-hidden bg-black select-none"
      onPointerDown={(e) => {
        const hit = hitAt(e.clientX, e.clientY, e.currentTarget)
        if (hit) {
          e.preventDefault()
          runAction(hit.action)
          return
        }
        focusInput()
      }}
      onPointerMove={(e) => {
        e.currentTarget.style.cursor = hitAt(e.clientX, e.clientY, e.currentTarget)
          ? 'pointer'
          : 'default'
      }}
    >
      {/* One canvas renders the world, the HUD and every menu — no HTML/CSS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated', touchAction: 'manipulation' }}
      />

      {/* Hidden input: summons the soft keyboard on phones and captures composed characters. */}
      <input
        ref={inputRef}
        aria-label="Typing input"
        className="absolute left-1/2 bottom-0 w-px h-px opacity-0"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value=""
        onChange={(e) => {
          const value = e.currentTarget.value
          e.currentTarget.value = ''
          const g = gameRef.current
          if (!g || !value) return
          const ch = Array.from(value).pop()
          if (ch) processChar(g, ch)
        }}
      />
    </div>
  )
}
