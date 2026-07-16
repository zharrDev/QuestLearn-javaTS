import React, { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import { createGameConfig } from '../../game/config'
import { GAME_WIDTH, GAME_HEIGHT } from '../../game/constants'
import { PlatformerScene, PlatformerCallbacks } from '../../game/scenes/PlatformerScene'
import { RPGLevel } from '../../types/rpg.types'

interface Props {
  duniaId: number
  levels: RPGLevel[]
  onLevelGate: (level: RPGLevel) => boolean
  onLevelEnter: (level: RPGLevel) => void
  playerAvatar: string
  theme: 'english' | 'math' | 'logic'
  playerHp?: number
  playerMaxHp?: number
  playerCoins?: number
}

export const PhaserGame: React.FC<Props> = ({
  duniaId,
  levels,
  onLevelGate,
  onLevelEnter,
  playerAvatar,
  theme,
  playerHp = 50,
  playerMaxHp = 50,
  playerCoins = 0,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [currentHp, setCurrentHp] = useState(playerHp)
  const [maxHp] = useState(playerMaxHp)
  const [coins, setCoins] = useState(playerCoins)
  const [nearbyDoorName, setNearbyDoorName] = useState<string | null>(null)

  const handleGameOver = useCallback(() => {
    setIsGameOver(true)
  }, [])

  const handleLevelEnterCb = useCallback((level: { id: number; nama: string }) => {
    onLevelEnter(level as RPGLevel)
  }, [onLevelEnter])

  const handleLevelGateCb = useCallback((level: { id: number; nama: string; status: string }) => {
    return onLevelGate(level as RPGLevel)
  }, [onLevelGate])

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) return

    const callbacks: PlatformerCallbacks = {
      onLevelEnter: handleLevelEnterCb,
      onLevelGate: handleLevelGateCb,
      onGameOver: handleGameOver,
      onCoinCollect: (total: number) => setCoins(total),
      onHpChange: (hp: number, _maxHp: number) => { setCurrentHp(hp) },
    }

    const config = createGameConfig(gameContainerRef.current)
    const game = new Phaser.Game(config)
    gameRef.current = game

    game.events.on('ready', () => {
      game.scene.start('PlatformerScene', {
        duniaId,
        levels: levels.map(l => ({
          id: l.id,
          nama: l.nama,
          status: l.status,
          isBoss: l.isBoss,
          xpReward: l.xpReward,
        })),
        theme,
        playerAvatar,
        playerHp,
        playerMaxHp,
        playerCoins,
        callbacks,
      })
    })

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [duniaId, theme, playerAvatar])

  const handleContinue = () => {
    setIsGameOver(false)
    const scene = gameRef.current?.scene.getScene('PlatformerScene') as PlatformerScene | null
    if (scene) {
      scene.respawn()
      setCurrentHp(scene['pMaxHp'])
    }
  }

  const handleQuit = () => {
    setIsGameOver(false)
    window.location.href = '/rpg'
  }

  const borderColor = theme === 'english' ? '#D97757' : theme === 'math' ? '#2C5F5D' : '#E8A93B'

  return (
    <div className="relative select-none">
      <div className="w-full flex justify-center">
        <div
          ref={gameContainerRef}
          className="border-[4px] shadow-pixel-lg cursor-pointer overflow-hidden"
          style={{ borderColor, maxWidth: GAME_WIDTH, width: '100%' }}
        />
      </div>

      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20" style={{ maxWidth: GAME_WIDTH, margin: '0 auto' }}>
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
