import React, { useEffect, useRef, useState } from 'react'
import { RPGLevel } from '../../types/rpg.types'

interface Props {
  duniaId: number
  levels: RPGLevel[]
  onLevelGate: (level: RPGLevel) => boolean
  onLevelEnter: (level: RPGLevel) => void
  playerAvatar: string
  theme: 'english' | 'math' | 'logic'
}

const CANVAS_W = 960
const CANVAS_H = 540
const GROUND_Y = 440
const GRAVITY = 0.52
const JUMP_FORCE = -11.2
const MOVE_SPEED = 4.0
const MAX_FALL = 13
const PLAYER_W = 24
const PLAYER_H = 36
const WORLD_W = 3800
const DOOR_PROXIMITY = 56

const ATTACK_DURATION = 14
const ATTACK_COOLDOWN = 20
const ATTACK_RANGE_X = 42
const ATTACK_RANGE_Y = 30
const ATTACK_DAMAGE = 22

const COYOTE_FRAMES = 7
const JUMP_BUFFER_FRAMES = 8

const CONTACT_DAMAGE = 12
const SPIKE_DAMAGE = 15
const STOMP_DAMAGE = 28

interface ThemeColors {
  skyTop: string; skyBot: string; skyMid: string;
  groundTop: string; groundMid: string; groundBot: string;
  platform: string; platformEdge: string; platformTop: string;
  hillFar: string; hillMid: string; hillNear: string;
  accent: string; doorFrame: string; shopWood: string; shopRoof: string;
}

const THEMES: Record<string, ThemeColors> = {
  english: {
    skyTop: '#87CEEB', skyBot: '#E8F4FD', skyMid: '#C5E3F0',
    groundTop: '#7A9B6B', groundMid: '#6B8C5B', groundBot: '#5A7B4A',
    platform: '#A67C52', platformEdge: '#8B6A4A', platformTop: '#BFA07A',
    hillFar: '#8BB07A', hillMid: '#7A9B6B', hillNear: '#6B8C5B',
    accent: '#D97757', doorFrame: '#8B5E3C', shopWood: '#D2A679', shopRoof: '#A64A3A',
  },
  math: {
    skyTop: '#F0D9A0', skyBot: '#F5ECD5', skyMid: '#E8D5B0',
    groundTop: '#C9A46A', groundMid: '#B89355', groundBot: '#A78240',
    platform: '#D6BFA0', platformEdge: '#C2A880', platformTop: '#E2D0B8',
    hillFar: '#D4C090', hillMid: '#C9A46A', hillNear: '#B89355',
    accent: '#2C5F5D', doorFrame: '#7A6A50', shopWood: '#C2A880', shopRoof: '#8B6A4A',
  },
  logic: {
    skyTop: '#3A4A6B', skyBot: '#6B7FA0', skyMid: '#4A5A7B',
    groundTop: '#5A7B5A', groundMid: '#4A6B4A', groundBot: '#3A5B3A',
    platform: '#6B8A6B', platformEdge: '#5A7A5A', platformTop: '#7A9A7A',
    hillFar: '#4A6A4A', hillMid: '#3A5A3A', hillNear: '#2A4A2A',
    accent: '#E8A93B', doorFrame: '#5A4A3A', shopWood: '#8B7A6A', shopRoof: '#6A5A4A',
  },
}

interface Platform { x: number; y: number; w: number; h: number }
interface Door { x: number; level: RPGLevel }
interface Npc { x: number; y: number; type: string; name: string; talk: string }
interface Enemy {
  x: number; y: number; w: number; h: number; emoji: string; name: string;
  hp: number; maxHp: number; patrolL: number; patrolR: number;
  speed: number; dir: number; idleTimer: number; id: string;
  type: 'slime' | 'ghost' | 'skeleton' | 'spider' | 'ogre';
  flashTimer: number; vx: number;
}
interface Coin { x: number; y: number; collected: boolean; bob: number }
interface HeartDrop { x: number; y: number; collected: boolean; bob: number; timer: number }
interface Spike { x: number; y: number; w: number }
interface Checkpoint { x: number; y: number; activated: boolean }
interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
  color: string; size: number
}
interface DamageNumber { x: number; y: number; text: string; life: number; color: string }

function getWorldData(duniaId: number, levels: RPGLevel[]) {
  const platforms: Platform[] = [
    { x: 0, y: GROUND_Y, w: 440, h: 120 },
    { x: 520, y: GROUND_Y, w: 360, h: 120 },
    { x: 960, y: GROUND_Y, w: 320, h: 120 },
    { x: 1360, y: GROUND_Y, w: 280, h: 120 },
    { x: 1720, y: GROUND_Y, w: 400, h: 120 },
    { x: 2200, y: GROUND_Y, w: 340, h: 120 },
    { x: 2620, y: GROUND_Y, w: 380, h: 120 },
    { x: 3080, y: GROUND_Y, w: 320, h: 120 },
    { x: 3480, y: GROUND_Y, w: 320, h: 120 },

    { x: 200, y: 360, w: 120, h: 16 },
    { x: 460, y: 330, w: 100, h: 16 },
    { x: 680, y: 370, w: 110, h: 16 },
    { x: 880, y: 310, w: 130, h: 16 },
    { x: 1100, y: 350, w: 100, h: 16 },
    { x: 1340, y: 300, w: 120, h: 16 },
    { x: 1560, y: 360, w: 110, h: 16 },
    { x: 1800, y: 310, w: 130, h: 16 },
    { x: 2050, y: 360, w: 100, h: 16 },
    { x: 2280, y: 300, w: 120, h: 16 },
    { x: 2500, y: 350, w: 110, h: 16 },
    { x: 2720, y: 290, w: 130, h: 16 },
    { x: 2960, y: 340, w: 110, h: 16 },
    { x: 3200, y: 300, w: 120, h: 16 },
    { x: 3440, y: 350, w: 100, h: 16 },
  ]

  const doors: Door[] = levels.map((lvl, i) => ({ x: 200 + i * 560, level: lvl }))

  const npcs: Npc[] = duniaId === 1 ? [
    { x: 300, y: GROUND_Y, type: 'teacher', name: 'Bu Guru Siti', talk: 'Selamat datang di Desa Bahasa! Gunakan pedangmu [Enter/J] untuk lawan musuh!' },
    { x: 800, y: GROUND_Y, type: 'elder', name: 'Pak Pustaka', talk: 'Kumpulkan koin dan hati untuk tetap hidup. Hati pulihkan HP!' },
  ] : duniaId === 2 ? [
    { x: 300, y: GROUND_Y, type: 'sage', name: 'Prof. Aljabar', talk: 'Gurun ini penuh teka-teki angka! Hati-hati dengan paku di tanah!' },
    { x: 800, y: GROUND_Y, type: 'sage', name: 'Penyihir Hitung', talk: 'Lompat di atas musuh atau tekan Enter untuk menyerang!' },
  ] : [
    { x: 300, y: GROUND_Y, type: 'fairy', name: 'Peri Logika', talk: 'Hutan ini gelap dan berbahaya. Waspadalah!' },
    { x: 800, y: GROUND_Y, type: 'owl', name: 'Burung Hantu Bijak', talk: 'Kadang lebih aman menyerang dari jauh daripada melompat ke musuh.' },
  ]

  const enemyDefs: { x: number; patrolR: number; type: Enemy['type']; name: string; hp: number; speed: number; emoji: string }[] = duniaId === 1 ? [
    { x: 620, patrolR: 820, type: 'slime', name: 'Monster Typo', hp: 40, speed: 1.0, emoji: '🟢' },
    { x: 1050, patrolR: 1200, type: 'ghost', name: 'Hantu Grammar', hp: 50, speed: 0.8, emoji: '👻' },
    { x: 1800, patrolR: 2000, type: 'skeleton', name: 'Tulang Fonetik', hp: 60, speed: 1.2, emoji: '💀' },
    { x: 2700, patrolR: 2900, type: 'spider', name: 'Laba Huruf', hp: 45, speed: 1.5, emoji: '🕷️' },
  ] : duniaId === 2 ? [
    { x: 620, patrolR: 800, type: 'skeleton', name: 'Kalajengking Angka', hp: 45, speed: 1.1, emoji: '💀' },
    { x: 1100, patrolR: 1240, type: 'spider', name: 'Bug Hitungan', hp: 55, speed: 1.4, emoji: '🕷️' },
    { x: 1820, patrolR: 2020, type: 'ogre', name: 'Ogre Aljabar', hp: 70, speed: 0.7, emoji: '👹' },
    { x: 2700, patrolR: 2900, type: 'slime', name: 'Lendir Desimal', hp: 40, speed: 1.3, emoji: '🟢' },
  ] : [
    { x: 620, patrolR: 800, type: 'ghost', name: 'Zombie Bingung', hp: 50, speed: 0.9, emoji: '👻' },
    { x: 1100, patrolR: 1250, type: 'skeleton', name: 'Rangka Deduksi', hp: 60, speed: 1.1, emoji: '💀' },
    { x: 1820, patrolR: 2020, type: 'ogre', name: 'Ogre Teka-teki', hp: 80, speed: 0.6, emoji: '👹' },
    { x: 2700, patrolR: 2900, type: 'spider', name: 'Labalaba Logika', hp: 50, speed: 1.6, emoji: '🕷️' },
  ]

  const enemies: Enemy[] = enemyDefs.map((e, i) => ({
    x: e.x, y: GROUND_Y - 32, w: 28, h: 32,
    emoji: e.emoji, name: e.name, hp: e.hp, maxHp: e.hp,
    patrolL: e.x - 80, patrolR: e.patrolR, speed: e.speed,
    dir: 1, idleTimer: 0, id: `enemy-${duniaId}-${i}`,
    type: e.type, flashTimer: 0, vx: 0,
  }))

  const coins: Coin[] = []
  for (let i = 0; i < 40; i++) {
    coins.push({
      x: 100 + Math.random() * (WORLD_W - 200),
      y: GROUND_Y - 50 - Math.random() * 120,
      collected: false, bob: Math.random() * Math.PI * 2,
    })
  }

  const spikes: Spike[] = []
  const gapPositions = [440, 880, 1280, 1640, 2120, 2540, 3000, 3400]
  for (const gx of gapPositions) {
    for (let j = 0; j < 3; j++) {
      spikes.push({ x: gx + j * 26, y: GROUND_Y - 2, w: 24 })
    }
  }

  const heartDrops: HeartDrop[] = []

  const checkpoints: Checkpoint[] = [
    { x: 180, y: GROUND_Y, activated: false },
    { x: 1400, y: GROUND_Y, activated: false },
    { x: 2680, y: GROUND_Y, activated: false },
  ]

  return { platforms, doors, npcs, enemies, coins, spikes, heartDrops, checkpoints }
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}
function darker(hex: string, amt: number) {
  const c = hexToRgb(hex)
  return `rgb(${Math.max(0, c.r - amt)},${Math.max(0, c.g - amt)},${Math.max(0, c.b - amt)})`
}
function lighter(hex: string, amt: number) {
  const c = hexToRgb(hex)
  return `rgb(${Math.min(255, c.r + amt)},${Math.min(255, c.g + amt)},${Math.min(255, c.b + amt)})`
}

