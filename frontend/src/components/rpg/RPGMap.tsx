import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Position, RPGLevel, RPGEnemy, RPGNpc } from '../../types/rpg.types'
import { Lock, Crown, Star, Skull, MessageCircle } from 'lucide-react'

interface Props {
  map: number[][]
  levels: RPGLevel[]
  enemies?: RPGEnemy[]
  npcs?: RPGNpc[]
  playerPos: Position
  onMove: (newPos: Position) => void
  onLevelInteract: (level: RPGLevel) => void
  onEnemyInteract?: (enemy: RPGEnemy) => void
  onNpcInteract?: (npc: RPGNpc) => void
  theme: 'english' | 'math' | 'logic' | 'hub'
  playerAvatar: string
  playerColor: string
}

const TILE_SIZE = 36

export const RPGMap: React.FC<Props> = ({ map, levels, enemies = [], npcs = [], playerPos, onMove, onLevelInteract, onEnemyInteract, onNpcInteract, theme, playerAvatar, playerColor }) => {
  const [nearbyLevel, setNearbyLevel] = useState<RPGLevel | null>(null)
  const [nearbyEnemy, setNearbyEnemy] = useState<RPGEnemy | null>(null)
  const [nearbyNpc, setNearbyNpc] = useState<RPGNpc | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const checkCollision = useCallback((x: number, y: number) => {
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return true
    if (map[y][x] === 1) return true
    return false
  }, [map])

  const findNearby = useCallback((pos: Position) => {
    for (const lvl of levels) {
      const dist = Math.abs(lvl.x - pos.x) + Math.abs(lvl.y - pos.y)
      if (dist <= 1) return { level: lvl, enemy: null, npc: null }
    }
    for (const en of enemies) {
      if (en.defeated) continue
      const dist = Math.abs(en.x - pos.x) + Math.abs(en.y - pos.y)
      if (dist <= 1) return { level: null, enemy: en, npc: null }
    }
    for (const npc of npcs) {
      const dist = Math.abs(npc.x - pos.x) + Math.abs(npc.y - pos.y)
      if (dist <= 1) return { level: null, enemy: null, npc }
    }
    return { level: null, enemy: null, npc: null }
  }, [levels, enemies, npcs])

  useEffect(() => {
    const found = findNearby(playerPos)
    setNearbyLevel(found.level)
    setNearbyEnemy(found.enemy)
    setNearbyNpc(found.npc)
  }, [playerPos, findNearby])

  const move = useCallback((dx: number, dy: number) => {
    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy }
    if (!checkCollision(newPos.x, newPos.y)) {
      onMove(newPos)
    }
  }, [playerPos, checkCollision, onMove])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); move(0, -1) }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { e.preventDefault(); move(0, 1) }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); move(-1, 0) }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); move(1, 0) }
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        if (nearbyLevel && nearbyLevel.status !== 'LOCKED') onLevelInteract(nearbyLevel)
        else if (nearbyEnemy && onEnemyInteract) onEnemyInteract(nearbyEnemy)
        else if (nearbyNpc && onNpcInteract) onNpcInteract(nearbyNpc)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [move, nearbyLevel, nearbyEnemy, nearbyNpc, onLevelInteract, onEnemyInteract, onNpcInteract])

  const getThemeColors = () => {
    switch(theme) {
      case 'english': return { grass: '#FDF2EF', grass2: '#F5D5CB', wall: '#E8B4A0', border: '#D97757' }
      case 'math': return { grass: '#E8F0F0', grass2: '#C5D9D8', wall: '#8FB0AE', border: '#2C5F5D' }
      case 'logic': return { grass: '#FEF6E6', grass2: '#FDEDB8', wall: '#F5D78E', border: '#E8A93B' }
      default: return { grass: '#FAF6F0', grass2: '#E5DDD1', wall: '#D6CFC4', border: '#8A7F74' }
    }
  }
  const colors = getThemeColors()

  const renderTile = (value: number, x: number, y: number) => {
    const isPlayerHere = playerPos.x === x && playerPos.y === y
    const levelHere = levels.find(l => l.x === x && l.y === y)
    const enemyHere = enemies.find(e => e.x === x && e.y === y && !e.defeated)
    const npcHere = npcs.find(n => n.x === x && n.y === y)
    
    if (levelHere) {
      const isLocked = levelHere.status === 'LOCKED'
      const isCompleted = levelHere.status === 'COMPLETED'
      const isBoss = levelHere.isBoss
      return (
        <div key={`${x}-${y}`} className="absolute flex items-center justify-center text-[10px] font-bold transition-all"
          style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
          <div className={`w-[32px] h-[32px] flex flex-col items-center justify-center shadow-sm border-2 text-[16px]
            ${isLocked ? 'bg-pixel-panel-light/60 border-[#2A3444] text-pixel-cream/50 grayscale' : isCompleted ? 'bg-pixel-green border-pixel-green/50 text-white' : 'bg-pixel-panel border-pixel-amber/40 hover:scale-110 cursor-pointer animate-pulse'}`}>
            <span className="text-[14px]">{isLocked ? <Lock size={14} /> : isCompleted ? <span className="font-pixel text-[8px]">✓</span> : isBoss ? <Crown size={16} /> : <Star size={16} />}</span>
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-pixel-navy text-white text-[7px] px-1.5 py-0.5 whitespace-nowrap pointer-events-none">
            Lv{levelHere.id}
          </div>
        </div>
      )
    }

    if (enemyHere) {
      return (
        <div key={`en-${x}-${y}`} className="absolute flex items-center justify-center animate-bounce"
          style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
          <div className="w-[30px] h-[30px] bg-pixel-coral border-2 border-white shadow flex items-center justify-center text-[16px]"> 
            {enemyHere.emoji}
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-pixel-panel-light">
            <div className="h-full bg-pixel-coral" style={{ width: `${(enemyHere.hp/enemyHere.maxHp)*100}%` }}/>
          </div>
        </div>
      )
    }

    if (npcHere) {
      return (
        <div key={`npc-${x}-${y}`} className="absolute flex items-center justify-center"
          style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
          <div className="w-[30px] h-[30px] bg-pixel-amber/20 border-2 border-pixel-amber flex items-center justify-center text-[16px]"> 
            {npcHere.emoji}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pixel-panel border border-[#2A3444] text-[8px] px-1">!</div>
        </div>
      )
    }

    if (isPlayerHere) return null

    if (value === 1) {
      return (
        <div key={`${x}-${y}`} className="absolute" style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
          <div className="w-full h-full flex items-center justify-center text-[18px]" style={{ background: colors.wall }}>{theme === 'english' ? <HouseIcon /> : theme === 'math' ? <PyramidIcon /> : theme === 'logic' ? <TreeIcon /> : <TreeIcon />}</div>
        </div>
      )
    }

    const isChecker = (x+y) % 2 === 0
    return (
      <div key={`${x}-${y}`} className="absolute" style={{ left: x*TILE_SIZE, top: y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, background: isChecker ? colors.grass : colors.grass2 }}>
        <div className="w-full h-full opacity-20 flex items-center justify-center text-[10px]">
          {(x*y) % 7 === 0 ? (theme === 'english' ? <BookIcon /> : theme === 'math' ? <HashIcon /> : <LeafIcon />) : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="relative select-none">
      <div ref={containerRef} className="relative overflow-hidden border-[3px] shadow-pixel-lg bg-pixel-dark mx-auto"
        style={{ width: map[0].length * TILE_SIZE, height: map.length * TILE_SIZE, borderColor: colors.border, maxWidth: '100%' }}>
        {map.map((row, y) => row.map((val, x) => renderTile(val, x, y)))}

        {/* Player */}
        <div className="absolute z-20 transition-all duration-150 ease-out flex flex-col items-center"
          style={{ left: playerPos.x * TILE_SIZE, top: playerPos.y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}>
          <div className="w-[32px] h-[32px] border-2 border-white shadow-lg flex items-center justify-center text-[18px]"
            style={{ background: playerColor }}>
            {playerAvatar}
          </div>
          <div className="w-[16px] h-[4px] bg-black/20 blur-[1px] -mt-1" />
        </div>

        {/* Interaction hints */}
        {nearbyLevel && nearbyLevel.status !== 'LOCKED' && (
          <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 bg-pixel-navy text-white px-4 py-2 text-xs font-bold shadow-lg animate-pulse flex items-center gap-2">
            <span>Press <span className="bg-white/20 px-1.5 py-0.5">E</span> {nearbyLevel.isBoss ? 'Lawan BOSS' : 'Mulai'}: {nearbyLevel.nama}</span>
            <button onClick={() => onLevelInteract(nearbyLevel)} className="bg-pixel-amber px-3 py-1">Masuk</button>
          </div>
        )}
        {nearbyEnemy && (
          <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 bg-pixel-coral text-white px-4 py-2 text-xs font-bold shadow-lg animate-pulse flex items-center gap-2">
            <span><Skull size={14} className="inline-block mr-1" />Musuh: {nearbyEnemy.name} ({nearbyEnemy.hp} HP) - Press E untuk lawan!</span>
            <button onClick={() => onEnemyInteract && onEnemyInteract(nearbyEnemy)} className="bg-pixel-navy px-3 py-1">Lawan</button>
          </div>
        )}
        {nearbyNpc && (
          <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 bg-pixel-amber text-pixel-cream px-4 py-2 text-xs font-bold shadow-lg animate-pulse flex items-center gap-2">
            <span><MessageCircle size={14} className="inline-block mr-1" />{nearbyNpc.name}: Tekan E untuk ngobrol</span>
            <button onClick={() => onNpcInteract && onNpcInteract(nearbyNpc)} className="bg-pixel-navy text-white px-3 py-1">Ngobrol</button>
          </div>
        )}
        {nearbyLevel?.status === 'LOCKED' && !nearbyEnemy && !nearbyNpc && (
          <div className="absolute z-30 bottom-3 left-1/2 -translate-x-1/2 bg-pixel-panel-light text-pixel-cream/50 px-4 py-2 text-xs font-bold shadow">
            <Lock size={12} className="inline-block mr-1" />Terkunci - Selesaikan level sebelumnya!
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-4 flex flex-col items-center gap-2 md:hidden">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button onTouchStart={() => move(0,-1)} className="w-12 h-12 bg-pixel-panel border-2 border-[#2A3444] flex items-center justify-center text-xl active:bg-pixel-amber active:text-white">↑</button>
          <div />
          <button onTouchStart={() => move(-1,0)} className="w-12 h-12 bg-pixel-panel border-2 border-[#2A3444] flex items-center justify-center text-xl active:bg-pixel-amber active:text-white">←</button>
          <button onTouchStart={() => {
            if (nearbyLevel && nearbyLevel.status !== 'LOCKED') onLevelInteract(nearbyLevel)
            else if (nearbyEnemy && onEnemyInteract) onEnemyInteract(nearbyEnemy)
            else if (nearbyNpc && onNpcInteract) onNpcInteract(nearbyNpc)
          }} className="w-12 h-12 bg-pixel-amber text-white border-2 border-pixel-amber flex items-center justify-center text-sm font-bold">E</button>
          <button onTouchStart={() => move(1,0)} className="w-12 h-12 bg-pixel-panel border-2 border-[#2A3444] flex items-center justify-center text-xl active:bg-pixel-amber active:text-white">→</button>
          <div />
          <button onTouchStart={() => move(0,1)} className="w-12 h-12 bg-pixel-panel border-2 border-[#2A3444] flex items-center justify-center text-xl active:bg-pixel-amber active:text-white">↓</button>
          <div />
        </div>
        <p className="text-[10px] text-pixel-cream/50">WASD / Panah gerak, E / Space interaksi</p>
      </div>

      <div className="mt-3 flex gap-3 justify-center text-[11px] text-pixel-cream/50 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pixel-green inline-block" /> Selesai</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pixel-amber inline-block" /> Terbuka</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pixel-panel-light inline-block" /> Terkunci</span>
        <span className="flex items-center gap-1"><Skull size={12} /> Musuh</span>
        <span className="flex items-center gap-1"><MessageCircle size={12} /> NPC</span>
      </div>
    </div>
  )
}

function HouseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function PyramidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 22 22 22 12 2"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  )
}

function TreeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"/>
      <path d="M8 21h8"/>
      <path d="M12 3l-6 6h4l-4 6h12l-4-6h4l-6-6z"/>
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

function HashIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/>
      <line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/>
      <line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}
