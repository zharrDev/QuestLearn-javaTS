export interface PlayerData {
  nickname: string
  avatar: string
  color: string
  coins?: number
  inventory?: RPGItem[]
  hp?: number
  maxHp?: number
}

export interface RPGItem {
  id: string
  name: string
  emoji: string
  description: string
  price: number
  type: 'potion' | 'weapon' | 'boost' | 'key'
  effect?: string
  owned?: number
}

export const SHOP_ITEMS: RPGItem[] = [
  { id: 'potion-small', name: 'Ramuan Kecil', emoji: '🧪', description: '+20 HP', price: 20, type: 'potion', effect: 'heal_20' },
  { id: 'potion-big', name: 'Ramuan Besar', emoji: '⚗️', description: '+50 HP', price: 40, type: 'potion', effect: 'heal_50' },
  { id: 'sword-wood', name: 'Pedang Kayu', emoji: '🗡️', description: '+10% damage quiz', price: 50, type: 'weapon', effect: 'damage_10' },
  { id: 'sword-iron', name: 'Pedang Besi', emoji: '⚔️', description: '+25% damage, +10 XP bonus', price: 100, type: 'weapon', effect: 'damage_25' },
  { id: 'xp-boost', name: 'XP Boost', emoji: '⚡', description: '+50% XP selama 3 battle', price: 30, type: 'boost', effect: 'xp_50' },
  { id: 'key-boss', name: 'Kunci Boss', emoji: '🗝️', description: 'Buka boss battle tanpa harus selesaikan semua level', price: 150, type: 'key', effect: 'unlock_boss' },
]

export interface RPGLevel {
  id: number
  nama: string
  x: number
  y: number
  status: 'LOCKED' | 'OPEN' | 'COMPLETED'
  isBoss: boolean
  xpReward: number
}

export interface RPGTile {
  type: 'grass' | 'wall' | 'water' | 'sand' | 'portal-english' | 'portal-math' | 'portal-logic' | 'spawn'
}

export interface Position {
  x: number
  y: number
}

export interface RPGEnemy {
  id: string
  x: number
  y: number
  emoji: string
  name: string
  hp: number
  maxHp: number
  defeated: boolean
  patrol?: Position[]
  xpReward: number
  coinReward?: number
  isBoss?: boolean
}

export interface RPGNpc {
  id: string
  x: number
  y: number
  emoji: string
  name: string
  dialogs: string[]
  role: string
  isShop?: boolean
}

export interface BossData {
  id: number
  name: string
  emoji: string
  hp: number
  maxHp: number
  theme: 'english' | 'math' | 'logic'
  description: string
  rewardXp: number
  rewardCoin: number
  rewardItem?: RPGItem
}

export const BOSSES: Record<number, BossData> = {
  1: { id: 1, name: 'Raja Grammar', emoji: '👑🧙‍♂️', hp: 150, maxHp: 150, theme: 'english', description: 'Penguasa tata bahasa Inggris! Kalahkan dengan 5 soal berturut!', rewardXp: 200, rewardCoin: 100, rewardItem: SHOP_ITEMS[3] },
  2: { id: 2, name: 'Titan Angka', emoji: '🤖🔢', hp: 180, maxHp: 180, theme: 'math', description: 'Raksasa penjaga gurun angka! Butuh logika matematika tingkat dewa!', rewardXp: 250, rewardCoin: 120 },
  3: { id: 3, name: 'Maha Puzzle', emoji: '🧠👁️', hp: 200, maxHp: 200, theme: 'logic', description: 'Entitas teka-teki murni! Hanya yang paham logika bisa mengalahkannya!', rewardXp: 300, rewardCoin: 150 },
}

export const AVATARS = [
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Penyihir', color: '#D97757' },
  { id: 'scholar', emoji: '👩‍🎓', name: 'Sarjana', color: '#2C5F5D' },
  { id: 'explorer', emoji: '🧭', name: 'Penjelajah', color: '#E8A93B' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', color: '#3A322C' },
  { id: 'knight', emoji: '⚔️', name: 'Ksatria', color: '#7A9B76' },
  { id: 'elf', emoji: '🧝‍♀️', name: 'Peri', color: '#C97064' },
  { id: 'robot', emoji: '🤖', name: 'Robot', color: '#8A7F74' },
  { id: 'dragon', emoji: '🐉', name: 'Naga Kecil', color: '#D97757' },
]

export const WORLD_THEMES = {
  english: {
    name: 'Bahasa Inggris',
    icon: '🇬🇧',
    color: '#D97757',
    bg: '#FDF2EF',
    grass: '#F5D5CB',
    wall: '#E8B4A0',
    description: 'Desa Vocabulary - tempat kata-kata hidup!',
    tiles: {
      grass: '🌱',
      wall: '🏠',
      decor: ['📚', '📖', '✉️', '🔤'],
    }
  },
  math: {
    name: 'Matematika Dasar',
    icon: '🔢',
    color: '#2C5F5D',
    bg: '#E8F0F0',
    grass: '#C5D9D8',
    wall: '#8FB0AE',
    description: 'Gurun Angka - pecahkan teka-teki bilangan!',
    tiles: {
      grass: '🏜️',
      wall: '🗿',
      decor: ['🔢', '➕', '➗', '🧮'],
    }
  },
  logic: {
    name: 'Logika & Pengetahuan',
    icon: '🧠',
    color: '#E8A93B',
    bg: '#FEF6E6',
    grass: '#FDEDB8',
    wall: '#F5D78E',
    description: 'Hutan Puzzle - uji otakmu di sini!',
    tiles: {
      grass: '🌲',
      wall: '🌳',
      decor: ['🧩', '💡', '🔍', '🎯'],
    }
  }
}