function drawPlayer(
  ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, frame: number,
  jumping: boolean, falling: boolean, theme: string, attackTimer: number, damageFlash: number
) {
  const px = Math.round(x)
  const py = Math.round(y)
  ctx.save()
  ctx.translate(px + PLAYER_W / 2, py + PLAYER_H)
  if (dir < 0) ctx.scale(-1, 1)
  ctx.translate(-PLAYER_W / 2, -PLAYER_H)

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.fillRect(-2, PLAYER_H - 2, PLAYER_W + 4, 4)

  const robeColor = theme === 'logic' ? '#6B5B9B' : '#5D3A9B'
  const hoodColor = darker(robeColor, 25)
  const trimColor = '#FFD93D'
  const skinColor = '#FDDCB5'
  const bootColor = '#3A2A1A'

  ctx.fillStyle = bootColor
  if (jumping || falling) {
    ctx.fillRect(2, PLAYER_H - 7, 8, 7)
    ctx.fillRect(14, PLAYER_H - 11, 8, 7)
  } else if (frame % 4 >= 2) {
    ctx.fillRect(2, PLAYER_H - 7, 8, 7)
    ctx.fillRect(14, PLAYER_H - 7, 8, 7)
  } else {
    const off = Math.sin(frame * 0.5) * 3
    ctx.fillRect(2 + off, PLAYER_H - 7, 8, 7)
    ctx.fillRect(14 - off, PLAYER_H - 7, 8, 7)
  }

  ctx.fillStyle = robeColor
  ctx.fillRect(3, 12, 18, 22)
  ctx.fillRect(1, 28, 22, 6)
  ctx.fillStyle = trimColor
  ctx.fillRect(3, 24, 18, 2)
  ctx.fillStyle = darker(robeColor, 15)
  ctx.fillRect(10, 14, 4, 16)

  ctx.fillStyle = hoodColor
  ctx.fillRect(4, 0, 16, 14)
  ctx.fillRect(2, 4, 20, 8)
  ctx.fillRect(7, -2, 10, 4)

  ctx.fillStyle = skinColor
  ctx.fillRect(6, 5, 12, 8)
  ctx.fillStyle = '#2A1A0A'
  ctx.fillRect(8, 7, 3, 3)
  ctx.fillRect(14, 7, 3, 3)
  ctx.fillStyle = '#FFF'
  ctx.fillRect(9, 7, 1, 1)
  ctx.fillRect(15, 7, 1, 1)
  ctx.fillStyle = '#C97064'
  ctx.fillRect(10, 10, 4, 1)
  ctx.fillStyle = trimColor
  ctx.fillRect(4, 12, 16, 1)

  if (attackTimer > 0) {
    const swingProgress = 1 - (attackTimer / ATTACK_DURATION)
    ctx.save()
    ctx.translate(20, 14)
    ctx.rotate(-0.5 + swingProgress * 1.8)
    ctx.fillStyle = '#8B6A4A'
    ctx.fillRect(-1, -2, 3, 18)
    ctx.fillStyle = '#C0C0C0'
    ctx.fillRect(-2, -14, 5, 14)
    ctx.fillStyle = '#E0E0E0'
    ctx.fillRect(-1, -13, 3, 12)
    ctx.fillStyle = trimColor
    ctx.fillRect(-2, -15, 5, 3)
    ctx.restore()
  } else {
    ctx.fillStyle = '#A67C52'
    ctx.fillRect(20, 6, 2, 26)
    ctx.fillStyle = darker('#A67C52', 20)
    ctx.fillRect(20, 6, 1, 26)
    ctx.fillStyle = trimColor
    ctx.fillRect(18, 2, 6, 6)
    ctx.fillStyle = lighter(trimColor, 40)
    ctx.fillRect(20, 3, 2, 2)
  }

  ctx.fillStyle = robeColor
  if (frame % 8 < 4) {
    ctx.fillRect(0, 14, 5, 10)
  } else {
    ctx.fillRect(0, 16, 5, 8)
  }

  if (damageFlash > 0 && damageFlash % 4 < 2) {
    ctx.fillStyle = 'rgba(255,60,60,0.4)'
    ctx.fillRect(-2, -2, PLAYER_W + 4, PLAYER_H + 4)
  }

  ctx.restore()
}

