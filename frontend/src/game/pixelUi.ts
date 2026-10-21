import type { Copy } from '../config/i18n'
import type { WorldPalette } from '../config/worlds'

/**
 * Pixel-art user interface for the arena.
 *
 * Everything here is painted straight into the game canvas with hard-edged
 * rectangles and the bitmap-style font — there is no HTML/CSS chrome and no
 * image assets. The functions also return hit boxes so the canvas pointer
 * handler can treat the painted buttons as real controls.
 */

export type UiAction = 'mute' | 'pause' | 'start' | 'resume' | 'restart' | 'focus'

export interface UiHitBox {
  action: UiAction
  x: number
  y: number
  w: number
  h: number
}

export interface UiModel {
  phase: 'ready' | 'countdown' | 'playing' | 'paused' | 'over'
  score: number
  combo: number
  maxCombo: number
  kills: number
  missed: number
  hp: number
  maxHp: number
  wpm: number
  acc: number
  timeLeft: number
  durationSec: number
  countdown: number
  targetWord: string
  targetTyped: number
  overReason: 'time' | 'hp'
  difficulty: string
  muted: boolean
}

export interface UiScene {
  w: number
  h: number
  theme: WorldPalette
  nativeName: string
  description: string
  touchMode: boolean
}

const FONT = '"Press Start 2P", monospace'
const PANEL_BG = '#101A24'
const PANEL_BG_DEEP = '#0A1119'
const INK = '#F5EFDF'
const MUTED_INK = '#9AA7B4'
const SHADOW = '#05080C'

type Ctx = CanvasRenderingContext2D

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function px(n: number): number {
  return Math.round(n)
}

function text(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'left',
): void {
  ctx.font = `${px(size)}px ${FONT}`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(0,0,0,0.72)'
  const off = Math.max(1, Math.round(size / 8))
  ctx.fillText(value, px(x) + off, px(y) + off)
  ctx.fillStyle = color
  ctx.fillText(value, px(x), px(y))
}

function measure(ctx: Ctx, value: string, size: number): number {
  ctx.font = `${px(size)}px ${FONT}`
  return ctx.measureText(value).width
}

function wrap(ctx: Ctx, value: string, maxW: number, size: number): string[] {
  ctx.font = `${px(size)}px ${FONT}`
  const words = value.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function panel(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  border: string,
  fill = PANEL_BG,
  shadow = true,
): void {
  const X = px(x)
  const Y = px(y)
  const W = px(w)
  const H = px(h)
  if (shadow) {
    ctx.fillStyle = SHADOW
    ctx.fillRect(X + 6, Y + 6, W, H)
  }
  ctx.fillStyle = fill
  ctx.fillRect(X, Y, W, H)

  // Double frame: dark outer edge with a bright lip on the inside.
  ctx.fillStyle = '#050A10'
  ctx.fillRect(X, Y, W, 2)
  ctx.fillRect(X, Y + H - 2, W, 2)
  ctx.fillRect(X, Y, 2, H)
  ctx.fillRect(X + W - 2, Y, 2, H)
  ctx.fillStyle = border
  ctx.fillRect(X + 2, Y + 2, W - 4, 2)
  ctx.fillRect(X + 2, Y + H - 4, W - 4, 2)
  ctx.fillRect(X + 2, Y + 2, 2, H - 4)
  ctx.fillRect(X + W - 4, Y + 2, 2, H - 4)

  // Hard bevel highlight (no gradients — pixel art must stay flat).
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(X + 4, Y + 4, W - 8, 1)
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(X + 4, Y + H - 5, W - 8, 1)
}

function button(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  size: number,
  fill: string,
  border: string,
  ink: string,
): void {
  const X = px(x)
  const Y = px(y)
  const W = px(w)
  const H = px(h)
  ctx.fillStyle = SHADOW
  ctx.fillRect(X + 4, Y + 4, W, H)
  ctx.fillStyle = fill
  ctx.fillRect(X, Y, W, H)
  ctx.fillStyle = border
  ctx.fillRect(X, Y, W, 2)
  ctx.fillRect(X, Y, 2, H)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(X + 2, Y + H - 3, W - 2, 3)
  ctx.fillRect(X + W - 3, Y + 2, 3, H - 2)
  text(ctx, label, X + W / 2, Y + (H - size) / 2, size, ink, 'center')
}

function dim(ctx: Ctx, w: number, h: number, alpha = 0.72): void {
  ctx.fillStyle = `rgba(4,8,12,${alpha})`
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)
}

/* ------------------------------------------------------------------ */
/* Bitmap icons                                                        */
/* ------------------------------------------------------------------ */

