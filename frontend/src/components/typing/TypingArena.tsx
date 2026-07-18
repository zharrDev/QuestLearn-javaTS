import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Html, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { EnemyState, DifficultyLevel } from '../../types/typing.types'

type PlayerState = 'idle' | 'run' | 'slash' | 'block' | 'finisher' | 'jump'

interface ArenaProps {
  words: string[]
  difficulty: DifficultyLevel
  duniaId: number
  duniaNama: string
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

interface SlashVFX {
  id: string
  position: [number, number, number]
  type: 'slash' | 'finisher' | 'block'
  startTime: number
}

interface EnemyVariant {
  emoji: string
  color: string
  scale: number
}

const ENEMY_VARIANTS: EnemyVariant[] = [
  { emoji: '👹', color: '#8B4513', scale: 1.5 },
  { emoji: '👺', color: '#6B3A2A', scale: 1.6 },
  { emoji: '👾', color: '#4A0E4E', scale: 1.4 },
  { emoji: '🕷️', color: '#1A1A2E', scale: 1.3 },
  { emoji: '🐉', color: '#1A4A1A', scale: 1.8 },
  { emoji: '💀', color: '#2A2A2A', scale: 1.5 },
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function getDuniaTheme(duniaId: number) {
  switch (duniaId) {
    case 1: return {
      groundColor: '#2d5a27',
      groundAccent: '#3a7a33',
      skyColor: '#1a2a4a',
      fogColor: '#2a3a5a',
      accentColor: '#4ade80',
      props: 'village' as const,
    }
    case 2: return {
      groundColor: '#5a4a2a',
      groundAccent: '#7a6a3a',
      skyColor: '#3a2a1a',
      fogColor: '#4a3a2a',
      accentColor: '#fbbf24',
      props: 'desert' as const,
    }
    case 3: return {
      groundColor: '#1a3a1a',
      groundAccent: '#2a5a2a',
      skyColor: '#0a1a0a',
      fogColor: '#1a2a1a',
      accentColor: '#60a5fa',
      props: 'forest' as const,
    }
    default: return {
      groundColor: '#2d5a27',
      groundAccent: '#3a7a33',
      skyColor: '#1a2a4a',
      fogColor: '#2a3a5a',
      accentColor: '#4ade80',
      props: 'village' as const,
    }
  }
}

function drawWizardSprite(
  ctx: CanvasRenderingContext2D,
  state: PlayerState,
  frame: number,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height)

  const robeColor = '#4a6fa5'
  const robeDark = '#3a5a8a'
  const hatColor = '#f0c040'
  const hatDark = '#d0a030'
  const skinColor = '#e8d5b7'
  const skinDark = '#d4c0a0'

  const bobY = state === 'run' ? Math.sin(frame * 0.3) * 2 :
              state === 'slash' ? Math.sin(frame * 0.5) * 1 :
              state === 'block' ? -1 :
              state === 'finisher' ? -Math.abs(Math.sin(frame * 0.4)) * 3 :
              Math.sin(frame * 0.1) * 0.5

  const tilt = state === 'run' ? Math.sin(frame * 0.3) * 0.15 :
               state === 'slash' ? -0.3 :
               state === 'block' ? 0.1 :
               state === 'finisher' ? -0.4 :
               0

  ctx.save()
  ctx.translate(width / 2, height / 2 + bobY)
  ctx.rotate(tilt)

  const armAngle = state === 'run' ? Math.sin(frame * 0.3) * 0.4 :
                   state === 'slash' ? -1.2 + Math.abs(Math.sin(frame * 0.6)) * 0.8 :
                   state === 'block' ? 0.8 :
                   state === 'finisher' ? -1.5 :
                   0.1

  const hatAngle = state === 'run' ? Math.sin(frame * 0.3) * 0.05 : 0

  ctx.fillStyle = robeColor
  ctx.beginPath()
  ctx.moveTo(-10, 5)
  ctx.lineTo(-12, 28)
  ctx.lineTo(12, 28)
  ctx.lineTo(10, 5)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = robeDark
  ctx.fillRect(-10, 5, 20, 3)

  ctx.fillStyle = skinColor
  ctx.beginPath()
  ctx.arc(0, -1, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = skinDark
  ctx.beginPath()
  ctx.arc(0, -1, 8, Math.PI, Math.PI * 1.5)
  ctx.fill()

  ctx.save()
  ctx.translate(0, -6)
  ctx.rotate(hatAngle)
  ctx.fillStyle = hatColor
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(-10, 2)
  ctx.lineTo(10, 2)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = hatDark
  ctx.fillRect(-12, 1, 24, 3)
  ctx.restore()

  if (state === 'block') {
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, -1, 11, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.save()
  ctx.translate(6, 2)
  ctx.rotate(armAngle)
  ctx.fillStyle = robeColor
  ctx.fillRect(-2, -1, 8, 4)

  if (state === 'slash' || state === 'finisher') {
    const slashProgress = state === 'finisher' ? Math.min(frame / 15, 1) : Math.min(frame / 8, 1)
    const slashAngle = -1.5 + slashProgress * 2.5
    ctx.save()
    ctx.rotate(slashAngle)
    ctx.strokeStyle = state === 'finisher' ? '#fbbf24' : '#4ade80'
    ctx.lineWidth = state === 'finisher' ? 3 : 2
    ctx.beginPath()
    ctx.moveTo(6, 0)
    ctx.lineTo(20, -5 + Math.sin(slashProgress * 10) * 3)
    ctx.stroke()
    ctx.restore()
  }

  if (state === 'block') {
    ctx.save()
    ctx.rotate(0.5)
    ctx.fillStyle = '#60a5fa'
    ctx.globalAlpha = 0.3
    ctx.fillRect(4, -4, 10, 14)
    ctx.restore()
  }

  ctx.restore()

  ctx.restore()
}

function generateEnemySprite(variant: EnemyVariant, isTarget: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 80
  canvas.height = 80
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = variant.color
  ctx.beginPath()
  ctx.arc(40, 40, 34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = variant.color
  const bodyGrad = ctx.createRadialGradient(30, 30, 5, 40, 40, 34)
  bodyGrad.addColorStop(0, lightenColor(variant.color, 30))
  bodyGrad.addColorStop(1, variant.color)
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(40, 40, 34, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = '36px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(variant.emoji, 40, 42)

  if (isTarget) {
    ctx.strokeStyle = '#ff0'
    ctx.lineWidth = 3
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(40, 40, 36, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + percent)
  const g = Math.min(255, ((num >> 8) & 0x00FF) + percent)
  const b = Math.min(255, (num & 0x0000FF) + percent)
  return `rgb(${r},${g},${b})`
}

function spawnEnemy(words: string[], difficulty: DifficultyLevel): EnemyState {
  const word = words[Math.floor(Math.random() * words.length)]
  const side = Math.floor(Math.random() * 4)
  let angle: number
  switch (side) {
    case 0: angle = (Math.random() - 0.5) * 0.8; break
    case 1: angle = Math.PI - (Math.random() - 0.5) * 0.8; break
    case 2: angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6; break
    case 3: angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6; break
    default: angle = (Math.random() - 0.5) * Math.PI
  }
  const radius = 9 + Math.random() * 3
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const speedMap = { EASY: 0.25 + Math.random() * 0.1, MEDIUM: 0.5 + Math.random() * 0.2, HARD: 0.8 + Math.random() * 0.3 }
  const speed = speedMap[difficulty]

  return {
    id: generateId(),
    word,
    typedIndex: 0,
    hp: word.length,
    maxHp: word.length,
    position: [x, 0.5, z],
    targetPosition: [0, 0.5, 0],
    alive: true,
    speed,
    letterStatuses: word.split('').map(() => 'pending' as const),
  }
}

function SlashEffect({ effect, maxAge }: { effect: SlashVFX; maxAge: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const age = Date.now() - effect.startTime
  const progress = Math.min(age / maxAge, 1)
  const opacity = 1 - progress

  if (progress >= 1) return null

  const color = effect.type === 'finisher' ? '#fbbf24' : effect.type === 'block' ? '#ff4444' : '#4ade80'
  const length = effect.type === 'finisher' ? 3 : effect.type === 'block' ? 1.5 : 2

  return (
    <group ref={groupRef} position={effect.position}>
      <Billboard>
        <group rotation={[0, 0, progress * Math.PI * 2]}>
          <mesh>
            <planeGeometry args={[length * (1 - progress * 0.3), 0.3]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[length * (1 - progress * 0.3), 0.3]} />
            <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} />
          </mesh>
        </group>
      </Billboard>
      {effect.type === 'finisher' && progress < 0.6 && (
        <Billboard>
          <Text
            fontSize={0.5 * (1 - progress * 0.5)}
            color={color}
            position={[0, 1.5 - progress * 2, 0]}
          >
            SLASH!
          </Text>
        </Billboard>
      )}
    </group>
  )
}

function EnemyBillboard({
  enemy,
  isTarget,
  variantIndex,
}: {
  enemy: EnemyState
  isTarget: boolean
  variantIndex: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const variant = ENEMY_VARIANTS[variantIndex % ENEMY_VARIANTS.length]
  const texture = useMemo(() => generateEnemySprite(variant, isTarget), [variant, isTarget])
  const wobble = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current || !enemy.alive) return

    const dx = enemy.targetPosition[0] - enemy.position[0]
    const dz = enemy.targetPosition[2] - enemy.position[2]
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist > 0.1) {
      const move = enemy.speed * delta
      const ratio = Math.min(move / dist, 1)
      enemy.position[0] += dx * ratio
      enemy.position[2] += dz * ratio
    }

    wobble.current += delta
    const floatY = Math.sin(wobble.current * 2) * 0.1
    groupRef.current.position.set(enemy.position[0], enemy.position[1] + floatY, enemy.position[2])
    groupRef.current.rotation.y += delta * 0.5
  })

  if (!enemy.alive) return null

  const hpPercent = enemy.hp / enemy.maxHp
  const isLowHp = hpPercent < 0.5

  return (
    <group ref={groupRef}>
      <sprite scale={[variant.scale, variant.scale, 1]}>
        <spriteMaterial map={texture} transparent />
      </sprite>

      <Billboard position={[0, 2.4, 0]}>
        <group>
          <mesh position={[0, -0.6, 0]}>
            <planeGeometry args={[enemy.word.length * 0.5 + 0.8, 0.6]} />
            <meshBasicMaterial color="#000" transparent opacity={0.7} />
          </mesh>
          <Html position={[0, -0.6, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: isTarget ? '18px' : '14px',
                fontWeight: 'bold',
                color: '#fff',
                letterSpacing: '3px',
                textShadow: isTarget ? '0 0 10px rgba(255,255,0,0.5)' : 'none',
              }}
            >
              {enemy.word.split('').map((char, i) => {
                let color = '#666'
                if (enemy.letterStatuses[i] === 'correct') color = '#4ade80'
                else if (enemy.letterStatuses[i] === 'wrong') color = '#ff4444'
                else if (enemy.letterStatuses[i] === 'completed') color = '#fbbf24'
                else if (isTarget && i === enemy.typedIndex) color = '#60a5fa'
                return (
                  <span
                    key={i}
                    style={{
                      color,
                      textDecoration: isTarget && i === enemy.typedIndex ? 'underline' : 'none',
                      textUnderlineOffset: '3px',
                      animation: isTarget && i === enemy.typedIndex ? 'blink 1s infinite' : 'none',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </span>
          </Html>
        </group>
      </Billboard>

      {isTarget && (
        <Billboard position={[0, 3.2, 0]}>
          <Text fontSize={0.25} color="#ff0" outlineColor="#000" outlineWidth={0.05}>
            ▶ TARGET
          </Text>
        </Billboard>
      )}

      <mesh position={[0, -1.8, 0]}>
        <planeGeometry args={[2, 0.2]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh position={[-(2 / 2) * (1 - hpPercent), -1.8, 0]}>
        <planeGeometry args={[2 * hpPercent, 0.2]} />
        <meshBasicMaterial
          color={hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ff4444'}
        />
      </mesh>

      {isLowHp && (
        <Billboard position={[0, -2.2, 0]}>
          <Text fontSize={0.15} color="#ff4444">LOW HP</Text>
        </Billboard>
      )}
    </group>
  )
}

function PlayerWizard({
  targetPosition,
  currentState,
}: {
  targetPosition: [number, number, number]
  currentState: PlayerState
}) {
  const groupRef = useRef<THREE.Group>(null)
  const animFrame = useRef(0)
  const stateRef = useRef<PlayerState>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const textureRef = useRef<THREE.CanvasTexture | null>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 48
    canvas.height = 64
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')!
    drawWizardSprite(ctx, 'idle', 0, 48, 64)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    textureRef.current = tex
    return tex
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const target = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2])
    const currentPos = groupRef.current.position
    const distToTarget = currentPos.distanceTo(target)

    if (distToTarget > 0.3 && (currentState === 'run' || currentState === 'idle')) {
      currentPos.lerp(target, delta * 4)
    }

    if (currentState === 'idle') {
      currentPos.lerp(new THREE.Vector3(0, 0.5, 0), delta * 1)
    }

    const lookTarget = new THREE.Vector3(targetPosition[0], 0, targetPosition[2])
    if (distToTarget > 0.5) {
      const dir = new THREE.Vector3().copy(lookTarget).sub(currentPos).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      let currentRot = groupRef.current.rotation.y
      let diff = angle - currentRot
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      groupRef.current.rotation.y += diff * delta * 5
    }

    animFrame.current += delta * 10

    if (stateRef.current !== currentState) {
      stateRef.current = currentState
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 48, 64)
    drawWizardSprite(ctx, currentState, animFrame.current, 48, 64)
    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }
  })

  const scale = currentState === 'slash' ? 1.1 :
    currentState === 'block' ? 0.9 :
    currentState === 'finisher' ? 1.2 : 1

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <sprite scale={[2 * scale, 2.5 * scale, 1]}>
        <spriteMaterial map={texture} transparent />
      </sprite>
      {currentState === 'block' && (
        <Billboard position={[0, 3, 0]}>
          <Text fontSize={0.2} color="#60a5fa" outlineColor="#000" outlineWidth={0.03}>
            BLOCK
          </Text>
        </Billboard>
      )}
    </group>
  )
}

function ArenaBackground({ duniaId }: { duniaId: number }) {
  const theme = getDuniaTheme(duniaId)
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color(theme.skyColor)
    scene.fog = new THREE.Fog(theme.fogColor, 15, 25)
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene, theme])

  return null
}

function ArenaGround({ duniaId }: { duniaId: number }) {
  const theme = getDuniaTheme(duniaId)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color={theme.groundColor} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
        <ringGeometry args={[10, 14, 64]} />
        <meshStandardMaterial color={theme.groundAccent} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

function ArenaDecorations({ duniaId }: { duniaId: number }) {
  const theme = getDuniaTheme(duniaId)

  const decorations = useMemo(() => {
    const items: { position: [number, number, number]; scale: number; type: string }[] = []
    const count = 6 + Math.floor(Math.random() * 4)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 4 + Math.random() * 7
      items.push({
        position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius],
        scale: 0.5 + Math.random() * 1,
        type: theme.props,
      })
    }
    return items
  }, [theme.props])

  return (
    <group>
      {decorations.map((dec, i) => (
        <Billboard key={i} position={[dec.position[0], dec.position[1] + 1, dec.position[2]]}>
          <Text fontSize={0.6 * dec.scale} color={theme.accentColor}>
            {dec.type === 'village' ? '🌳' : dec.type === 'desert' ? '🌵' : '🌲'}
          </Text>
        </Billboard>
      ))}
    </group>
  )
}

function ArenaBoundary() {
  const points = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      pts.push([Math.sin(angle) * 12, 0, Math.cos(angle) * 12])
    }
    return pts
  }, [])

  return <Line points={points} color="#4ade80" lineWidth={1} transparent opacity={0.5} />
}