function drawEnemySprite(
  ctx: CanvasRenderingContext2D, ex: number, ey: number, w: number, h: number,
  dir: number, frame: number, hp: number, maxHp: number, type: Enemy['type'], flashTimer: number
) {
  const px = Math.round(ex)
  const py = Math.round(ey)
  ctx.save()
  ctx.translate(px + w / 2, py + h)
  if (dir < 0) ctx.scale(-1, 1)
  ctx.translate(-w / 2, -h)

  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(-2, h - 2, w + 4, 4)

  if (flashTimer > 0) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
  } else if (type === 'slime') {
    const bounce = Math.abs(Math.sin(frame * 0.06)) * 4
    ctx.fillStyle = '#44BB44'
    ctx.fillRect(3, h - 14 - bounce, w - 6, 14 - bounce)
    ctx.fillRect(1, h - 10 - bounce, w - 2, 10)
    ctx.fillStyle = '#66DD66'
    ctx.fillRect(5, h - 12 - bounce, w - 10, 6)
    ctx.fillStyle = '#FFF'
    ctx.fillRect(7, h - 11 - bounce, 4, 4)
    ctx.fillRect(w - 11, h - 11 - bounce, 4, 4)
    ctx.fillStyle = '#1A3A1A'
    ctx.fillRect(8, h - 10 - bounce, 2, 2)
    ctx.fillRect(w - 10, h - 10 - bounce, 2, 2)
    ctx.fillStyle = '#FF6B6B'
    ctx.fillRect(10, h - 6 - bounce, w - 20, 2)
  } else if (type === 'ghost') {
    const floatY = Math.sin(frame * 0.04) * 6
    ctx.fillStyle = 'rgba(200,200,255,0.7)'
    ctx.fillRect(4, floatY, w - 8, h - 10)
    ctx.fillRect(2, floatY + 4, w - 4, h - 14)
    ctx.fillStyle = 'rgba(180,180,240,0.5)'
    ctx.fillRect(0, floatY + h - 12, 6, 10)
    ctx.fillRect(w - 6, floatY + h - 12, 6, 10)
    ctx.fillRect(w / 2 - 3, floatY + h - 8, 6, 8)
    ctx.fillStyle = '#FF4444'
    ctx.fillRect(6, floatY + 6, 5, 5)
    ctx.fillRect(w - 11, floatY + 6, 5, 5)
    ctx.fillStyle = '#FFF'
    ctx.fillRect(7, floatY + 6, 2, 2)
    ctx.fillRect(w - 10, floatY + 6, 2, 2)
  } else if (type === 'skeleton') {
    ctx.fillStyle = '#E8E0D0'
    ctx.fillRect(6, 0, w - 12, 12)
    ctx.fillRect(4, 4, w - 8, 8)
    ctx.fillStyle = '#2A1A0A'
    ctx.fillRect(7, 3, 4, 4)
    ctx.fillRect(w - 11, 3, 4, 4)
    ctx.fillStyle = '#C0B0A0'
    ctx.fillRect(9, 8, w - 18, 3)
    ctx.fillRect(10, 9, 1, 2)
    ctx.fillRect(w - 11, 9, 1, 2)
    ctx.fillStyle = '#D0C0B0'
    ctx.fillRect(8, 12, w - 16, 16)
    ctx.fillStyle = '#C0B0A0'
    ctx.fillRect(10, 14, 2, 10)
    ctx.fillRect(w - 12, 14, 2, 10)
    ctx.fillStyle = '#B0A090'
    const legOff = Math.sin(frame * 0.3) * 2
    ctx.fillRect(4 + legOff, h - 6, 6, 6)
    ctx.fillRect(w - 10 - legOff, h - 6, 6, 6)
  } else if (type === 'spider') {
    ctx.fillStyle = '#3A2A2A'
    ctx.fillRect(6, 6, w - 12, h - 12)
    ctx.fillStyle = '#4A3A3A'
    ctx.fillRect(4, 4, w - 8, h - 8)
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(7, 8, 3, 3)
    ctx.fillRect(w - 10, 8, 3, 3)
    ctx.fillStyle = '#FF4444'
    ctx.fillRect(9, 8, 1, 1)
    ctx.fillRect(w - 9, 8, 1, 1)
    ctx.fillStyle = '#2A1A1A'
    const legAnim = Math.sin(frame * 0.15) * 3
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(0, 8 + i * 6 + legAnim, 6, 2)
      ctx.fillRect(w - 6, 8 + i * 6 - legAnim, 6, 2)
    }
  } else {
    ctx.fillStyle = '#6A5A4A'
    ctx.fillRect(4, 4, w - 8, h - 8)
    ctx.fillRect(2, 8, w - 4, h - 14)
    ctx.fillStyle = '#8A7A6A'
    ctx.fillRect(6, 0, w - 12, 12)
    ctx.fillStyle = '#FF4444'
    ctx.fillRect(7, 3, 4, 4)
    ctx.fillRect(w - 11, 3, 4, 4)
    ctx.fillStyle = '#FFF'
    ctx.fillRect(8, 3, 2, 2)
    ctx.fillRect(w - 10, 3, 2, 2)
    ctx.fillStyle = '#4A3A2A'
    ctx.fillRect(8, 9, w - 16, 3)
    ctx.fillStyle = '#5A4A3A'
    const legOff2 = Math.sin(frame * 0.25) * 2
    ctx.fillRect(2 + legOff2, h - 6, 8, 6)
    ctx.fillRect(w - 10 - legOff2, h - 6, 8, 6)
  }

  ctx.restore()

  const barW = w + 10
  const barH = 4
  const bx = px - 5
  const by = py - 10
  ctx.fillStyle = '#1A0A0A'
  ctx.fillRect(bx, by, barW, barH)
  ctx.fillStyle = hp / maxHp > 0.5 ? '#44AA44' : hp / maxHp > 0.25 ? '#E8A93B' : '#FF4444'
  ctx.fillRect(bx, by, barW * (hp / maxHp), barH)
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(bx, by, barW, barH)
}

