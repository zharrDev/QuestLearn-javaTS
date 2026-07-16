import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { RPGMap } from '../../components/rpg/RPGMap'
import { BattleModal } from '../../components/rpg/BattleModal'
import { NpcDialog } from '../../components/rpg/NpcDialog'
import {
  PlayerData,
  RPGLevel,
  RPGEnemy,
  RPGNpc,
  WORLD_THEMES,
} from '../../types/rpg.types'
import { useToastContext } from '../../context/ToastContext'
import {
  Pencil,
  Map,
  Swords,
  MessageSquare,
  Gamepad2,
  Lightbulb,
  MapPin,
  Castle,
  Mountain,
  TreePine,
  Trophy,
} from 'lucide-react'

const HUB_MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,1,1,0,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,2,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

const WORLD_ICONS = [
  <Castle size={20} />,
  <Mountain size={20} />,
  <TreePine size={20} />,
]

export const RPGHubPage: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToastContext()
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [playerPos, setPlayerPos] = useState({ x: 10, y: 7 })
  const [enemies, setEnemies] = useState<RPGEnemy[]>([
    {
      id: 'hub-e1', x: 7, y: 5, emoji: 'Slime',
      name: 'Slime Bingung', hp: 20, maxHp: 20,
      xpReward: 10, defeated: false,
    },
  ])
  const [battleEnemy, setBattleEnemy] = useState<RPGEnemy | null>(null)
  const [dialogNpc, setDialogNpc] = useState<RPGNpc | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('rpg_player')
    if (!saved) {
      navigate('/rpg/customize')
      return
    }
    try {
      setPlayer(JSON.parse(saved))
    } catch {
      navigate('/rpg/customize')
    }
  }, [navigate])

  const portals: RPGLevel[] = [
    { id: 1, nama: 'Desa Bahasa Inggris', x: 5, y: 2, status: 'OPEN', isBoss: false, xpReward: 300 },
    { id: 2, nama: 'Gurun Matematika', x: 14, y: 3, status: 'OPEN', isBoss: false, xpReward: 300 },
    { id: 3, nama: 'Hutan Logika', x: 10, y: 8, status: 'OPEN', isBoss: false, xpReward: 300 },
  ]

  const hubNpcs: RPGNpc[] = [
    {
      id: 'hub-npc1', x: 2, y: 2, emoji: 'Wizard',
      name: 'Master QuestLearn', role: 'Pemimpin Dunia',
      dialogs: [
        `Selamat datang di pusat dunia, ${player?.nickname || 'Petualang'}!`,
        'Ada 3 dunia menunggu: Inggris, Matematika, Logika.',
        'Masuk portal untuk mulai petualanganmu!',
        'Jangan lupa lawan monster dan ngobrol sama NPC untuk XP tambahan!',
      ],
    },
    {
      id: 'hub-npc2', x: 17, y: 5, emoji: 'Map',
      name: 'Penjaga Peta', role: 'Guide',
      dialogs: [
        'Pssst... rahasia: di tiap dunia ada musuh tersembunyi!',
        'Kalahkan mereka dengan quiz battle untuk dapat XP bonus!',
        'NPC juga punya tips berguna, jangan dilewatin ya!',
      ],
    },
  ]

  const handlePortal = (level: RPGLevel) => {
    if (level.id === 1) {
      toast.success(`Masuk ke ${WORLD_THEMES.english.name}`)
      navigate('/rpg/dunia/1')
    } else if (level.id === 2) {
      toast.success(`Masuk ke ${WORLD_THEMES.math.name}`)
      navigate('/rpg/dunia/2')
    } else {
      toast.success(`Masuk ke ${WORLD_THEMES.logic.name}`)
      navigate('/rpg/dunia/3')
    }
  }

  const handleBattleWin = (xp: number) => {
    if (!battleEnemy) return
    setEnemies((prev) =>
      prev.map((e) =>
        e.id === battleEnemy.id ? { ...e, defeated: true, hp: 0 } : e
      )
    )
    toast.success(`${battleEnemy.name} kalah! +${xp} XP!`)
    setBattleEnemy(null)
  }

  if (!player) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-pixel-amber border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 border-2 border-white shadow flex items-center justify-center font-pixel text-[10px]"
            style={{ background: player.color }}
          >
            {player.nickname?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <h1 className="font-pixel font-bold text-[14px] leading-tight">
              Pusat Dunia QuestLearn
            </h1>
            <p className="text-sm text-pixel-cream/50">
              Hai <b className="text-pixel-cream">{player.nickname}</b>! Pilih
              dunia yang mau dijelajahi
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/rpg/customize">
            <Button variant="ghost" size="sm">
              <Pencil size={12} /> Ganti Karakter
            </Button>
          </Link>
          <Link to="/worldmap">
            <Button variant="secondary" size="sm">Mode List Biasa</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {Object.entries(WORLD_THEMES).map(([key, world], idx) => (
          <Card key={key} hover className="relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-20 h-20 blur-2xl opacity-20"
              style={{ background: world.color }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: world.color }}>{WORLD_ICONS[idx]}</span>
                <h3 className="font-bold">{world.name}</h3>
              </div>
              <p className="text-xs text-pixel-cream/50">{world.description}</p>
              <div className="mt-3 text-[11px] px-2 py-1 bg-pixel-dark inline-flex items-center gap-1">
                <MapPin size={10} /> Portal di map:{' '}
                {idx === 0 ? 'Kiri Atas' : idx === 1 ? 'Kanan Atas' : 'Tengah'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Map size={16} /> Peta Dunia - Lawan Monster & Ngobrol NPC
          </h3>
          <span className="text-xs px-2.5 py-1 bg-pixel-amber/20 text-pixel-amber font-bold">
            Hub World + Battle
          </span>
        </div>
        <div className="flex justify-center">
          <RPGMap
            map={HUB_MAP}
            levels={portals}
            enemies={enemies}
            npcs={hubNpcs}
            playerPos={playerPos}
            onMove={setPlayerPos}
            onLevelInteract={handlePortal}
            onEnemyInteract={setBattleEnemy}
            onNpcInteract={setDialogNpc}
            theme="hub"
            playerAvatar={player.avatar}
            playerColor={player.color}
          />
        </div>
      </Card>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Gamepad2 size={16} /> Cara Main + Battle
          </h3>
          <ul className="text-xs text-pixel-cream/50 mt-2 space-y-1 list-disc list-inside">
            <li>
              <b>WASD / Arrow Keys</b> untuk gerak
            </li>
            <li>
              Dekati portal lalu tekan <b>E</b> untuk masuk dunia
            </li>
            <li>
              Dekati musuh tekan E untuk <b>Battle Quiz</b> - jawab benar
              dapat XP!
            </li>
            <li>
              Dekati NPC tekan E untuk ngobrol & dapat tips
            </li>
          </ul>
        </Card>
        <Card>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Lightbulb size={16} /> Tips Custom
          </h3>
          <ul className="text-xs text-pixel-cream/50 mt-2 space-y-1 list-disc list-inside">
            <li>
              Ganti nickname & avatar di <b>Ganti Karakter</b> - 8 avatar +
              warna custom
            </li>
            <li>Nickname max 12 karakter, kesimpan di localStorage</li>
            <li>
              Kalahkan musuh di tiap dunia untuk XP bonus sebelum quest
            </li>
            <li>
              Mode RPG gabung sama sistem quest lama, progress tetap kesimpan
            </li>
          </ul>
        </Card>
      </div>

      {battleEnemy && (
        <BattleModal
          enemy={battleEnemy}
          onClose={() => setBattleEnemy(null)}
          onWin={handleBattleWin}
          theme="hub"
        />
      )}
      {dialogNpc && (
        <NpcDialog
          npc={dialogNpc}
          onClose={() => setDialogNpc(null)}
        />
      )}
    </div>
  )
}
