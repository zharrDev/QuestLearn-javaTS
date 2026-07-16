
import { Dunia } from '../types/dunia.types'
import { Level } from '../types/level.types'
import { Soal } from '../types/soal.types'
import { Badge } from '../types/badge.types'
import { LeaderboardEntry } from '../types/leaderboard.types'
export const mockDunia: Dunia[] = [
  { id: 1, nama: "Bahasa Inggris", slug: "bahasa-inggris", deskripsi: "Kuasai vocabulary, grammar, dan listening dari dasar hingga menengah", backgroundColor: "#D97757", urutan: 1, isActive: true, totalLevel: 6, completedLevel: 2, iconUrl: "🇬🇧", createdAt: new Date().toISOString() },
  { id: 2, nama: "Matematika Dasar", slug: "matematika-dasar", deskripsi: "Asah kemampuan berhitung, aljabar, geometri, dan logika matematika", backgroundColor: "#2C5F5D", urutan: 2, isActive: true, totalLevel: 6, completedLevel: 0, iconUrl: "🔢", createdAt: new Date().toISOString() },
  { id: 3, nama: "Logika & Pengetahuan Umum", slug: "logika-pengetahuan-umum", deskripsi: "Tingkatkan kemampuan berpikir kritis, deduksi, dan wawasan umum", backgroundColor: "#E8A93B", urutan: 3, isActive: true, totalLevel: 6, completedLevel: 1, iconUrl: "🧠", createdAt: new Date().toISOString() },
]
export const mockLevels: Level[] = [
  { id: 1, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Vocabulary Dasar", deskripsi: "Kata benda sehari-hari & sapaan", urutan: 1, xpReward: 50, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'COMPLETED' },
  { id: 2, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Simple Present Tense", deskripsi: "Kebiasaan & fakta umum", urutan: 2, xpReward: 60, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'COMPLETED' },
  { id: 3, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Vocabulary Menengah", deskripsi: "Kata sifat & kerja umum", urutan: 3, xpReward: 70, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'OPEN' },
  { id: 4, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Simple Past Tense", deskripsi: "Menceritakan masa lalu", urutan: 4, xpReward: 80, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'LOCKED' },
  { id: 5, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Listening Dasar", deskripsi: "Memahami percakapan singkat", urutan: 5, xpReward: 90, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'LOCKED' },
  { id: 6, duniaId: 1, duniaNama: "Bahasa Inggris", nama: "Grammar Campuran", deskripsi: "Ujian boss - semua materi campur", urutan: 6, xpReward: 100, minScoreLulus: 70, isBossLevel: true, isActive: true, totalSoal: 8, status: 'LOCKED' },
  { id: 7, duniaId: 2, duniaNama: "Matematika Dasar", nama: "Operasi Hitung Dasar", deskripsi: "Tambah & kurang cepat", urutan: 1, xpReward: 50, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'OPEN' },
  { id: 8, duniaId: 2, duniaNama: "Matematika Dasar", nama: "Perkalian & Pembagian", deskripsi: "Perkalian & pembagian 1-100", urutan: 2, xpReward: 60, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'LOCKED' },
  { id: 9, duniaId: 3, duniaNama: "Logika & Pengetahuan Umum", nama: "Pola & Urutan", deskripsi: "Lanjutkan pola angka/gambar", urutan: 1, xpReward: 50, minScoreLulus: 70, isBossLevel: false, isActive: true, totalSoal: 8, status: 'COMPLETED' },
]
export const mockSoal: Soal[] = [
  { id: 1, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "Choose the adjective: 'The sky is ____'", tipeSoal: "PILIHAN_GANDA", opsiA: "beautiful", opsiB: "quickly", opsiC: "beautifully", opsiD: "beauty", jawabanBenar: "A", pembahasan: "beautiful = kata sifat, menjelaskan noun sky.", xpPoint: 12, tingkatKesulitan: "SEDANG" },
  { id: 2, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "Opposite of 'Happy' is ____", tipeSoal: "PILIHAN_GANDA", opsiA: "Sad", opsiB: "Glad", opsiC: "Joyful", opsiD: "Excited", jawabanBenar: "A", pembahasan: "Happy vs Sad antonim.", xpPoint: 12, tingkatKesulitan: "MUDAH" },
  { id: 3, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "Verb for 'Berlari' is", tipeSoal: "PILIHAN_GANDA", opsiA: "Run", opsiB: "Walk", opsiC: "Jump", opsiD: "Sit", jawabanBenar: "A", pembahasan: "Run = Berlari.", xpPoint: 12, tingkatKesulitan: "MUDAH" },
  { id: 4, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "What is 'Brave'?", tipeSoal: "PILIHAN_GANDA", opsiA: "Takut", opsiB: "Berani", opsiC: "Sedih", opsiD: "Senang", jawabanBenar: "B", pembahasan: "Brave = Berani.", xpPoint: 12, tingkatKesulitan: "MUDAH" },
  { id: 5, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "Synonym of 'Big' is", tipeSoal: "PILIHAN_GANDA", opsiA: "Large", opsiB: "Small", opsiC: "Tiny", opsiD: "Little", jawabanBenar: "A", pembahasan: "Big = Large.", xpPoint: 12, tingkatKesulitan: "MUDAH" },
  { id: 6, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "'Diligent' means", tipeSoal: "PILIHAN_GANDA", opsiA: "Malas", opsiB: "Rajin", opsiC: "Cerdas", opsiD: "Lambat", jawabanBenar: "B", pembahasan: "Diligent = rajin.", xpPoint: 12, tingkatKesulitan: "SEDANG" },
  { id: 7, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "Noun from 'Teach' is", tipeSoal: "PILIHAN_GANDA", opsiA: "Teacher", opsiB: "Teaching", opsiC: "Teaches", opsiD: "Taught", jawabanBenar: "A", pembahasan: "Teacher = pengajar.", xpPoint: 12, tingkatKesulitan: "SEDANG" },
  { id: 8, levelId: 3, levelNama: "Vocabulary Menengah", pertanyaan: "What is 'Honest'?", tipeSoal: "PILIHAN_GANDA", opsiA: "Jujur", opsiB: "Bohong", opsiC: "Malas", opsiD: "Marah", jawabanBenar: "A", pembahasan: "Honest = Jujur.", xpPoint: 12, tingkatKesulitan: "SEDANG" },
]
export const mockBadges: Badge[] = [
  { id: 1, nama: "Langkah Pertama", kode: "FIRST_STEP", deskripsi: "Selesaikan level pertamamu!", warna: "#7A9B76", syaratType: "FIRST_LEVEL", syaratValue: 1, earned: true, earnedAt: new Date().toISOString() },
  { id: 2, nama: "Pembelajar Konsisten", kode: "STREAK_3", deskripsi: "Belajar 3 hari berturut-turut", warna: "#E8A93B", syaratType: "STREAK", syaratValue: 3, earned: true },
  { id: 3, nama: "Kolektor XP", kode: "XP_100", deskripsi: "Kumpulkan 100 XP", warna: "#2C5F5D", syaratType: "XP", syaratValue: 100, earned: false },
]
export const mockLeaderboard: LeaderboardEntry[] = [
  { userId: 1, nama: "Demo Siswa", totalXp: 1240, rank: 1 },
  { userId: 2, nama: "Rizky Pratama", totalXp: 1120, rank: 2 },
  { userId: 3, nama: "Siti Aminah", totalXp: 980, rank: 3 },
  { userId: 4, nama: "Budi Santoso", totalXp: 870, rank: 4 },
  { userId: 5, nama: "Dewi Lestari", totalXp: 760, rank: 5 },
]