function drawNpc(ctx: CanvasRenderingContext2D, nx: number, ny: number, type: string, frame: number) {
  const px = Math.round(nx)
  const py = Math.round(ny)
  const bob = Math.sin(frame * 0.04) * 2
  ctx.save()
  ctx.translate(px + 12, py + bob)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(-10, 36, 24, 3)
  const bodyColor = type === 'teacher' ? '#E8A93B' : type === 'sage' ? '#2C5F5D' : type === 'fairy' ? '#D97757' : '#8B7A6A'
  const headColor = type === 'owl' ? '#8B7A6A' : '#FDDCB5'
  ctx.fillStyle = bodyColor
  ctx.fillRect(-6, 10, 16, 24)
  ctx.fillStyle = headColor
  ctx.fillRect(-4, 0, 12, 12)
  ctx.fillStyle = '#2A1A0A'
  ctx.fillRect(-1, 3, 2, 2)
  ctx.fillRect(4, 3, 2, 2)
  ctx.fillStyle = '#C97064'
  ctx.fillRect(0, 7, 4, 1)
  if (type === 'teacher') {
    ctx.fillStyle = '#FFF'
    ctx.fillRect(8, 14, 8, 10)
    ctx.fillStyle = '#D97757'
    ctx.fillRect(8, 14, 1, 10)
  } else if (type === 'sage') {
    ctx.fillStyle = darker(bodyColor, 30)
    ctx.fillRect(-6, -6, 16, 6)
    ctx.fillRect(-2, -10, 8, 6)
  } else if (type === 'fairy') {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillRect(-12, 8, 8, 16)
    ctx.fillRect(12, 8, 8, 16)
  } else if (type === 'owl') {
    ctx.fillStyle = '#6A5A4A'
    ctx.fillRect(-4, -6, 4, 6)
    ctx.fillRect(6, -6, 4, 6)
  }
  ctx.fillStyle = '#FFD93D'
  const excBob = Math.sin(frame * 0.08) * 3
  ctx.font = 'bold 14px monospace'
  ctx.fillText('!', -2, -14 + excBob)
  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D, camX: number, frame: number, theme: string) {
  if (!ctx) return
  const c = THEMES[theme]
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  skyGrad.addColorStop(0, c.skyTop)
  skyGrad.addColorStop(0.5, c.skyMid)
  skyGrad.addColorStop(1, c.skyBot)
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

  if (theme === 'logic') {
    ctx.fillStyle = '#E8E0D0'
    ctx.beginPath()
    ctx.arc(780, 60, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = c.skyTop
    ctx.beginPath()
    ctx.arc(790, 55, 24, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    for (let i = 0; i < 20; i++) {
      const sx = (i * 137 + 50) % CANVAS_W
      const sy = (i * 89 + 20) % (GROUND_Y - 100)
      const twinkle = Math.sin(frame * 0.03 + i) * 0.3 + 0.7
      ctx.globalAlpha = twinkle * 0.6
      ctx.fillRect(sx, sy, 2, 2)
    }
    ctx.globalAlpha = 1
  } else {
    const sunX = theme === 'english' ? 120 : 800
    const sunY = theme === 'english' ? 70 : 50
    ctx.fillStyle = theme === 'english' ? '#FFE066' : '#F0C878'
    ctx.beginPath()
    ctx.arc(sunX, sunY, 24, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = lighter(theme === 'english' ? '#FFE066' : '#F0C878', 30)
    ctx.beginPath()
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = c.hillFar
  const hillOff1 = -(camX * 0.1) % CANVAS_W
  for (let i = -1; i <= 2; i++) {
    const hx = hillOff1 + i * 500
    ctx.beginPath()
    ctx.moveTo(hx, GROUND_Y)
    ctx.quadraticCurveTo(hx + 120, GROUND_Y - 90, hx + 250, GROUND_Y)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(hx + 200, GROUND_Y)
    ctx.quadraticCurveTo(hx + 330, GROUND_Y - 70, hx + 460, GROUND_Y)
    ctx.fill()
  }

  ctx.fillStyle = c.hillMid
  const hillOff2 = -(camX * 0.25) % CANVAS_W
  for (let i = -1; i <= 2; i++) {
    const hx = hillOff2 + i * 420
    ctx.beginPath()
    ctx.moveTo(hx, GROUND_Y)
    ctx.quadraticCurveTo(hx + 80, GROUND_Y - 55, hx + 200, GROUND_Y)
    ctx.fill()
  }

  if (theme === 'english') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    const cloudOff = -(camX * 0.15) % (CANVAS_W * 2)
    for (let i = 0; i < 5; i++) {
      const cx = cloudOff + i * 350
      const cy = 40 + (i % 3) * 30
      ctx.beginPath()
      ctx.arc(cx, cy, 20, 0, Math.PI * 2)
      ctx.arc(cx + 20, cy - 5, 25, 0, Math.PI * 2)
      ctx.arc(cx + 45, cy, 18, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = '#5A4A3A'
    ctx.lineWidth = 1.5
    const birdOff = -(camX * 0.2) % (CANVAS_W * 1.5)
    for (let i = 0; i < 4; i++) {
      const bx = birdOff + i * 400
      const by = 80 + (i % 2) * 25
      const wing = Math.sin(frame * 0.08 + i * 2) * 4
      ctx.beginPath()
      ctx.moveTo(bx - 6, by + wing)
      ctx.lineTo(bx, by)
      ctx.lineTo(bx + 6, by + wing)
      ctx.stroke()
    }
  } else if (theme === 'math') {
    ctx.fillStyle = lighter(c.hillFar, 15)
    const pyrOff = -(camX * 0.15) % (CANVAS_W * 1.5)
    for (let i = 0; i < 3; i++) {
      const px = pyrOff + i * 500
      ctx.beginPath()
      ctx.moveTo(px, GROUND_Y)
      ctx.lineTo(px + 60, GROUND_Y - 80)
      ctx.lineTo(px + 120, GROUND_Y)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,200,0.05)'
    for (let i = 0; i < 15; i++) {
      const sx = (i * 73 + frame * 0.3) % CANVAS_W
      const sy = GROUND_Y - 20 + Math.sin(frame * 0.02 + i) * 8
      ctx.fillRect(sx, sy, 40, 3)
    }
  } else {
    ctx.fillStyle = 'rgba(100,120,150,0.08)'
    const fogOff = -(camX * 0.2) % (CANVAS_W * 2)
    for (let i = 0; i < 6; i++) {
      const fx = fogOff + i * 300
      const fy = GROUND_Y - 40 - i * 15
      ctx.beginPath()
      ctx.ellipse(fx, fy, 150, 15, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(200,220,255,0.4)'
    for (let i = 0; i < 12; i++) {
      const partX = (i * 97 + frame * 0.5) % CANVAS_W
      const partY = 80 + Math.sin(frame * 0.015 + i * 1.3) * 60
      const sz = 1 + Math.sin(frame * 0.02 + i) * 0.8
      ctx.fillRect(partX, partY, sz, sz)
    }
  }
}

function drawForeground(ctx: CanvasRenderingContext2D, camX: number, frame: number, theme: string) {
  if (!ctx) return
  const detailOff = -(camX * 0.6) % 200
  for (let i = -1; i <= Math.ceil(CANVAS_W / 180) + 1; i++) {
    const dx = detailOff + i * 180 + (i * 37 % 40)
    if (theme === 'english') {
      const fy = GROUND_Y - 6
      ctx.fillStyle = '#5A8A3A'
      ctx.fillRect(dx + 3, fy - 8, 2, 8)
      ctx.fillStyle = i % 3 === 0 ? '#FF6B6B' : i % 3 === 1 ? '#FFD93D' : '#FF69B4'
      ctx.fillRect(dx + 1, fy - 12, 6, 5)
      ctx.fillStyle = '#FFD93D'
      ctx.fillRect(dx + 3, fy - 11, 2, 2)
    } else if (theme === 'math') {
      const cy = GROUND_Y - 20
      ctx.fillStyle = '#5A8A3A'
      ctx.fillRect(dx + 4, cy, 6, 20)
      ctx.fillRect(dx, cy + 4, 4, 6)
      ctx.fillRect(dx + 10, cy + 8, 4, 6)
      if (i % 4 === 0) {
        ctx.fillStyle = '#FF6B6B'
        ctx.fillRect(dx + 4, cy - 3, 6, 4)
      }
    } else {
      const my = GROUND_Y - 8
      ctx.fillStyle = '#C9A86A'
      ctx.fillRect(dx + 3, my - 4, 4, 10)
      ctx.fillStyle = i % 2 === 0 ? '#D97757' : '#8B4A2A'
      ctx.fillRect(dx, my - 8, 10, 5)
      ctx.fillStyle = '#FFF'
      ctx.fillRect(dx + 2, my - 7, 2, 2)
      ctx.fillRect(dx + 6, my - 6, 2, 2)
    }
  }
}

function drawShop(ctx: CanvasRenderingContext2D, sx: number, sy: number, c: ThemeColors, frame: number) {
  if (!ctx) return
  const px = Math.round(sx)
  const py = Math.round(sy)
  ctx.fillStyle = c.shopWood
  ctx.fillRect(px, py - 50, 80, 50)
  ctx.fillStyle = darker(c.shopWood, 20)
  ctx.fillRect(px, py - 50, 80, 3)
  ctx.fillStyle = darker(c.shopWood, 15)
  ctx.fillRect(px - 4, py - 20, 88, 8)
  ctx.fillStyle = c.shopRoof
  ctx.fillRect(px - 8, py - 68, 96, 18)
  ctx.fillStyle = darker(c.shopRoof, 15)
  ctx.fillRect(px - 8, py - 68, 96, 3)
  ctx.fillStyle = '#FF4444'
  ctx.fillRect(px + 10, py - 28, 8, 8)
  ctx.fillStyle = '#44AA44'
  ctx.fillRect(px + 24, py - 28, 8, 8)
  ctx.fillStyle = '#4444FF'
  ctx.fillRect(px + 38, py - 28, 8, 8)
  ctx.fillStyle = '#FDDCB5'
  ctx.fillRect(px + 55, py - 44, 12, 10)
  ctx.fillStyle = '#8B4A2A'
  ctx.fillRect(px + 55, py - 50, 12, 6)
  ctx.fillStyle = '#C94C4C'
  ctx.fillRect(px + 55, py - 34, 14, 20)
  const bob = Math.sin(frame * 0.06) * 2
  ctx.fillStyle = '#FFD93D'
  ctx.font = 'bold 9px monospace'
  ctx.fillText('SHOP', px + 18, py - 56 + bob)
}

function drawDoor(ctx: CanvasRenderingContext2D, dx: number, dy: number, level: RPGLevel, frame: number, isNear: boolean) {
  const px = Math.round(dx)
  const py = Math.round(dy)
  const isLocked = level.status === 'LOCKED'
  const isCompleted = level.status === 'COMPLETED'

  ctx.fillStyle = isLocked ? '#4A4A5A' : isCompleted ? '#3A7A3A' : '#8B5E3C'
  ctx.fillRect(px - 2, py - 68, 36, 70)
  ctx.fillStyle = isLocked ? '#3A3A4A' : isCompleted ? '#4A8A4A' : '#A67C52'
  ctx.fillRect(px, py - 66, 32, 66)
  ctx.fillStyle = isLocked ? '#6A6A7A' : '#FFD93D'
  ctx.fillRect(px + 24, py - 34, 4, 4)
  ctx.fillStyle = isLocked ? '#5A5A6A' : isCompleted ? '#5A9A5A' : '#BFA07A'
  ctx.fillRect(px + 2, py - 64, 28, 8)

  ctx.font = '14px serif'
  const icon = isLocked ? '🔒' : isCompleted ? '✅' : '🚪'
  ctx.fillText(icon, px + 4, py - 42)

  ctx.fillStyle = isLocked ? '#6A6A7A' : '#FFF'
  ctx.font = 'bold 10px monospace'
  ctx.fillText(`Lv${level.id}`, px + 4, py - 18)

  ctx.fillStyle = '#6A5A4A'
  ctx.fillRect(px + 14, py + 2, 4, 16)

  const signBob = isNear ? Math.sin(frame * 0.12) * 2 : 0
  ctx.fillStyle = '#3A2A1A'
  ctx.fillRect(px - 4, py - 82 + signBob, 44, 14)
  ctx.fillStyle = '#C9A86A'
  ctx.font = 'bold 7px monospace'
  const name = level.nama.length > 8 ? level.nama.slice(0, 8) + '..' : level.nama
  ctx.fillText(name, px, py - 73 + signBob)

  if (isNear && !isLocked) {
    ctx.strokeStyle = isCompleted ? 'rgba(100,200,100,0.6)' : 'rgba(232,169,59,0.6)'
    ctx.lineWidth = 2
    const glowSize = Math.sin(frame * 0.08) * 2
    ctx.strokeRect(px - 6 - glowSize, py - 72 - glowSize, 44 + glowSize * 2, 76 + glowSize * 2)
  }
}

function drawSpikes(ctx: CanvasRenderingContext2D, spikes: Spike[], camX: number) {
  for (const spike of spikes) {
    const sx = Math.round(spike.x - camX)
    const sy = Math.round(spike.y)
    if (sx < -30 || sx > CANVAS_W + 30) continue
    ctx.fillStyle = '#8B2020'
    ctx.beginPath()
    ctx.moveTo(sx, sy + 2)
    ctx.lineTo(sx + spike.w / 2, sy - 18)
    ctx.lineTo(sx + spike.w, sy + 2)
    ctx.fill()
    ctx.fillStyle = '#AA3030'
    ctx.beginPath()
    ctx.moveTo(sx + 3, sy + 2)
    ctx.lineTo(sx + spike.w / 2, sy - 12)
    ctx.lineTo(sx + spike.w - 3, sy + 2)
    ctx.fill()
    ctx.fillStyle = '#CC4444'
    ctx.beginPath()
    ctx.moveTo(sx + 6, sy + 2)
    ctx.lineTo(sx + spike.w / 2, sy - 6)
    ctx.lineTo(sx + spike.w - 6, sy + 2)
    ctx.fill()
  }
}

function drawHeartDrop(ctx: CanvasRenderingContext2D, hd: HeartDrop, camX: number, frame: number) {
  if (hd.collected) return
  const hx = Math.round(hd.x - camX)
  const hy = Math.round(hd.y + Math.sin(hd.bob) * 4)
  if (hx < -20 || hx > CANVAS_W + 20) return
  const pulse = 1 + Math.sin(frame * 0.1) * 0.1
  ctx.save()
  ctx.translate(hx, hy)
  ctx.scale(pulse, pulse)
  ctx.fillStyle = '#FF4444'
  ctx.beginPath()
  ctx.moveTo(0, 3)
  ctx.bezierCurveTo(-8, -4, -8, -10, 0, -6)
  ctx.bezierCurveTo(8, -10, 8, -4, 0, 3)
  ctx.fill()
  ctx.fillStyle = '#FF8888'
  ctx.beginPath()
  ctx.moveTo(-2, 0)
  ctx.bezierCurveTo(-6, -4, -5, -8, -1, -5)
  ctx.fill()
  ctx.restore()
}

function drawCheckpoint(ctx: CanvasRenderingContext2D, cp: Checkpoint, camX: number, frame: number) {
  const cx = Math.round(cp.x - camX)
  const cy = Math.round(cp.y)
  if (cx < -30 || cx > CANVAS_W + 30) return
  ctx.fillStyle = '#6A5A4A'
  ctx.fillRect(cx, cy - 50, 4, 52)
  if (cp.activated) {
    const wave = Math.sin(frame * 0.1) * 3
    ctx.fillStyle = '#FFD93D'
    ctx.fillRect(cx + 4, cy - 50 + wave, 16, 12)
    ctx.fillStyle = '#FF4444'
    ctx.fillRect(cx + 4, cy - 38 + wave, 16, 12)
  } else {
    ctx.fillStyle = '#8A7A6A'
    ctx.fillRect(cx + 4, cy - 50, 16, 12)
    ctx.fillStyle = '#6A5A4A'
    ctx.fillRect(cx + 4, cy - 38, 16, 12)
  }
}

export const PixelPlatformer: React.FC<Props> = ({ duniaId, levels, onLevelGate, onLevelEnter, playerAvatar, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGameOver, setIsGameOver] = useState(false)

  const onLevelGateRef = useRef(onLevelGate)
  const onLevelEnterRef = useRef(onLevelEnter)
  onLevelGateRef.current = onLevelGate
  onLevelEnterRef.current = onLevelEnter

  const gameOverCbRef = useRef<(() => void) | null>(null)
  const continueCbRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    ctx.imageSmoothingEnabled = false

    let gameRunning = true

    const player = {
      x: 120, y: GROUND_Y - PLAYER_H, vx: 0, vy: 0,
      dir: 1, grounded: false, frame: 0, jumpHeld: false,
      hp: 100, maxHp: 100, coins: 0,
      invTimer: 0, damageFlash: 0,
      attackTimer: 0, attackCooldown: 0, hasHitThisSwing: false,
      coyoteTimer: 0, jumpBufferTimer: 0,
      checkpointX: 120, checkpointY: GROUND_Y - PLAYER_H,
    }
    const cam = { x: 0, shakeX: 0, shakeY: 0, shakeIntensity: 0 }
    const keys: Record<string, boolean> = {}
    const world = getWorldData(duniaId, levels)
    let nearbyDoor: RPGLevel | null = null
    let particles: Particle[] = []
    let damageNumbers: DamageNumber[] = []
    let frame = 0
    let lastTime = performance.now()
    let raf = 0
    let touchL = false, touchR = false, touchJ = false, touchA = false

    gameOverCbRef.current = () => { gameRunning = false; setIsGameOver(true) }
    continueCbRef.current = () => {
      player.hp = player.maxHp
      player.x = player.checkpointX
      player.y = player.checkpointY
      player.vx = 0
      player.vy = 0
      player.invTimer = 120
      player.coins = Math.max(0, player.coins - 10)
      gameRunning = true
      lastTime = performance.now()
    }

    function addShake(intensity: number) {
      cam.shakeIntensity = Math.max(cam.shakeIntensity, intensity)
    }

    function spawnParticles(x: number, y: number, count: number, color: string, speed: number, size: number) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y, vx: (Math.random() - 0.5) * speed, vy: -Math.random() * speed * 0.8 - 1,
          life: 20 + Math.random() * 15, maxLife: 35, color,
          size: size * (0.5 + Math.random() * 0.5),
        })
      }
    }

    function addDamageNumber(x: number, y: number, text: string, color: string) {
      damageNumbers.push({ x, y: y - 10, text, life: 40, color })
    }

    function onGround(p: { x: number; y: number }): boolean {
      for (const plat of world.platforms) {
        if (p.x + PLAYER_W > plat.x + 4 && p.x < plat.x + plat.w - 4) {
          if (p.y + PLAYER_H >= plat.y && p.y + PLAYER_H <= plat.y + 16) {
            return true
          }
        }
      }
      return false
    }

    function collideX(p: { x: number; y: number }, nx: number) {
      for (const plat of world.platforms) {
        if (plat.h <= 20) continue
        if (nx + PLAYER_W > plat.x && nx < plat.x + plat.w &&
          p.y + PLAYER_H > plat.y + 4 && p.y < plat.y + plat.h - 4) {
          return true
        }
      }
      return false
    }

    function checkSpikeCollision(px: number, py: number): boolean {
      for (const spike of world.spikes) {
        if (px + PLAYER_W > spike.x + 4 && px < spike.x + spike.w - 4 &&
          py + PLAYER_H > spike.y - 14 && py + PLAYER_H < spike.y + 8) {
          return true
        }
      }
      return false
    }

    function update(dt: number) {
      if (!gameRunning) return

      let dx = 0
      if (keys['arrowleft'] || keys['a'] || touchL) { dx = -MOVE_SPEED; player.dir = -1 }
      if (keys['arrowright'] || keys['d'] || touchR) { dx = MOVE_SPEED; player.dir = 1 }

      if (dx === 0) {
        player.vx *= 0.7
        if (Math.abs(player.vx) < 0.2) player.vx = 0
      } else {
        player.vx = dx
      }

      const nx = player.x + player.vx
      if (!collideX(player, nx) && nx >= 0 && nx + PLAYER_W <= WORLD_W) {
        player.x = nx
      } else {
        player.vx = 0
      }

      const jumpKey = keys[' '] || keys['w'] || keys['arrowup'] || touchJ
      if (jumpKey && !player.jumpHeld) {
        player.jumpBufferTimer = JUMP_BUFFER_FRAMES
      }

      if (player.jumpBufferTimer > 0) player.jumpBufferTimer--

      if (player.jumpBufferTimer > 0 && player.grounded && !player.jumpHeld) {
        player.vy = JUMP_FORCE
        player.grounded = false
        player.jumpHeld = true
        player.jumpBufferTimer = 0
        player.coyoteTimer = 0
        spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H, 4, 'rgba(200,200,200,0.5)', 2, 2)
      }
      if (!jumpKey) player.jumpHeld = false

      if (!jumpKey && player.vy < -3) {
        player.vy = Math.max(player.vy, -3)
      }

      player.vy += GRAVITY
      if (player.vy > MAX_FALL) player.vy = MAX_FALL

      let ny = player.y + player.vy
      player.grounded = false

      for (const plat of world.platforms) {
        if (player.x + PLAYER_W > plat.x && player.x < plat.x + plat.w) {
          if (player.y + PLAYER_H <= plat.y + 4 && ny + PLAYER_H >= plat.y && player.vy >= 0) {
            ny = plat.y - PLAYER_H
            player.vy = 0
            player.grounded = true
            break
          }
          if (player.y >= plat.y + plat.h - 4 && ny <= plat.y + plat.h && player.vy < 0) {
            ny = plat.y + plat.h
            player.vy = 0
            break
          }
        }
      }

      player.y = ny
      player.x = Math.max(0, Math.min(WORLD_W - PLAYER_W, player.x))

      if (player.grounded) {
        player.coyoteTimer = COYOTE_FRAMES
      } else {
        if (player.coyoteTimer > 0) player.coyoteTimer--
      }

      if (player.attackTimer > 0) player.attackTimer--
      if (player.attackCooldown > 0) player.attackCooldown--

      const attackKey = keys['enter'] || keys['j'] || keys['x'] || touchA
      if (attackKey && player.attackCooldown <= 0 && player.attackTimer <= 0) {
        player.attackTimer = ATTACK_DURATION
        player.attackCooldown = ATTACK_DURATION + ATTACK_COOLDOWN
        player.hasHitThisSwing = false
        touchA = false
      }

      if (player.attackTimer > 3 && player.attackTimer < ATTACK_DURATION - 2 && !player.hasHitThisSwing) {
        const attackX = player.dir > 0 ? player.x + PLAYER_W : player.x - ATTACK_RANGE_X
        const attackRect = { x: attackX, y: player.y, w: ATTACK_RANGE_X, h: PLAYER_H }

        for (const e of world.enemies) {
          if (e.hp <= 0) continue
          if (attackRect.x < e.x + e.w && attackRect.x + attackRect.w > e.x &&
            attackRect.y < e.y + e.h && attackRect.y + attackRect.h > e.y) {
            e.hp -= ATTACK_DAMAGE
            e.flashTimer = 8
            e.vx = player.dir * 5
            player.hasHitThisSwing = true
            addShake(4)
            spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 6, '#FFD93D', 4, 3)
            addDamageNumber(e.x + e.w / 2, e.y, ATTACK_DAMAGE.toString(), '#FFD93D')

            if (e.hp <= 0) {
              player.coins += 5
              spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 12, '#FF6B6B', 6, 4)
              if (Math.random() < 0.35) {
                world.heartDrops.push({
                  x: e.x + e.w / 2, y: e.y, collected: false,
                  bob: Math.random() * Math.PI * 2, timer: 600,
                })
              }
            }
            break
          }
        }
      }

      for (const e of world.enemies) {
        if (e.hp <= 0) continue
        if (e.flashTimer > 0) e.flashTimer--

        if (e.idleTimer > 0) { e.idleTimer -= dt; continue }

        if (e.vx && Math.abs(e.vx) > 0.1) {
          e.x += e.vx
          e.vx *= 0.85
          if (e.x < e.patrolL) { e.x = e.patrolL; e.vx = e.speed; e.dir = 1 }
          if (e.x > e.patrolR) { e.x = e.patrolR; e.vx = -e.speed; e.dir = -1 }
        } else {
          e.x += e.speed * e.dir
          if (e.x <= e.patrolL || e.x >= e.patrolR) {
            e.dir *= -1
            e.idleTimer = 30 + Math.random() * 60
          }
        }

        if (player.invTimer <= 0) {
          if (player.x + PLAYER_W > e.x && player.x < e.x + e.w &&
            player.y + PLAYER_H > e.y && player.y < e.y + e.h) {
            if (player.vy > 0 && player.y + PLAYER_H < e.y + e.h * 0.5) {
              e.hp -= STOMP_DAMAGE
              e.flashTimer = 6
              player.vy = -9
              addShake(3)
              spawnParticles(e.x + e.w / 2, e.y, 6, '#FFD93D', 3, 2)
              addDamageNumber(e.x + e.w / 2, e.y, STOMP_DAMAGE.toString(), '#44FF44')

              if (e.hp <= 0) {
                player.coins += 5
                spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 12, '#FF6B6B', 6, 4)
                if (Math.random() < 0.35) {
                  world.heartDrops.push({
                    x: e.x + e.w / 2, y: e.y, collected: false,
                    bob: Math.random() * Math.PI * 2, timer: 600,
                  })
                }
              }
            } else {
              player.hp = Math.max(0, player.hp - CONTACT_DAMAGE)
              player.invTimer = 60
              player.damageFlash = 15
              player.vx = player.x < e.x + e.w / 2 ? -6 : 6
              player.vy = -5
              addShake(5)
              spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, 8, '#FF4444', 5, 3)
              addDamageNumber(player.x + PLAYER_W / 2, player.y, CONTACT_DAMAGE.toString(), '#FF4444')
            }
          }
        }
      }

      if (player.invTimer > 0) player.invTimer--
      if (player.damageFlash > 0) player.damageFlash--

      if (checkSpikeCollision(player.x, player.y) && player.invTimer <= 0) {
        player.hp = Math.max(0, player.hp - SPIKE_DAMAGE)
        player.invTimer = 60
        player.damageFlash = 15
        player.vy = -7
        addShake(5)
        spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H, 8, '#FF4444', 4, 2)
        addDamageNumber(player.x + PLAYER_W / 2, player.y, SPIKE_DAMAGE.toString(), '#FF4444')
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--
        if (p.life <= 0) particles.splice(i, 1)
      }

      for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i]
        d.y -= 1.2; d.life--
        if (d.life <= 0) damageNumbers.splice(i, 1)
      }

      for (const coin of world.coins) {
        if (coin.collected) continue
        coin.bob += 0.04
        const cy = coin.y + Math.sin(coin.bob) * 4
        if (Math.abs(player.x + PLAYER_W / 2 - coin.x) < 20 && Math.abs(player.y + PLAYER_H / 2 - cy) < 20) {
          coin.collected = true
          player.coins++
          spawnParticles(coin.x, cy, 6, '#FFD93D', 3, 2)
        }
      }

      for (const hd of world.heartDrops) {
        if (hd.collected) continue
        hd.bob += 0.05
        hd.timer--
        if (hd.timer <= 0) { hd.collected = true; continue }
        const hy = hd.y + Math.sin(hd.bob) * 4
        if (Math.abs(player.x + PLAYER_W / 2 - hd.x) < 22 && Math.abs(player.y + PLAYER_H / 2 - hy) < 22) {
          hd.collected = true
          player.hp = Math.min(player.maxHp, player.hp + 25)
          spawnParticles(hd.x, hy, 8, '#FF4444', 3, 2)
          addDamageNumber(hd.x, hy, '+25 HP', '#44FF44')
        }
      }

      for (const cp of world.checkpoints) {
        if (!cp.activated && Math.abs(player.x + PLAYER_W / 2 - cp.x) < 20 && Math.abs(player.y + PLAYER_H - cp.y) < 10) {
          cp.activated = true
          player.checkpointX = cp.x - PLAYER_W / 2
          player.checkpointY = cp.y - PLAYER_H
          spawnParticles(cp.x, cp.y - 25, 10, '#FFD93D', 4, 3)
        }
      }

      nearbyDoor = null
      for (const door of world.doors) {
        const dist = Math.abs(player.x + PLAYER_W / 2 - (door.x + 16))
        if (dist < DOOR_PROXIMITY) {
          nearbyDoor = door.level
          break
        }
      }

      const targetCam = player.x - CANVAS_W / 2 + PLAYER_W / 2
      cam.x += (targetCam - cam.x) * 0.08
      cam.x = Math.max(0, Math.min(WORLD_W - CANVAS_W, cam.x))

      if (cam.shakeIntensity > 0) {
        cam.shakeX = (Math.random() - 0.5) * cam.shakeIntensity * 2
        cam.shakeY = (Math.random() - 0.5) * cam.shakeIntensity * 2
        cam.shakeIntensity *= 0.85
        if (cam.shakeIntensity < 0.5) { cam.shakeIntensity = 0; cam.shakeX = 0; cam.shakeY = 0 }
      }

      if (player.hp <= 0) {
        spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, 20, '#FF4444', 8, 4)
        gameOverCbRef.current?.()
        return
      }

      if (player.y > CANVAS_H + 100) {
        player.x = player.checkpointX
        player.y = player.checkpointY
        player.vx = 0
        player.vy = 0
        player.hp = Math.max(player.hp - 20, 1)
        player.invTimer = 60
      }
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      const c = THEMES[theme]

      drawBackground(ctx, cam.x, frame, theme)

      ctx.save()
      ctx.translate(-cam.x + cam.shakeX, cam.shakeY)

      ctx.fillStyle = c.hillNear
      const hillOff3 = -(cam.x * 0.5) % 600
      for (let i = -1; i <= 2; i++) {
        const hx = hillOff3 + i * 300
        ctx.beginPath()
        ctx.moveTo(hx, GROUND_Y)
        ctx.quadraticCurveTo(hx + 60, GROUND_Y - 35, hx + 150, GROUND_Y)
        ctx.fill()
      }

      const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 120)
      gGrad.addColorStop(0, c.groundTop)
      gGrad.addColorStop(0.3, c.groundMid)
      gGrad.addColorStop(1, c.groundBot)
      ctx.fillStyle = gGrad
      for (const plat of world.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h)
      }

      ctx.fillStyle = lighter(c.groundTop, 15)
      for (const plat of world.platforms) {
        if (plat.h > 30) ctx.fillRect(plat.x, plat.y, plat.w, 3)
      }

      for (const plat of world.platforms) {
        if (plat.h <= 20) {
          ctx.fillStyle = c.platformTop
          ctx.fillRect(plat.x, plat.y, plat.w, 4)
          ctx.fillStyle = c.platform
          ctx.fillRect(plat.x, plat.y + 4, plat.w, plat.h - 4)
          ctx.fillStyle = c.platformEdge
          ctx.fillRect(plat.x, plat.y + plat.h - 2, plat.w, 2)
        }
      }

      drawForeground(ctx, cam.x, frame, theme)
      drawShop(ctx, 340, GROUND_Y, c, frame)

      drawSpikes(ctx, world.spikes, cam.x)

      for (const cp of world.checkpoints) {
        drawCheckpoint(ctx, cp, cam.x, frame)
      }

      for (const coin of world.coins) {
        if (coin.collected) continue
        const cy = coin.y + Math.sin(coin.bob) * 4
        const coinScreenX = coin.x
        if (coinScreenX - cam.x < -20 || coinScreenX - cam.x > CANVAS_W + 20) continue
        ctx.fillStyle = '#FFD93D'
        ctx.beginPath()
        ctx.arc(coin.x, cy, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#E8A93B'
        ctx.beginPath()
        ctx.arc(coin.x, cy, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFD93D'
        ctx.fillRect(coin.x - 2, cy - 4, 4, 8)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillRect(coin.x - 2, cy - 3, 2, 2)
      }

      for (const hd of world.heartDrops) {
        drawHeartDrop(ctx, hd, cam.x, frame)
      }

      for (const npc of world.npcs) {
        drawNpc(ctx, npc.x, npc.y, npc.type, frame)
      }

      for (const e of world.enemies) {
        if (e.hp <= 0) continue
        const eScreenX = e.x - cam.x
        if (eScreenX < -50 || eScreenX > CANVAS_W + 50) continue
        drawEnemySprite(ctx, e.x, e.y, e.w, e.h, e.dir, frame, e.hp, e.maxHp, e.type, e.flashTimer)
      }

      for (const door of world.doors) {
        const isNear = nearbyDoor?.id === door.level.id
        drawDoor(ctx, door.x, GROUND_Y, door.level, frame, isNear)
      }

      if (player.attackTimer > 0) {
        const attackX = player.dir > 0 ? player.x + PLAYER_W : player.x - ATTACK_RANGE_X
        const progress = 1 - (player.attackTimer / ATTACK_DURATION)
        const alpha = player.attackTimer > 3 ? 0.35 : 0.15
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#FFD93D'
        if (player.dir > 0) {
          ctx.beginPath()
          ctx.moveTo(player.x + PLAYER_W, player.y + 4)
          ctx.quadraticCurveTo(
            player.x + PLAYER_W + ATTACK_RANGE_X * 0.7,
            player.y + PLAYER_H * 0.5 - progress * 20,
            player.x + PLAYER_W + ATTACK_RANGE_X * 0.3,
            player.y + PLAYER_H * 0.3 + progress * 15
          )
          ctx.lineTo(player.x + PLAYER_W, player.y + PLAYER_H * 0.6)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(player.x, player.y + 4)
          ctx.quadraticCurveTo(
            player.x - ATTACK_RANGE_X * 0.7,
            player.y + PLAYER_H * 0.5 - progress * 20,
            player.x - ATTACK_RANGE_X * 0.3,
            player.y + PLAYER_H * 0.3 + progress * 15
          )
          ctx.lineTo(player.x, player.y + PLAYER_H * 0.6)
          ctx.fill()
        }
        ctx.restore()
      }

      if (player.invTimer > 0 && player.invTimer % 6 < 3) {
        ctx.globalAlpha = 0.45
      }
      drawPlayer(ctx, player.x, player.y, player.dir, player.frame, player.vy < -1, player.vy > 2, theme, player.attackTimer, player.damageFlash)
      ctx.globalAlpha = 1

      ctx.fillStyle = 'rgba(30,20,10,0.7)'
      const nameW = ctx.measureText(playerAvatar).width + 10
      ctx.fillRect(player.x + PLAYER_W / 2 - nameW / 2, player.y - 20, nameW, 14)
      ctx.fillStyle = '#FFD93D'
      ctx.font = 'bold 9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(playerAvatar, player.x + PLAYER_W / 2, player.y - 10)
      ctx.textAlign = 'left'

      for (const p of particles) {
        const alpha = p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
      }
      ctx.globalAlpha = 1

      for (const d of damageNumbers) {
        const alpha = d.life / 40
        ctx.globalAlpha = alpha
        ctx.fillStyle = d.color
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(d.text, d.x, d.y)
        ctx.textAlign = 'left'
      }
      ctx.globalAlpha = 1

      ctx.restore()

      ctx.fillStyle = 'rgba(30,20,10,0.88)'
      ctx.fillRect(10, 10, 200, 56)
      ctx.strokeStyle = '#C9A86A'
      ctx.lineWidth = 2
      ctx.strokeRect(10, 10, 200, 56)

      const heartSize = 14
      const heartGap = 2
      const maxHearts = 5
      const hpPerHeart = player.maxHp / maxHearts
      for (let i = 0; i < maxHearts; i++) {
        const hx = 50 + i * (heartSize + heartGap)
        const hy = 18
        const heartFill = Math.min(1, Math.max(0, (player.hp - i * hpPerHeart) / hpPerHeart))

        ctx.fillStyle = '#2A1A1A'
        ctx.beginPath()
        ctx.moveTo(hx, hy + 4)
        ctx.bezierCurveTo(hx - heartSize * 0.5, hy - heartSize * 0.3, hx - heartSize * 0.5, hy - heartSize * 0.6, hx, hy - heartSize * 0.2)
        ctx.bezierCurveTo(hx + heartSize * 0.5, hy - heartSize * 0.6, hx + heartSize * 0.5, hy - heartSize * 0.3, hx, hy + 4)
        ctx.fill()

        if (heartFill > 0) {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(hx, hy + 4)
          ctx.bezierCurveTo(hx - heartSize * 0.5, hy - heartSize * 0.3, hx - heartSize * 0.5, hy - heartSize * 0.6, hx, hy - heartSize * 0.2)
          ctx.bezierCurveTo(hx + heartSize * 0.5, hy - heartSize * 0.6, hx + heartSize * 0.5, hy - heartSize * 0.3, hx, hy + 4)
          ctx.clip()

          ctx.fillStyle = heartFill >= 1 ? '#FF4444' : '#FF4444'
          ctx.fillRect(hx - heartSize * 0.5, hy - heartSize * 0.6, heartSize * heartFill, heartSize + 4)

          ctx.fillStyle = '#FF8888'
          ctx.fillRect(hx - heartSize * 0.3, hy - heartSize * 0.4, heartSize * 0.2, heartSize * 0.3)
          ctx.restore()
        }
      }

      ctx.fillStyle = '#FFD93D'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`${player.coins}`, 52, 48)

      ctx.font = '16px serif'
      ctx.fillText('💰', 16, 48)

      if (player.attackTimer > 0) {
        ctx.fillStyle = 'rgba(232,169,59,0.8)'
        ctx.font = 'bold 8px monospace'
        ctx.fillText('⚔️ ATTACK!', 52, 60)
      }

      const worldName = theme === 'english' ? 'ENGLISH VILLAGE' : theme === 'math' ? 'MATH DESERT' : 'LOGIC FOREST'
      const lvlCount = levels.filter(l => l.status === 'COMPLETED').length
      ctx.fillStyle = 'rgba(30,20,10,0.8)'
      ctx.fillRect(CANVAS_W / 2 - 110, 10, 220, 22)
      ctx.strokeStyle = '#C9A86A'
      ctx.lineWidth = 1
      ctx.strokeRect(CANVAS_W / 2 - 110, 10, 220, 22)
      ctx.fillStyle = '#E8D5B0'
      ctx.font = 'bold 11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${worldName}  •  ${lvlCount}/${levels.length} LEVEL`, CANVAS_W / 2, 25)
      ctx.textAlign = 'left'

      if (nearbyDoor) {
        const isLocked = nearbyDoor.status === 'LOCKED'
        ctx.fillStyle = 'rgba(30,20,10,0.92)'
        const hintW = isLocked ? 320 : 300
        ctx.fillRect(CANVAS_W / 2 - hintW / 2, CANVAS_H - 56, hintW, 34)
        ctx.strokeStyle = isLocked ? '#FF4444' : '#C9A86A'
        ctx.lineWidth = 1
        ctx.strokeRect(CANVAS_W / 2 - hintW / 2, CANVAS_H - 56, hintW, 34)
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        if (isLocked) {
          ctx.fillText(`🔒 ${nearbyDoor.nama} Terkunci! Selesaikan soal sebelumnya dulu`, CANVAS_W / 2, CANVAS_H - 35)
        } else {
          ctx.fillText(`Tekan [E] untuk masuk: ${nearbyDoor.nama}`, CANVAS_W / 2, CANVAS_H - 35)
        }
        ctx.textAlign = 'left'
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(CANVAS_W / 2 - 220, CANVAS_H - 34, 440, 20)
        ctx.fillStyle = '#FFF'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('← → / A D  gerak  •  W / Space  lompat  •  Enter / J  serang  •  E  interaksi', CANVAS_W / 2, CANVAS_H - 20)
        ctx.textAlign = 'left'
      }
    }

    function handleInteract() {
      if (!nearbyDoor || !gameRunning) return
      if (onLevelGateRef.current(nearbyDoor)) {
        onLevelEnterRef.current(nearbyDoor)
      }
    }

    function loop(time: number) {
      const dt = Math.min(time - lastTime, 32)
      lastTime = time
      frame++
      update(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'w', 'a', 'd', 'e', 'enter', 'j', 'x'].includes(k)) {
        e.preventDefault()
      }
      keys[k] = true
      if ((k === 'e' || k === 'enter') && gameRunning) handleInteract()
    }
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false }

    const getTouchBtn = (tx: number, ty: number): string | null => {
      const rect = canvas!.getBoundingClientRect()
      const x = ((tx - rect.left) / rect.width) * CANVAS_W
      const y = ((ty - rect.top) / rect.height) * CANVAS_H
      if (y > CANVAS_H - 100) {
        if (x < CANVAS_W / 2) {
          if (x < CANVAS_W / 2 - 60) return 'left'
          if (x > CANVAS_W / 2 + 10) return 'right'
        } else {
          if (x < CANVAS_W / 2 + 40) return 'jump'
          if (x > CANVAS_W / 2 + 40 + 52) return 'attack'
        }
      }
      return null
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        const btn = getTouchBtn(touch.clientX, touch.clientY)
        if (btn === 'left') touchL = true
        else if (btn === 'right') touchR = true
        else if (btn === 'jump') touchJ = true
        else if (btn === 'attack') touchA = true
        else if (btn === null && gameRunning) handleInteract()
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        const btn = getTouchBtn(touch.clientX, touch.clientY)
        if (btn === 'left') touchL = false
        else if (btn === 'right') touchR = false
        else if (btn === 'jump') touchJ = false
        else if (btn === 'attack') touchA = false
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [duniaId, levels, theme, playerAvatar])

  const handleContinue = () => {
    setIsGameOver(false)
    continueCbRef.current?.()
  }

  const handleQuit = () => {
    setIsGameOver(false)
    window.location.href = '/rpg'
  }

  const borderColor = theme === 'english' ? '#D97757' : theme === 'math' ? '#2C5F5D' : '#E8A93B'

  return (
    <div className="relative select-none">
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          className="border-[4px] shadow-pixel-lg cursor-pointer"
          style={{ borderColor, maxWidth: CANVAS_W, width: '100%', imageRendering: 'pixelated' }}
        />
      </div>

      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20" style={{ maxWidth: CANVAS_W, margin: '0 auto' }}>
          <div className="pixel-panel p-0 w-full max-w-[360px] overflow-hidden" style={{ borderColor: '#C94C4C' }}>
            <div className="bg-pixel-coral/20 border-b-2 border-pixel-coral/30 p-4 text-center">
              <div className="text-4xl mb-1">💀</div>
              <h2 className="font-pixel text-[14px] text-pixel-coral">GAME OVER</h2>
            </div>
            <div className="p-5 text-center">
              <p className="font-vt text-xl text-pixel-cream/70 mb-1">Kamu dikalahkan!</p>
              <p className="font-vt text-base text-pixel-cream/40 mb-5">-10 Coins sebagai penalty</p>
              <button
                onClick={handleContinue}
                className="w-full mb-2 py-3 bg-pixel-green hover:brightness-110 text-white font-pixel text-[9px] border-2 border-pixel-green/80 transition active:translate-y-[2px]"
              >
                💖 LANJUTKAN (-10 Coin)
              </button>
              <button
                onClick={handleQuit}
                className="w-full py-3 bg-pixel-panel-light hover:bg-pixel-panel-light/80 text-pixel-cream/70 font-pixel text-[9px] border-2 border-[#2A3444] transition active:translate-y-[2px]"
              >
                🚪 KEMBALI KE HUB
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-between md:hidden max-w-[960px] mx-auto">
        <div className="flex gap-2">
          <button
            className="w-14 h-14 bg-pixel-panel border-2 border-[#2A3444] text-xl active:bg-pixel-amber active:text-white"
            onTouchStart={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keydown', { key: 'a' }); window.dispatchEvent(ke) }}
            onTouchEnd={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keyup', { key: 'a' }); window.dispatchEvent(ke) }}
          >←</button>
          <button
            className="w-14 h-14 bg-pixel-panel border-2 border-[#2A3444] text-xl active:bg-pixel-amber active:text-white"
            onTouchStart={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keydown', { key: 'd' }); window.dispatchEvent(ke) }}
            onTouchEnd={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keyup', { key: 'd' }); window.dispatchEvent(ke) }}
          >→</button>
        </div>
        <div className="flex gap-2">
          <button
            className="w-14 h-14 bg-pixel-panel border-2 border-[#2A3444] text-xl active:bg-pixel-amber active:text-white"
            onTouchStart={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keydown', { key: 'w' }); window.dispatchEvent(ke) }}
            onTouchEnd={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keyup', { key: 'w' }); window.dispatchEvent(ke) }}
          >↑</button>
          <button
            className="w-14 h-14 bg-pixel-coral text-white border-2 border-pixel-coral text-sm font-bold active:translate-y-[2px]"
            onTouchStart={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keydown', { key: 'j' }); window.dispatchEvent(ke) }}
            onTouchEnd={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keyup', { key: 'j' }); window.dispatchEvent(ke) }}
          >⚔</button>
          <button
            className="w-14 h-14 bg-pixel-amber text-white border-2 border-pixel-amber text-sm font-bold active:translate-y-[2px]"
            onTouchStart={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keydown', { key: 'e' }); window.dispatchEvent(ke) }}
            onTouchEnd={(e) => { e.preventDefault(); const ke = new KeyboardEvent('keyup', { key: 'e' }); window.dispatchEvent(ke) }}
          >E</button>
        </div>
      </div>
      <p className="text-center text-[11px] text-pixel-cream/50 mt-2 hidden md:block">
        A/D atau ← → bergerak • W/Space melompat • Enter/J menyerang • E berinteraksi
      </p>
    </div>
  )
}
