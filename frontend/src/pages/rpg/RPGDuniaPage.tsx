import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { RPGMap } from '../../components/rpg/RPGMap'
import { PixelPlatformer } from '../../components/rpg/PixelPlatformer'
import { PhaserGame } from '../../components/rpg/PhaserGame'
import { BattleModal } from '../../components/rpg/BattleModal'
import { NpcDialog } from '../../components/rpg/NpcDialog'
import { ShopModal } from '../../components/rpg/ShopModal'
import { BossBattleModal } from '../../components/rpg/BossBattleModal'
import { PlayerData, RPGLevel, RPGEnemy, RPGNpc, WORLD_THEMES, BOSSES, BossData, RPGItem } from '../../types/rpg.types'
import { levelService } from '../../services/level.service'
import { mockLevels } from '../../services/mockData'
import { useToastContext } from '../../context/ToastContext'
import { useRPGPlayer } from '../../hooks/useRPGPlayer'
import { Crown, Store, Sparkles, Gamepad2, Map, ArrowLeft, Package, Zap } from 'lucide-react'

const DUNIA_MAPS: Record<number, number[][]> = {
  1: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,0,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  2: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,0,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
    [1,1,0,1,1,1,1,1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  3: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
}

const LEVEL_POSITIONS: Record<number, { x: number, y: number }[]> = {
  1: [{ x: 2, y: 2 }, { x: 7, y: 2 }, { x: 12, y: 2 }, { x: 2, y: 5 }, { x: 7, y: 9 }, { x: 12, y: 11 }],
  2: [{ x: 2, y: 1 }, { x: 8, y: 1 }, { x: 12, y: 3 }, { x: 3, y: 5 }, { x: 9, y: 9 }, { x: 12, y: 11 }],
  3: [{ x: 1, y: 1 }, { x: 7, y: 1 }, { x: 11, y: 3 }, { x: 5, y: 5 }, { x: 3, y: 11 }, { x: 11, y: 11 }],
}

const ENEMIES_BY_DUNIA: Record<number, Omit<RPGEnemy, 'defeated'>[]> = {
  1: [
    { id: 'e1-1', x: 3, y: 3, emoji: 'Alien', name: 'Monster Typo', hp: 30, maxHp: 30, xpReward: 15, coinReward: 10 },
    { id: 'e1-2', x: 10, y: 5, emoji: 'Ghost', name: 'Hantu Grammar', hp: 40, maxHp: 40, xpReward: 20, coinReward: 15 },
  ],
  2: [
    { id: 'e2-1', x: 4, y: 3, emoji: 'Scorpion', name: 'Kalajengking Angka', hp: 35, maxHp: 35, xpReward: 15, coinReward: 12 },
    { id: 'e2-2', x: 11, y: 7, emoji: 'Alien', name: 'Bug Hitungan', hp: 45, maxHp: 45, xpReward: 25, coinReward: 18 },
  ],
  3: [
    { id: 'e3-1', x: 2, y: 5, emoji: 'Zombie', name: 'Zombie Bingung', hp: 30, maxHp: 30, xpReward: 15, coinReward: 10 },
    { id: 'e3-2', x: 9, y: 3, emoji: 'Ogre', name: 'Ogre Teka-teki', hp: 50, maxHp: 50, xpReward: 30, coinReward: 20 },
  ],
}

const NPCS_BY_DUNIA: Record<number, RPGNpc[]> = {
  1: [
    { id: 'npc1-1', x: 1, y: 5, emoji: 'Teacher', name: 'Bu Guru Siti', role: 'Guru Inggris', dialogs: ['Hai! Selamat datang di Desa Bahasa Inggris!', 'Di sini kita belajar vocabulary & grammar dengan cara seru.', 'Coba kalahkan Monster Typo di dekat sini, dia suka bikin typo!', 'Kalau kamu rajin, kamu bisa jadi master grammar! Semangat!'] },
    { id: 'npc1-2', x: 13, y: 5, emoji: 'Books', name: 'Pak Pustaka', role: 'Penjaga Perpustakaan', dialogs: ['Shhh... ini perpustakaan ajaib.', 'Setiap buku di sini adalah portal ke ilmu baru.', 'Buka level-level itu untuk dapatkan XP dan buka ilmu tersembunyi!'] },
    { id: 'shop1', x: 6, y: 5, emoji: 'Shop', name: 'Toko Desa', role: 'Pedagang', dialogs: ['Selamat datang di toko! Mau beli ramuan atau pedang?'], isShop: true },
  ],
  2: [
    { id: 'npc2-1', x: 1, y: 5, emoji: 'Scientist', name: 'Prof. Aljabar', role: 'Ilmuwan Gurun', dialogs: ['Selamat datang di Gurun Matematika!', 'Angka-angka di sini hidup dan bergerak!', 'KALAJENGKING ANGKA itu licik, dia suka ngacak-ngacak perhitungan.', 'Kalahkan dia dengan soal matematika untuk dapat XP!'] },
    { id: 'npc2-2', x: 6, y: 1, emoji: 'Wizard', name: 'Penyihir Hitung', role: 'Master Bilangan', dialogs: ['Aku sudah 100 tahun menghitung di gurun ini...', 'Rahasia matematika adalah konsistensi, bukan kecepatan.', 'Selesaikan 1 level tiap hari, jaga streak-mu!'] },
    { id: 'shop2', x: 7, y: 5, emoji: 'Shop', name: 'Bazaar Gurun', role: 'Pedagang', dialogs: ['Gurun panas... butuh ramuan?'], isShop: true },
  ],
  3: [
    { id: 'npc3-1', x: 6, y: 5, emoji: 'Elf', name: 'Peri Logika', role: 'Penjaga Hutan Puzzle', dialogs: ['Hai penjelajah! Hutan ini penuh teka-teki...', 'Jangan asal jalan, perhatikan pola di sekitarmu!', 'Ogre Teka-teki di sana sangat kuat, butuh 100% logika untuk mengalahkannya!', 'Petunjuk: jawaban kadang ada di pertanyaan itu sendiri.'] },
    { id: 'npc3-2', x: 1, y: 9, emoji: 'Owl', name: 'Burung Hantu Bijak', role: 'Oracle', dialogs: ['Hoo... hoo...', 'Aku melihat masa depanmu... kamu akan jadi master logika!', 'Tapi ingat: logika tanpa pengetahuan itu kosong.', 'Jelajahi Pengetahuan Umum juga, jangan cuma pola!'] },
    { id: 'shop3', x: 12, y: 5, emoji: 'Shop', name: 'Toko Hutan', role: 'Pedagang', dialogs: ['Di hutan ini, coin lebih berharga dari emas...'], isShop: true },
  ],
}

export const RPGDuniaPage: React.FC = () => {
  const { id } = useParams()
  const duniaId = Number(id) as 1 | 2 | 3
  const navigate = useNavigate()
  const toast = useToastContext()
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [levels, setLevels] = useState<RPGLevel[]>([])
  const [enemies, setEnemies] = useState<RPGEnemy[]>([])
  const [npcs, setNpcs] = useState<RPGNpc[]>([])
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 })
  const [loading, setLoading] = useState(true)
  const [battleEnemy, setBattleEnemy] = useState<RPGEnemy | null>(null)
  const [dialogNpc, setDialogNpc] = useState<RPGNpc | null>(null)
  const [shopOpen, setShopOpen] = useState(false)
  const [bossBattle, setBossBattle] = useState<BossData | null>(null)
  const [defeatedCount, setDefeatedCount] = useState(0)
  const [viewMode, setViewMode] = useState<'platformer' | 'topdown' | 'phaser'>('platformer')
  const { coins, inventory, addCoins, buyItem, refresh } = useRPGPlayer()

  const themes = { 1: WORLD_THEMES.english, 2: WORLD_THEMES.math, 3: WORLD_THEMES.logic }
  const theme = themes[duniaId] || themes[1]
  const themeKey = duniaId === 1 ? 'english' : duniaId === 2 ? 'math' : 'logic'

  useEffect(() => {
    const saved = localStorage.getItem('rpg_player')
    if (!saved) { navigate('/rpg/customize'); return }
    try { setPlayer(JSON.parse(saved)) } catch { navigate('/rpg/customize') }
    refresh()
  }, [navigate])

  useEffect(() => {
    levelService.getByDunia(duniaId).then(res => {
      const data = res.data.data
      const source = Array.isArray(data) ? data : mockLevels.filter(l => l.duniaId === duniaId)
      const posList = LEVEL_POSITIONS[duniaId]
      const rpgLevels: RPGLevel[] = source.slice(0, 6).map((lvl, idx) => ({
        id: lvl.id, nama: lvl.nama, x: posList[idx]?.x || 2 + idx * 2, y: posList[idx]?.y || 2,
        status: (lvl.status as any) || (idx === 0 ? 'OPEN' : idx === 1 ? 'OPEN' : idx < 3 ? 'OPEN' : 'LOCKED'),
        isBoss: lvl.isBossLevel || idx === 5, xpReward: lvl.xpReward,
      }))
      if (rpgLevels.length >= 3) {
        rpgLevels[0].status = 'COMPLETED'; rpgLevels[1].status = 'COMPLETED'; rpgLevels[2].status = 'OPEN'
        if (rpgLevels[3]) rpgLevels[3].status = 'LOCKED'
      }
      setLevels(rpgLevels)
    }).catch(() => {
      const source = mockLevels.filter(l => l.duniaId === duniaId)
      const posList = LEVEL_POSITIONS[duniaId]
      const rpgLevels: RPGLevel[] = source.slice(0, 6).map((lvl, idx) => ({
        id: lvl.id, nama: lvl.nama, x: posList[idx]?.x || 2, y: posList[idx]?.y || 2,
        status: idx < 2 ? 'COMPLETED' : idx === 2 ? 'OPEN' : 'LOCKED', isBoss: idx === 5, xpReward: lvl.xpReward,
      }))
      setLevels(rpgLevels)
    }).finally(() => setLoading(false))

    const eList = (ENEMIES_BY_DUNIA[duniaId] || []).map(e => ({ ...e, defeated: false }))
    const nList = NPCS_BY_DUNIA[duniaId] || []
    setEnemies(eList as RPGEnemy[])
    setNpcs(nList)
  }, [duniaId])

  const handleLevelInteract = (lvl: RPGLevel) => {
    if (lvl.status === 'LOCKED') { toast.warning('Level terkunci! Selesaikan level sebelumnya dulu (Butuh 70% untuk lanjut)'); return }
    if (lvl.isBoss) {
      const boss = BOSSES[duniaId]
      if (boss) { setBossBattle(boss); return }
    }
    toast.success(`Masuk ke ${lvl.nama} - Semangat!`)
    navigate(`/quest/${lvl.id}`)
  }

  const handleEnemyInteract = (enemy: RPGEnemy) => { if (enemy.defeated) return; setBattleEnemy(enemy) }

  const handleBattleWin = (xp: number) => {
    if (!battleEnemy) return
    const coin = (battleEnemy as any).coinReward || 10
    setEnemies(prev => prev.map(e => e.id === battleEnemy.id ? { ...e, defeated: true, hp: 0 } : e))
    setDefeatedCount(c => c + 1)
    addCoins(coin)
    toast.success(`[WIN] ${battleEnemy.name} kalah! +${xp} XP +${coin} Coin!`)
    setBattleEnemy(null)
  }

  const handleBossWin = (xp: number, coin: number, item?: RPGItem) => {
    addCoins(coin)
    if (item) {
      const invRaw = localStorage.getItem('rpg_inventory')
      let inv: RPGItem[] = []
      if (invRaw) try { inv = JSON.parse(invRaw) } catch {}
      const existing = inv.find(i => i.id === item.id)
      if (existing) inv = inv.map(i => i.id === item.id ? { ...i, owned: (i.owned || 1) + 1 } : i)
      else inv.push({ ...item, owned: 1 })
      localStorage.setItem('rpg_inventory', JSON.stringify(inv))
    }
    toast.success(`[BOSS WIN] BOSS ${BOSSES[duniaId].name} KALAH! +${xp} XP +${coin} Coin! Dunia ${theme.name} selesai!`)
    setBossBattle(null)
    setLevels(prev => prev.map(l => ({ ...l, status: 'COMPLETED' as const })))
  }

  const handleNpcInteract = (npc: RPGNpc) => {
    if ((npc as any).isShop) { setShopOpen(true) }
    else setDialogNpc(npc)
  }

  const handleBuy = (item: any) => {
    const ok = buyItem(item)
    if (ok) toast.success(`Berhasil beli ${item.name} ${item.emoji}!`)
    else toast.error(`Coin tidak cukup! Kamu punya ${coins}, butuh ${item.price}`)
    return ok
  }

  if (!player || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-pixel-amber border-t-transparent"/></div>
  }

  const map = DUNIA_MAPS[duniaId] || DUNIA_MAPS[1]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/rpg" className="w-10 h-10 bg-pixel-panel-light flex items-center justify-center hover:bg-pixel-panel-light/80"><ArrowLeft size={20} /></Link>
          <div className="w-12 h-12 flex items-center justify-center text-2xl" style={{ background: theme.color + '20', border: `2px solid ${theme.color}30` }}>{theme.icon}</div>
          <div>
            <h1 className="font-pixel font-bold text-[14px] leading-tight">{theme.name} - Mode RPG</h1>
            <p className="text-sm text-pixel-cream/50">{theme.description} • {levels.filter(l=>l.status==='COMPLETED').length}/{levels.length} selesai • {defeatedCount} musuh kalah • {coins} coin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-pixel-panel border border-[#2A3444] px-3 py-1.5">
            <div className="w-6 h-6 flex items-center justify-center text-sm" style={{ background: player.color }}>{player.avatar}</div>
            <span className="text-sm font-bold">{player.nickname}</span>
            <span className="text-xs bg-pixel-navy text-white px-2 py-0.5"><Sparkles size={12} className="inline-block mr-0.5" />{coins}</span>
            <Link to="/rpg/customize" className="text-[10px] bg-pixel-panel-light px-2 py-0.5">Ganti</Link>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShopOpen(true)}><Store size={16} className="mr-1" />Shop</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="p-3 text-center"><p className="text-[10px] text-pixel-cream/50 font-bold">LEVEL SELESAI</p><p className="text-xl font-bold">{levels.filter(l=>l.status==='COMPLETED').length}/{levels.length}</p></Card>
        <Card className="p-3 text-center"><p className="text-[10px] text-pixel-cream/50 font-bold">MUSUH KALAH</p><p className="text-xl font-bold">{defeatedCount}</p></Card>
        <Card className="p-3 text-center"><p className="text-[10px] text-pixel-cream/50 font-bold">COIN</p><p className="text-xl font-bold"><Sparkles size={20} className="inline-block mr-1" />{coins}</p></Card>
        <Card className="p-3 text-center" style={{ borderColor: theme.color + '40' }}><p className="text-[10px] text-pixel-cream/50 font-bold">BOSS</p><Button size="sm" className="mt-1 w-full text-[11px]" onClick={() => setBossBattle(BOSSES[duniaId])}>Lawan Boss <Crown size={14} className="ml-1" /></Button></Card>
      </div>

      <Card className="overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <h3 className="font-bold flex items-center gap-2"><span>{theme.icon}</span> {theme.name} - Side-Scroller ala Minecraft + Shop & Boss!</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 font-bold" style={{ background: theme.color + '20', color: theme.color }}>RPG + Shop + Boss</span>
            <div className="flex bg-pixel-panel-light p-1">
              <button onClick={() => setViewMode('platformer')} className={`px-3 py-1 text-xs font-bold ${viewMode==='platformer' ? 'bg-pixel-navy text-white' : 'text-pixel-cream/50'}`}><Gamepad2 size={14} className="inline-block mr-1" />Canvas</button>
              <button onClick={() => setViewMode('phaser')} className={`px-3 py-1 text-xs font-bold ${viewMode==='phaser' ? 'bg-pixel-navy text-white' : 'text-pixel-cream/50'}`}><Zap size={14} className="inline-block mr-1" />Phaser 3</button>
              <button onClick={() => setViewMode('topdown')} className={`px-3 py-1 text-xs font-bold ${viewMode==='topdown' ? 'bg-pixel-navy text-white' : 'text-pixel-cream/50'}`}><Map size={14} className="inline-block mr-1" />Top-Down</button>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          {viewMode === 'platformer' ? (
            <div className="w-full">
              <PixelPlatformer duniaId={duniaId} levels={levels} onLevelGate={(lvl) => {
                if (lvl.status === 'LOCKED') { toast.warning(`Terkunci! ${lvl.nama} terkunci! Harus jawab soal dulu (70%) baru bisa lanjut!`); return false }
                if (lvl.isBoss) { setBossBattle(BOSSES[duniaId]); return false }
                return true
              }} onLevelEnter={handleLevelInteract} playerAvatar={player.avatar} theme={themeKey} />
              <p className="text-center text-[11px] text-pixel-cream/50 mt-3">⚔️ A/D gerak • W/Space lompat • Enter/J serang pedang • E interaksi • Kumpulkan koin & hati • Kalahkan musuh! • Hati-hati paku!</p>
            </div>
          ) : viewMode === 'phaser' ? (
            <div className="w-full">
              <PhaserGame
                duniaId={duniaId}
                levels={levels}
                onLevelGate={(lvl) => {
                  if (lvl.status === 'LOCKED') { toast.warning(`Terkunci! ${lvl.nama} terkunci! Harus jawab soal dulu (70%) baru bisa lanjut!`); return false }
                  if (lvl.isBoss) { setBossBattle(BOSSES[duniaId]); return false }
                  return true
                }}
                onLevelEnter={handleLevelInteract}
                playerAvatar={player.avatar}
                theme={themeKey}
                playerHp={50}
                playerMaxHp={50}
                playerCoins={coins}
              />
              <p className="text-center text-[11px] text-pixel-cream/50 mt-3">⚡ Phaser 3 Engine • A/D gerak • W/Space lompat • Enter/J serang pedang • E interaksi</p>
            </div>
          ) : (
            <RPGMap map={map} levels={levels} enemies={enemies} npcs={npcs} playerPos={playerPos} onMove={setPlayerPos} onLevelInteract={handleLevelInteract} onEnemyInteract={handleEnemyInteract} onNpcInteract={handleNpcInteract} theme={themeKey} playerAvatar={player.avatar} playerColor={player.color} />
          )}
        </div>
      </Card>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card><h3 className="font-bold text-sm"><Package size={16} className="inline-block mr-1" />Inventory ({inventory.reduce((a,b)=>a+(b.owned||0),0)} item)</h3><div className="flex gap-2 mt-2 flex-wrap">{inventory.length===0 ? <p className="text-xs text-pixel-cream/50">Kosong - beli di shop!</p> : inventory.map(it => <div key={it.id} className="px-2 py-1 bg-pixel-dark border border-[#2A3444] text-xs flex items-center gap-1">{it.emoji} {it.name} x{it.owned}</div>)}</div></Card>
        <Card><h3 className="font-bold text-sm"><Crown size={16} className="inline-block mr-1" />Boss Battle Tiap Dunia</h3><p className="text-xs text-pixel-cream/50 mt-1">Kalahkan boss di level 6: {BOSSES[duniaId].name} - HP {BOSSES[duniaId].hp}, 5 ronde quiz! Hadiah: +{BOSSES[duniaId].rewardXp} XP +{BOSSES[duniaId].rewardCoin} Coin!</p><Button size="sm" className="mt-2 w-full" onClick={() => setBossBattle(BOSSES[duniaId])}>Lawan {BOSSES[duniaId].name} Sekarang!</Button></Card>
      </div>

      {battleEnemy && <BattleModal enemy={battleEnemy} onClose={() => setBattleEnemy(null)} onWin={handleBattleWin} theme={themeKey} />}
      {dialogNpc && <NpcDialog npc={dialogNpc} onClose={() => setDialogNpc(null)} />}
      {shopOpen && <ShopModal coins={coins} inventory={inventory} onClose={() => setShopOpen(false)} onBuy={handleBuy} theme={themeKey} />}
      {bossBattle && <BossBattleModal boss={bossBattle} onClose={() => setBossBattle(null)} onWin={handleBossWin} playerName={player.nickname} />}
    </div>
  )
}