const HEART = ['01100110', '11111111', '11111111', '01111110', '00111100', '00011000']

function drawHeart(ctx: Ctx, x: number, y: number, filled: boolean, theme: WorldPalette): void {
  ctx.fillStyle = filled ? '#F2645A' : 'rgba(255,255,255,0.14)'
  for (let row = 0; row < HEART.length; row++) {
    const line = HEART[row]
    for (let col = 0; col < line.length; col++) {
      if (line[col] === '1') ctx.fillRect(x + col * 2, y + row * 2, 2, 2)
    }
  }
  if (filled) {
    ctx.fillStyle = theme.accentSoft
    ctx.fillRect(x + 2, y + 2, 2, 2)
  }
}

function drawSoundIcon(ctx: Ctx, x: number, y: number, muted: boolean, color: string): void {
  ctx.fillStyle = color
  // Speaker cone.
  ctx.fillRect(x, y + 5, 3, 6)
  ctx.fillRect(x + 3, y + 3, 2, 10)
  ctx.fillRect(x + 5, y + 1, 2, 14)
  if (muted) {
    ctx.fillStyle = '#E3675C'
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + 10 + i, y + 4 + i, 2, 2)
      ctx.fillRect(x + 10 + i, y + 12 - i, 2, 2)
    }
  } else {
    ctx.fillStyle = color
    ctx.fillRect(x + 9, y + 4, 2, 8)
    ctx.fillRect(x + 12, y + 2, 2, 12)
  }
}

function drawPauseIcon(ctx: Ctx, x: number, y: number, paused: boolean, color: string): void {
  ctx.fillStyle = color
  if (paused) {
    ctx.fillRect(x, y, 3, 14)
    ctx.fillRect(x + 3, y + 2, 2, 4)
    ctx.fillRect(x + 3, y + 8, 2, 4)
    ctx.fillRect(x, y + 4, 2, 6)
  } else {
    ctx.fillRect(x, y, 4, 14)
    ctx.fillRect(x + 8, y, 4, 14)
  }
}

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */

function statRow(
  ctx: Ctx,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  size: number,
  labelColor: string,
  valueColor = INK,
): void {
  text(ctx, label, x, y, size, labelColor)
  text(ctx, value, x + width, y, size, valueColor, 'right')
}

function drawStats(
  ctx: Ctx,
  m: UiModel,
  scene: UiScene,
  copy: Copy,
  compact: boolean,
): void {
  const size = compact ? 7 : 8
  const rowH = size + 9
  const width = compact ? 142 : 176
  const inner = 10
  const x = compact ? 8 : 14
  const y = compact ? 8 : 12
  const h = 26 + rowH * 4 + 18
  panel(ctx, x, y, width, h, scene.theme.accent)
  text(ctx, scene.nativeName.toUpperCase(), x + inner, y + 8, compact ? 6 : 7, scene.theme.accentSoft)
  const colW = width - inner * 2
  let cy = y + 26
  statRow(ctx, copy.score, m.score.toLocaleString(), x + inner, cy, colW, size, '#F2C14E')
  cy += rowH
  statRow(ctx, copy.combo, m.combo > 0 ? `x${m.combo}` : '-', x + inner, cy, colW, size, '#FFD166')
  cy += rowH
  statRow(ctx, copy.wpm, String(m.wpm), x + inner, cy, colW, size, '#7DDC8F')
  cy += rowH
  statRow(ctx, copy.acc, `${m.acc}%`, x + inner, cy, colW, size, '#79C8F2')

  const heartY = y + h - 18
  text(ctx, copy.lives, x + inner, heartY + 2, compact ? 6 : 7, '#F08A82')
  for (let i = 0; i < m.maxHp; i++) {
    drawHeart(ctx, x + width - inner - (m.maxHp - i) * 18, heartY, i < m.hp, scene.theme)
  }
}