function CameraController({ shakeIntensity }: { shakeIntensity: number }) {
  const { camera } = useThree()
  const shakeOffset = useRef(new THREE.Vector3())

  useFrame(() => {
    if (shakeIntensity > 0) {
      shakeOffset.current.set(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity,
        0
      )
    } else {
      shakeOffset.current.lerp(new THREE.Vector3(), 0.1)
    }

    camera.position.set(
      0 + shakeOffset.current.x,
      8 + shakeOffset.current.y,
      14 + shakeOffset.current.z
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}

function ParticleEffect({ position, color, maxAge = 1000 }: { position: [number, number, number]; color: string; maxAge?: number }) {
  const meshRef = useRef<THREE.Points>(null)
  const startTime = useRef(Date.now())

  const particles = useMemo(() => {
    const count = 15
    const positions = new Float32Array(count * 3)
    const velocities: [number, number, number][] = []
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5
      positions[i * 3 + 1] = Math.random() * 1.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5
      velocities.push([
        (Math.random() - 0.5) * 2,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 2,
      ])
    }
    return { positions, velocities }
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const age = Date.now() - startTime.current
    const progress = age / maxAge

    if (progress >= 1) {
      meshRef.current.visible = false
      return
    }

    const pos = meshRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particles.velocities.length; i++) {
      pos[i * 3] += particles.velocities[i][0] * delta
      pos[i * 3 + 1] += particles.velocities[i][1] * delta
      pos[i * 3 + 2] += particles.velocities[i][2] * delta
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true

    const opacity = Math.max(0, 1 - progress * progress)
    if (meshRef.current.material instanceof THREE.PointsMaterial) {
      meshRef.current.material.opacity = opacity
      const s = 0.1 + progress * 0.2
      meshRef.current.material.size = s
    }
  })

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.15} transparent opacity={1} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function ComboPopup({ combo, position }: { combo: number; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const startTime = useRef(Date.now())

  useFrame(() => {
    if (!ref.current) return
    const age = Date.now() - startTime.current
    const progress = age / 800
    if (progress >= 1) {
      ref.current.visible = false
      return
    }
    ref.current.position.y += 0.02
  })

  return (
    <group ref={ref} position={position}>
      <Billboard>
        <Text fontSize={0.4} color="#fbbf24" outlineColor="#000" outlineWidth={0.05}>
          {combo}x COMBO!
        </Text>
      </Billboard>
    </group>
  )
}

function TypingHUD({
  hp,
  maxHp,
  score,
  combo,
  maxCombo,
  kills,
  wave,
  duniaNama,
  difficulty,
  accuracy,
  wpm,
}: {
  hp: number
  maxHp: number
  score: number
  combo: number
  maxCombo: number
  kills: number
  wave: number
  duniaNama: string
  difficulty: string
  accuracy: number
  wpm: number
}) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between pointer-events-none">
      <div className="bg-black/70 p-3 rounded-lg border border-white/10 space-y-1.5 min-w-[160px]">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-lg">❤️</span>
          <div className="w-28 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(hp / maxHp) * 100}%`,
                background: hp > maxHp * 0.5
                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                  : hp > maxHp * 0.25
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, #ff4444, #dc2626)',
              }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">{hp}/{maxHp}</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-green-400">Score</span>
          <span className="text-white font-bold">{score.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-yellow-400">Combo</span>
          <span className="text-white font-bold">
            {combo > 0 ? combo : '-'}
            {maxCombo > 1 && <span className="text-gray-500 ml-1">(best: {maxCombo})</span>}
          </span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-purple-400">Kills</span>
          <span className="text-white font-bold">{kills}</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-blue-400">Wave</span>
          <span className="text-white font-bold">{wave}</span>
        </div>
      </div>

      <div className="bg-black/70 p-3 rounded-lg border border-white/10 text-center min-w-[140px]">
        <div className="text-xs text-gray-400">{duniaNama}</div>
        <div
          className="text-sm font-bold font-mono"
          style={{
            color: difficulty === 'EASY' ? '#4ade80' : difficulty === 'MEDIUM' ? '#fbbf24' : '#ff4444',
          }}
        >
          {difficulty}
        </div>
        <div className="mt-2 text-xs font-mono space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">WPM</span>
            <span className="text-green-400 font-bold">{wpm}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Akurasi</span>
            <span className="text-blue-400 font-bold">{accuracy}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const blinkKeyframes = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`

export default function TypingArena({ words, difficulty, duniaId, duniaNama, onSessionEnd }: ArenaProps) {
  const [enemies, setEnemies] = useState<EnemyState[]>([])
  const [targetId, setTargetId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [kills, setKills] = useState(0)
  const [missed, setMissed] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [particles, setParticles] = useState<{ id: string; position: [number, number, number]; color: string; maxAge?: number }[]>([])
  const [slashEffects, setSlashEffects] = useState<SlashVFX[]>([])
  const [comboPopups, setComboPopups] = useState<{ id: string; position: [number, number, number]; combo: number }[]>([])
  const [hp, setHp] = useState(5)
  const [maxHp] = useState(5)
  const [startTime] = useState(Date.now())
  const [lastSpawn, setLastSpawn] = useState(Date.now())
  const [enemiesThisWave, setEnemiesThisWave] = useState(0)
  const [wave, setWave] = useState(1)
  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [slashTrigger, setSlashTrigger] = useState(0)
  const [shakeIntensity, setShakeIntensity] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const inputRef = useRef<HTMLInputElement>(null)
  const enemyVariantIndices = useRef<Map<string, number>>(new Map())

  const spawnInterval = useMemo(() => {
    const map = { EASY: 3000, MEDIUM: 2000, HARD: 1200 }
    return map[difficulty]
  }, [difficulty])

  const maxEnemies = useMemo(() => {
    const map = { EASY: 3, MEDIUM: 5, HARD: 8 }
    return map[difficulty]
  }, [difficulty])

  const waveSize = useMemo(() => {
    const map = { EASY: 15, MEDIUM: 20, HARD: 30 }
    return map[difficulty]
  }, [difficulty])

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOver) return
      const elapsed = Date.now() - startTime
      const minutes = elapsed / 60000
      if (minutes > 0) {
        setWpm(Math.round((kills * 5) / minutes))
      }
      setAccuracy(
        totalKeystrokes > 0
          ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
          : 100
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, kills, totalKeystrokes, correctKeystrokes, gameOver])

  const lockOn = useCallback(() => {
    if (inputText.length === 0) {
      setTargetId(null)
      setPlayerState('idle')
      return
    }
    const firstChar = inputText[0].toLowerCase()

    const alive = enemies.filter(e => e.alive)
    const matching = alive.filter(
      e => e.word.toLowerCase().startsWith(firstChar) && e.typedIndex === 0
    )

    if (matching.length > 0) {
      matching.sort((a, b) => {
        const da = Math.sqrt(a.position[0] ** 2 + a.position[2] ** 2)
        const db = Math.sqrt(b.position[0] ** 2 + b.position[2] ** 2)
        return da - db
      })
      setTargetId(matching[0].id)
      setPlayerState('run')
    } else if (targetId) {
      const current = alive.find(e => e.id === targetId)
      if (current && current.word.toLowerCase().startsWith(inputText[0].toLowerCase())) {
        return
      }
      setTargetId(null)
      setPlayerState('idle')
    }
  }, [inputText, enemies, targetId])

  useEffect(() => {
    lockOn()
  }, [inputText, lockOn])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return

      setTotalKeystrokes(prev => prev + 1)

      if (!targetId) {
        setInputText(prev => prev + e.key)
        return
      }

      setInputText(prev => prev + e.key)

      setEnemies(prev => {
        const updated = prev.map(enemy => {
          if (enemy.id !== targetId || !enemy.alive) return enemy

          const expectedChar = enemy.word[enemy.typedIndex]
          const nextIndex = enemy.typedIndex + 1
          const newStatuses = [...enemy.letterStatuses]

          if (e.key.toLowerCase() === expectedChar.toLowerCase()) {
            setCorrectKeystrokes(prev2 => prev2 + 1)
            setCombo(prev2 => {
              const newCombo = prev2 + 1
              if (newCombo > maxCombo) setMaxCombo(newCombo)
              if (newCombo > 2 && newCombo % 5 === 0) {
                setComboPopups(prev3 => [
                  ...prev3,
                  {
                    id: generateId(),
                    position: [...enemy.position] as [number, number, number],
                    combo: newCombo,
                  },
                ])
              }
              return newCombo
            })
            newStatuses[enemy.typedIndex] = 'correct'

            setSlashEffects(prev2 => [
              ...prev2.slice(-5),
              {
                id: generateId(),
                position: [...enemy.position] as [number, number, number],
                type: 'slash',
                startTime: Date.now(),
              },
            ])
            setSlashTrigger(prev2 => prev2 + 1)

            if (nextIndex >= enemy.word.length) {
              const bonus =
                enemy.word.length * 10 *
                (difficulty === 'HARD' ? 3 : difficulty === 'MEDIUM' ? 2 : 1) *
                (1 + Math.floor(combo / 10) * 0.5)
              setScore(prevScore => prevScore + Math.round(bonus))
              setKills(prev2 => prev2 + 1)
              setTargetId(null)
              setInputText('')
              setPlayerState('finisher')

              setSlashEffects(prev2 => [
                ...prev2,
                {
                  id: generateId(),
                  position: [...enemy.position] as [number, number, number],
                  type: 'finisher',
                  startTime: Date.now(),
                },
              ])

              setParticles(prev2 => [
                ...prev2,
                {
                  id: generateId(),
                  position: [...enemy.position] as [number, number, number],
                  color: '#fbbf24',
                  maxAge: 1500,
                },
              ])

              setTimeout(() => {
                setPlayerState(targetId ? 'run' : 'idle')
              }, 400)

              return { ...enemy, alive: false, hp: 0, letterStatuses: enemy.word.split('').map(() => 'completed' as const) }
            }

            setTimeout(() => {
              setPlayerState('run')
            }, 150)

            return { ...enemy, typedIndex: nextIndex, hp: enemy.hp - 1, letterStatuses: newStatuses }
          } else {
            setCombo(0)
            newStatuses[enemy.typedIndex] = 'wrong'
            setPlayerState('block')

            setSlashEffects(prev2 => [
              ...prev2.slice(-5),
              {
                id: generateId(),
                position: [...enemy.position] as [number, number, number],
                type: 'block',
                startTime: Date.now(),
              },
            ])

            setTimeout(() => {
              setPlayerState('run')
            }, 300)

            setParticles(prev2 => [
              ...prev2,
              {
                id: generateId(),
                position: [...enemy.position] as [number, number, number],
                color: '#ff4444',
              },
            ])
            return { ...enemy, letterStatuses: newStatuses }
          }
        })
        return updated
      })
    },
    [targetId, gameOver, difficulty, combo, maxCombo]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    inputRef.current?.focus()
  })

  const doSpawn = useCallback(() => {
    if (gameOver) return
    if (enemiesThisWave >= waveSize) {
      setWave(prev => prev + 1)
      setEnemiesThisWave(0)
    }

    setEnemies(prev => {
      const alive = prev.filter(e => e.alive)
      if (alive.length >= maxEnemies) return prev

      const newEnemy = spawnEnemy(words, difficulty)
      enemyVariantIndices.current.set(newEnemy.id, Math.floor(Math.random() * ENEMY_VARIANTS.length))
      setEnemiesThisWave(prev2 => prev2 + 1)
      return [...prev, newEnemy]
    })
  }, [gameOver, enemiesThisWave, waveSize, maxEnemies, words, difficulty])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastSpawn >= spawnInterval) {
        doSpawn()
        setLastSpawn(now)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [doSpawn, lastSpawn, spawnInterval])

  useEffect(() => {
    doSpawn()
  }, [])

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setEnemies(prev => {
        let changed = false
        let newHp = hp
        const updated = prev.map(enemy => {
          if (!enemy.alive) return enemy
          const dist = Math.sqrt(
            enemy.position[0] ** 2 + enemy.position[2] ** 2
          )
          if (dist < 1.0) {
            changed = true
            newHp = Math.max(0, newHp - 1)
            setMissed(prev2 => prev2 + 1)
            setCombo(0)
            setTargetId(null)
            setInputText('')
            setShakeIntensity(1)
            setTimeout(() => setShakeIntensity(0), 300)
            setParticles(prev2 => [
              ...prev2,
              {
                id: generateId(),
                position: [...enemy.position] as [number, number, number],
                color: '#ff4444',
              },
            ])
            return { ...enemy, alive: false }
          }
          return enemy
        })
        if (newHp < hp) setHp(newHp)
        if (changed) {
          if (newHp <= 0) {
            setGameOver(true)
          }
          return updated
        }
        return prev
      })
    }, 200)
    return () => clearInterval(checkInterval)
  }, [hp])

  useEffect(() => {
    setParticles(prev =>
      prev.filter(p => {
        const age = Date.now() - startTime
        return age < (p.maxAge || 1000)
      })
    )
  }, [particles, startTime])

  useEffect(() => {
    setSlashEffects(prev =>
      prev.filter(e => Date.now() - e.startTime < 600)
    )
  }, [slashEffects])

  useEffect(() => {
    setComboPopups(prev =>
      prev.filter(c => Date.now() - startTime < 800)
    )
  }, [comboPopups, startTime])

  useEffect(() => {
    if (gameOver) {
      const elapsed = Date.now() - startTime
      const minutes = elapsed / 60000
      const finalWpm = minutes > 0 ? Math.round((kills * 5) / minutes) : 0
      const finalAccuracy =
        totalKeystrokes > 0
          ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
          : 0

      setTimeout(() => {
        onSessionEnd({
          skor: score,
          wpm: finalWpm,
          akurasi: finalAccuracy,
          comboTerpanjang: maxCombo,
          totalMusuhKalah: kills,
          totalMusuhLolos: missed,
          waktuMillis: elapsed,
        })
      }, 1500)
    }
  }, [gameOver])

  const targetEnemy = enemies.find(e => e.id === targetId)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <style>{blinkKeyframes}</style>

      <Canvas shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.3} color={getDuniaTheme(duniaId).accentColor} />

        <CameraController shakeIntensity={shakeIntensity} />
        <ArenaBackground duniaId={duniaId} />
        <ArenaGround duniaId={duniaId} />
        <ArenaDecorations duniaId={duniaId} />
        <ArenaBoundary />

        {enemies.map(enemy => (
          <EnemyBillboard
            key={enemy.id}
            enemy={enemy}
            isTarget={enemy.id === targetId}
            variantIndex={enemyVariantIndices.current.get(enemy.id) || 0}
          />
        ))}

        <PlayerWizard
          targetPosition={targetEnemy ? targetEnemy.position : [0, 0.5, 0]}
          currentState={playerState}
        />

        {particles.map(p => (
          <ParticleEffect key={p.id} position={p.position} color={p.color} maxAge={p.maxAge || 1000} />
        ))}

        {slashEffects.map(e => (
          <SlashEffect key={e.id} effect={e} maxAge={500} />
        ))}

        {comboPopups.map(c => (
          <ComboPopup key={c.id} combo={c.combo} position={c.position} />
        ))}
      </Canvas>

      <TypingHUD
        hp={hp}
        maxHp={maxHp}
        score={score}
        combo={combo}
        maxCombo={maxCombo}
        kills={kills}
        wave={wave}
        duniaNama={duniaNama}
        difficulty={difficulty}
        accuracy={accuracy}
        wpm={wpm}
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="bg-black/80 px-6 py-3 rounded-lg border-2 border-green-500/50 min-w-[400px] text-center shadow-lg shadow-green-500/10">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={() => {}}
            className="w-full bg-transparent text-green-400 text-2xl font-mono text-center outline-none caret-green-400"
            placeholder={targetId ? 'Ketik huruf selanjutnya...' : 'Ketik huruf pertama untuk lock-on...'}
            autoFocus
            readOnly
          />
          {targetEnemy && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              Target:{' '}
              <span className="text-yellow-300">{targetEnemy.word}</span> ({targetEnemy.typedIndex}/{targetEnemy.word.length})
            </div>
          )}
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-red-500 p-8 rounded-lg text-center text-white pixel-font shadow-2xl shadow-red-500/20">
            <div className="text-5xl mb-4">💀</div>
            <h2 className="text-2xl text-red-400 font-bold mb-2 font-mono">GAME OVER</h2>
            <p className="text-gray-400 text-sm font-mono">Menghitung hasil akhir...</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
