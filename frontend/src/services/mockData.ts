import { Dunia } from '../types/dunia.types'
import { Badge } from '../types/badge.types'
import { LeaderboardEntry } from '../types/leaderboard.types'

export const mockDunia: Dunia[] = [
  { id: 1, nama: "English", slug: "bahasa-inggris", deskripsi: "Type English words, phrases and everyday sentences", backgroundColor: "#4C7A5E", urutan: 1, isActive: true, totalLevel: 6, completedLevel: 2, iconUrl: "🇬🇧", createdAt: new Date().toISOString() },
  { id: 2, nama: "Bahasa Indonesia", slug: "bahasa-indonesia", deskripsi: "Ketik kata, frasa dan kalimat bahasa Indonesia", backgroundColor: "#D97757", urutan: 2, isActive: true, totalLevel: 6, completedLevel: 0, iconUrl: "🇮🇩", createdAt: new Date().toISOString() },
  { id: 3, nama: "Español", slug: "bahasa-spanyol", deskripsi: "Escribe palabras, frases y oraciones en español", backgroundColor: "#D98E3B", urutan: 3, isActive: true, totalLevel: 6, completedLevel: 1, iconUrl: "🇪🇸", createdAt: new Date().toISOString() },
  { id: 4, nama: "Français", slug: "bahasa-prancis", deskripsi: "Tapez des mots, des phrases et des textes en français", backgroundColor: "#8A7BC8", urutan: 4, isActive: true, totalLevel: 6, completedLevel: 0, iconUrl: "🇫🇷", createdAt: new Date().toISOString() },
  { id: 5, nama: "Deutsch", slug: "bahasa-jerman", deskripsi: "Tippe deutsche Wörter, Sätze und Alltagstexte", backgroundColor: "#4A7BA8", urutan: 5, isActive: true, totalLevel: 6, completedLevel: 0, iconUrl: "🇩🇪", createdAt: new Date().toISOString() },
  { id: 6, nama: "Português", slug: "bahasa-portugis", deskripsi: "Digite palavras, frases e textos em português", backgroundColor: "#2E9AA8", urutan: 6, isActive: true, totalLevel: 6, completedLevel: 0, iconUrl: "🇵🇹", createdAt: new Date().toISOString() },
]

export const mockBadges: Badge[] = [
  { id: 1, nama: "Langkah Pertama", kode: "FIRST_STEP", deskripsi: "Selesaikan sesi typing pertamamu!", warna: "#7A9B76", syaratType: "FIRST_LEVEL", syaratValue: 1, earned: true, earnedAt: new Date().toISOString() },
  { id: 2, nama: "Pengetik Cepat", kode: "STREAK_3", deskripsi: "Capai 40 WPM dalam 1 sesi", warna: "#E8A93B", syaratType: "STREAK", syaratValue: 3, earned: true },
  { id: 3, nama: "Kolektor XP", kode: "XP_100", deskripsi: "Kumpulkan 1000 XP dari typing", warna: "#2C5F5D", syaratType: "XP", syaratValue: 100, earned: false },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 1, nama: "Demo Siswa", totalXp: 1240, wpm: 52, akurasi: 96, rank: 1 },
  { userId: 2, nama: "Rizky Pratama", totalXp: 1120, wpm: 47, akurasi: 93, rank: 2 },
  { userId: 3, nama: "Siti Aminah", totalXp: 980, wpm: 41, akurasi: 90, rank: 3 },
  { userId: 4, nama: "Budi Santoso", totalXp: 870, wpm: 36, akurasi: 88, rank: 4 },
  { userId: 5, nama: "Dewi Lestari", totalXp: 760, wpm: 31, akurasi: 85, rank: 5 },
]