function drawTimer(ctx: Ctx, m: UiModel, scene: UiScene, copy: Copy, compact: boolean): void {
  const w = compact ? 88 : 110
  const h = compact ? 58 : 66
  const x = Math.round(scene.w / 2 - w / 2)
  const y = compact ? 8 : 12
  panel(ctx, x, y, w, h, scene.theme.accent)

  const total = m.durationSec
  const ratio = total > 0 ? Math.max(0, Math.min(1, m.timeLeft / total)) : 0
  const color = ratio > 0.55 ? '#7DDC8F' : ratio > 0.2 ? '#F2C14E' : '#F2645A'
  const label =
    m.phase === 'ready'
      ? 'READY'
      : m.phase === 'countdown'
        ? String(m.countdown)
        : `${String(Math.floor(m.timeLeft / 60)).padStart(2, '0')}:${String(m.timeLeft % 60).padStart(2, '0')}`
  text(ctx, label, x + w / 2, y + 10, compact ? 14 : 17, m.phase === 'playing' ? color : '#FFD166', 'center')

  // Segmented pixel progress bar.
  const barX = x + 8
  const barY = y + h - 20
  const barW = w - 16
  const segs = 12
  const segW = Math.floor((barW - (segs - 1) * 2) / segs)
  for (let i = 0; i < segs; i++) {
    const filled = i / segs < ratio
    ctx.fillStyle = filled ? color : 'rgba(255,255,255,0.12)'
    ctx.fillRect(barX + i * (segW + 2), barY, segW, 5)
  }
  text(
    ctx,
    m.phase === 'over' ? (m.overReason === 'hp' ? copy.gameOver : copy.timesUp) : `${m.difficulty} · ${copy.miss} ${m.missed}`,
    x + w / 2,
    y + h - 11,
    compact ? 5 : 6,
    MUTED_INK,
    'center',
  )
}

function drawControls(ctx: Ctx, m: UiModel, scene: UiScene, compact: boolean): UiHitBox[] {
  const size = compact ? 32 : 38
  const gap = 6
  const pad = compact ? 8 : 14
  const y = compact ? 8 : 12
  const pauseX = scene.w - pad - size
  const muteX = pauseX - gap - size
  const boxes: UiHitBox[] = []

  panel(ctx, muteX, y, size, size, '#46545F', PANEL_BG_DEEP, false)
  drawSoundIcon(ctx, muteX + size / 2 - 7, y + size / 2 - 8, m.muted, INK)
  boxes.push({ action: 'mute', x: muteX, y, w: size, h: size })

  panel(ctx, pauseX, y, size, size, '#46545F', PANEL_BG_DEEP, false)
  drawPauseIcon(ctx, pauseX + size / 2 - 6, y + size / 2 - 7, m.phase === 'paused', INK)
  boxes.push({ action: 'pause', x: pauseX, y, w: size, h: size })

  if (!compact) {
    text(
      ctx,
      m.phase === 'playing' ? 'ENTER = START · ESC = PAUSE' : 'CLICK OR PRESS ENTER',
      scene.w - pad,
      y + size + 8,
      6,
      MUTED_INK,
      'right',
    )
  }
  return boxes
}

function drawTargetRibbon(ctx: Ctx, m: UiModel, scene: UiScene, copy: Copy, compact: boolean): void {
  if (m.phase !== 'playing' || !m.targetWord) return
  const font = compact ? 10 : 13
  const chars = Array.from(m.targetWord)
  const start = Math.max(0, m.targetTyped - 10)
  const end = Math.min(chars.length, m.targetTyped + 24)
  const visible = chars.slice(start, end)
  const charW = (value: string) => measure(ctx, value, font)

  const labelSize = compact ? 6 : 7
  const contentW = visible.reduce((sum, ch) => sum + charW(ch === ' ' ? '_' : ch), 0)
  const w = Math.min(scene.w - 16, Math.max(compact ? 190 : 240, contentW + 40))
  const h = compact ? 52 : 60
  const x = Math.round(scene.w / 2 - w / 2)
  const y = scene.h - h - (compact ? 14 : 20)
  panel(ctx, x, y, w, h, scene.theme.accent)

  text(ctx, copy.lockedWord, x + w / 2, y + 8, labelSize, scene.theme.accentSoft, 'center')

  let cx = x + w / 2 - contentW / 2
  const baseline = y + h - (compact ? 20 : 22)
  for (let i = 0; i < visible.length; i++) {
    const index = start + i
    const ch = visible[i]
    const glyph = ch === ' ' ? '_' : ch
    const cw = charW(glyph)
    const typed = index < m.targetTyped
    const current = index === m.targetTyped
    if (current) {
      ctx.fillStyle = scene.theme.accent
      ctx.fillRect(cx - 2, baseline - 3, cw + 4, font + 6)
      text(ctx, glyph, cx + cw / 2, baseline, font, '#171004', 'center')
    } else {
      text(ctx, glyph, cx + cw / 2, baseline, font, typed ? 'rgba(125,220,143,0.45)' : INK, 'center')
      if (typed) {
        ctx.fillStyle = 'rgba(125,220,143,0.5)'
        ctx.fillRect(cx, baseline + font / 2 + 1, cw, 1)
      }
    }
    cx += cw
  }
  if (start > 0) text(ctx, '<', x + 8, baseline, font, MUTED_INK)
  if (end < chars.length) text(ctx, '>', x + w - 8, baseline, font, MUTED_INK)

  // Progress fill along the bottom edge of the ribbon.
  const progress = chars.length > 0 ? m.targetTyped / chars.length : 0
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  ctx.fillRect(x + 10, y + h - 8, w - 20, 3)
  ctx.fillStyle = '#7DDC8F'
  ctx.fillRect(x + 10, y + h - 8, Math.round((w - 20) * progress), 3)
}

/* ------------------------------------------------------------------ */
/* Overlays                                                            */
/* ------------------------------------------------------------------ */

function overlayTitle(ctx: Ctx, label: string, x: number, y: number, w: number, size: number, color: string): void {
  text(ctx, label, x + w / 2, y, size, color, 'center')
}

function drawReady(
  ctx: Ctx,
  m: UiModel,
  scene: UiScene,
  copy: Copy,
  compact: boolean,
): UiHitBox[] {
  const w = Math.min(scene.w - 20, 470)
  const inner = compact ? 14 : 20
  const bodySize = compact ? 7 : 8
  const bodyLine = bodySize + 8
  const descLines = wrap(ctx, copy.readyBody, w - inner * 2, bodySize)
  const howLines = wrap(ctx, copy.howToPlayBody, w - inner * 2 - 20, bodySize)
  const titleSize = compact ? 11 : 15
  const topPad = compact ? 16 : 22
  const subH = howLines.length * bodyLine + (compact ? 26 : 30)
  const btnH = compact ? 36 : 42
  const footerSize = compact ? 6 : 7
  const h = Math.min(
    scene.h - 16,
    topPad +
      titleSize +
      14 +
      16 +
      descLines.length * bodyLine +
      10 +
      subH +
      10 +
      btnH +
      10 +
      footerSize +
      14,
  )

  const x = Math.round(scene.w / 2 - w / 2)
  const y = Math.round((scene.h - h) / 2)
  panel(ctx, x, y, w, h, scene.theme.accent)

  let cy = y + topPad
  overlayTitle(ctx, copy.readyTitle, x, cy, w, titleSize, '#FFD166')
  cy += titleSize + 14
  text(
    ctx,
    `${scene.nativeName} · ${m.difficulty} · ${m.durationSec}s`,
    x + w / 2,
    cy,
    compact ? 6 : 7,
    scene.theme.accentSoft,
    'center',
  )
  cy += 16

  for (const line of descLines) {
    text(ctx, line, x + w / 2, cy, bodySize, INK, 'center')
    cy += bodyLine
  }
  cy += 10

  // How-to-play block.
  const subX = x + inner / 2
  const subW = w - inner
  panel(ctx, subX, cy, subW, subH, '#33414D', PANEL_BG_DEEP, false)
  let sy = cy + 10
  text(ctx, copy.howToPlay, subX + 10, sy, compact ? 6 : 7, '#7DDC8F')
  sy += compact ? 14 : 16
  for (const line of howLines) {
    text(ctx, line, subX + 10, sy, bodySize, MUTED_INK)
    sy += bodyLine
  }
  cy += subH + 10

  const btnX = x + inner / 2
  const btnW = w - inner
  button(ctx, btnX, cy, btnW, btnH, copy.startRun, compact ? 7 : 9, '#2FA36B', '#8BE3AE', '#06120C')
  const btnY = cy
  cy += btnH + 10
  text(
    ctx,
    `${copy.difficulty}: ${m.difficulty} · ${m.durationSec}s`,
    x + w / 2,
    cy,
    footerSize,
    MUTED_INK,
    'center',
  )

  return [{ action: 'start', x: btnX, y: btnY, w: btnW, h: btnH }]
}

function drawPauseOverlay(
  ctx: Ctx,
  scene: UiScene,
  copy: Copy,
  compact: boolean,
): UiHitBox[] {
  const w = Math.min(scene.w - 24, 360)
  const inner = compact ? 14 : 18
  const titleSize = compact ? 14 : 18
  const bodySize = compact ? 7 : 8
  const h = compact ? 186 : 208
  const x = Math.round(scene.w / 2 - w / 2)
  const y = Math.round((scene.h - h) / 2)
  panel(ctx, x, y, w, h, scene.theme.accent)

  overlayTitle(ctx, copy.paused, x, y + 24, w, titleSize, '#FFD166')
  text(ctx, copy.pausedBody, x + w / 2, y + 24 + titleSize + 14, bodySize, MUTED_INK, 'center')

  const btnH = compact ? 34 : 40
  const gap = 10
  const btnW = (w - inner * 2 - gap) / 2
  const by = y + h - btnH - (compact ? 20 : 24)
  button(ctx, x + inner, by, btnW, btnH, copy.resume, compact ? 7 : 9, '#2FA36B', '#8BE3AE', '#06120C')
  button(ctx, x + inner + btnW + gap, by, btnW, btnH, copy.restart, compact ? 7 : 9, '#28333E', '#5E6E7C', INK)

  return [
    { action: 'resume', x: x + inner, y: by, w: btnW, h: btnH },
    { action: 'restart', x: x + inner + btnW + gap, y: by, w: btnW, h: btnH },
  ]
}

function drawGameOver(
  ctx: Ctx,
  m: UiModel,
  scene: UiScene,
  copy: Copy,
  compact: boolean,
): void {
  const w = Math.min(scene.w - 20, 400)
  const inner = compact ? 14 : 18
  const titleSize = compact ? 13 : 17
  const rowSize = compact ? 7 : 8
  const rowH = rowSize + 12
  const rows: [string, string, string][] = [
    [copy.score, m.score.toLocaleString(), '#FFD166'],
    [copy.wpm, String(m.wpm), '#7DDC8F'],
    [copy.acc, `${m.acc}%`, '#79C8F2'],
    [copy.longestCombo, String(m.maxCombo), '#FFD166'],
    [copy.cratesSlain, String(m.kills), '#C0A6F0'],
    [copy.cratesMissed, String(m.missed), '#F08A82'],
  ]
  const h = Math.min(scene.h - 16, 64 + rows.length * rowH + 34)
  const x = Math.round(scene.w / 2 - w / 2)
  const y = Math.round((scene.h - h) / 2)
  panel(ctx, x, y, w, h, scene.theme.accent)

  overlayTitle(ctx, m.overReason === 'hp' ? copy.gameOver : copy.timesUp, x, y + 20, w, titleSize, m.overReason === 'hp' ? '#F2645A' : '#FFD166')

  let cy = y + 20 + titleSize + 20
  const colW = w - inner * 2
  for (const [label, value, color] of rows) {
    statRow(ctx, label, value, x + inner, cy, colW, rowSize, MUTED_INK, color)
    cy += rowH
  }
  text(ctx, copy.saving, x + w / 2, cy + 4, compact ? 6 : 7, MUTED_INK, 'center')
}

function drawCountdown(ctx: Ctx, m: UiModel, scene: UiScene, compact: boolean): void {
  const size = compact ? 64 : 92
  text(ctx, String(m.countdown), scene.w / 2, scene.h / 2 - size * 0.85, size, '#FFD166', 'center')
  text(ctx, scene.nativeName, scene.w / 2, scene.h / 2 + 8, compact ? 7 : 9, INK, 'center')
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function drawPixelUi(
  ctx: Ctx,
  m: UiModel,
  scene: UiScene,
  copy: Copy,
): UiHitBox[] {
  const compact = scene.w < 720
  ctx.save()

  // A faint dark strip behind the top HUD keeps white text legible over the sky.
  ctx.fillStyle = 'rgba(6,10,14,0.32)'
  ctx.fillRect(0, 0, scene.w, compact ? 78 : 96)

  if (m.phase !== 'ready') drawStats(ctx, m, scene, copy, compact)
  drawTimer(ctx, m, scene, copy, compact)
  let boxes = drawControls(ctx, m, scene, compact)
  drawTargetRibbon(ctx, m, scene, copy, compact)

  if (m.phase === 'ready') {
    dim(ctx, scene.w, scene.h, 0.66)
    boxes = boxes.concat(drawReady(ctx, m, scene, copy, compact))
  } else if (m.phase === 'countdown') {
    drawCountdown(ctx, m, scene, compact)
  } else if (m.phase === 'paused') {
    dim(ctx, scene.w, scene.h, 0.7)
    boxes = boxes.concat(drawPauseOverlay(ctx, scene, copy, compact))
  } else if (m.phase === 'over') {
    dim(ctx, scene.w, scene.h, 0.72)
    drawGameOver(ctx, m, scene, copy, compact)
  }

  if (m.phase === 'playing' && scene.touchMode) {
    const bw = compact ? 150 : 180
    const bh = 28
    const bx = Math.round(scene.w / 2 - bw / 2)
    const by = scene.h - bh - (compact ? 72 : 86)
    panel(ctx, bx, by, bw, bh, '#46545F', PANEL_BG_DEEP, false)
    text(ctx, copy.tapKeyboard, bx + bw / 2, by + 9, compact ? 6 : 7, MUTED_INK, 'center')
    boxes.push({ action: 'focus', x: bx, y: by, w: bw, h: bh })
  }

  ctx.restore()
  return boxes
}
