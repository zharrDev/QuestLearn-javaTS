# QuestLearn - Dokumentasi Lengkap

> Platform pembelajaran interaktif berbasis gamifikasi RPG dengan 3 mode bermain: Quiz, Top-Down Map, dan Side-Scroller Platformer.

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Sistem Autentikasi](#4-sistem-autentikasi)
5. [Fitur Dashboard](#5-fitur-dashboard)
6. [Sistem 3 Dunia](#6-sistem-3-dunia)
7. [Mode Quiz (Quest)](#7-mode-quiz-quest)
8. [Mode Top-Down Map](#8-mode-top-down-map)
9. [Mode Side-Scroller Platformer](#9-mode-side-scroller-platformer)
10. [Sistem RPG: Musuh & Boss](#10-sistem-rpg-musuh--boss)
11. [Sistem RPG: Toko & Inventory](#11-sistem-rpg-toko--inventory)
12. [Sistem RPG: Kustomisasi Karakter](#12-sistem-rpg-kustomisasi-karakter)
13. [Sistem XP, Streak & Badge](#13-sistem-xp-streak--badge)
14. [Leaderboard](#14-leaderboard)
15. [Halaman Profil](#15-halaman-profil)
16. [Panel Admin](#16-panel-admin)
17. [Database & Model Data](#17-database--model-data)
18. [API Endpoints](#18-api-endpoints)
19. [Sound Effects & Animasi](#19-sound-effects--animasi)
20. [Akun Demo](#20-akun-demo)

---

## 1. Ringkasan Proyek

QuestLearn adalah platform edukasi gamifikasi yang menggabungkan mekanik RPG (role-playing game) dengan konten pembelajaran. Siswa belajar melalui 3 dunia tematik:

| Dunia | Tema | Warna | Entri |
|-------|------|-------|-------|
| **English Village** | Bahasa Inggris (vocab, grammar, fonetik) | Hijau-Orange | Pedesaan |
| **Math Desert** | Matematika Dasar (aritmatika, aljabar, geometri) | Kuning-Hijau | Gurun |
| **Logic Forest** | Logika & Pengetahuan Umum (pola, deduksi, syllogism) | Biru-Hijau | Hutan |

Siswa dapat bermain dalam 3 mode:
- **Quiz Mode** — Menjawab 8 soal pilihan ganda per level
- **Top-Down Map** — Menjelajahi peta tile-based, berinteraksi dengan NPC dan musuh
- **Side-Scroller Platformer** — Bermain sebagai karakter pixel art, melompat, menyerang, mengumpulkan koin dan hati

---

## 2. Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.2.0 | UI framework |
| TypeScript | 5.2.2 | Type safety |
| Vite | 5.0.8 | Build tool & dev server |
| Tailwind CSS | 3.4.1 | Styling (pixel-art theme custom) |
| React Router DOM | 6.22.0 | Client-side routing |
| Axios | 1.6.5 | HTTP client dengan JWT interceptor |
| Lucide React | 0.300.0 | Icon library |
| Phaser 3 | 3.80.1 | 2D game engine (platformer mode) |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Java | 11 | Runtime |
| Spring Boot | 2.7.18 | Web framework |
| Spring Security | - | Autentikasi & otorisasi |
| Spring Data JPA | - | ORM & akses database |
| jjwt | 0.11.5 | JWT token |
| H2 Database | - | Database embedded (dev) |
| springdoc-openapi | 1.7.0 | Swagger API docs |

---

## 3. Struktur Proyek

```
questlearn/
├── backend/                           # Spring Boot API
│   └── src/main/java/com/questlearn/
│       ├── config/                    # SecurityConfig, CorsConfig, DataSeeder
│       ├── controller/                # 7 REST controllers
│       ├── dto/request/               # 8 request DTOs
│       ├── dto/response/              # 8 response DTOs
│       ├── entity/                    # 9 JPA entities
│       ├── exception/                 # GlobalExceptionHandler
│       ├── repository/                # 9 Spring Data repos
│       ├── security/                  # JWT filter, provider
│       └── service/                   # 6 service impls
│
├── frontend/                          # React SPA
│   └── src/
│       ├── components/
│       │   ├── common/                # Button, Card, Input, Pagination
│       │   ├── layout/                # Navbar, PrivateRoute, RoleRoute
│       │   ├── quest/                 # QuestCard
│       │   └── rpg/                   # RPGMap, PixelPlatformer, PhaserGame,
│       │                              # BattleModal, BossBattleModal,
│       │                              # ShopModal, NpcDialog, PlayerCustomizer
│       ├── game/                      # Phaser 3 engine
│       │   ├── config.ts              # Game configuration
│       │   ├── constants.ts           # GAME_WIDTH, GAME_HEIGHT
│       │   ├── themes.ts              # Color palettes 3 dunia
│       │   ├── audio.ts               # SFX 8-bit (Web Audio API)
│       │   └── scenes/
│       │       ├── PlatformerScene.ts  # Main game scene (~730 baris)
│       │       └── HUDScene.ts         # Heads-up display overlay
│       ├── pages/                     # 17 halaman
│       ├── services/                  # API services + mockData
│       ├── hooks/                     # useRPGPlayer, useQuestionPool
│       ├── context/                   # AuthContext, ToastContext
│       └── types/                     # Type definitions
│
└── docs/                              # ERD.md, FLOWCHART.md
```

---

## 4. Sistem Autentikasi

### Flow Login
1. User memasukkan email + password
2. Backend memvalidasi credentials (BCrypt)
3. JWT token di-generate ( expiry 24 jam )
4. Token disimpan di `localStorage` sebagai `questlearn_token`
5. Axios interceptor otomatis melampirkan `Authorization: Bearer <token>` di setiap request
6. Jika backend down, sistem fallback ke mode mock (login dengan email yang mengandung `@`)

### Role-Based Access Control
| Role | Akses |
|------|-------|
| `SISWA` | Dashboard, Quest, RPG, Profil, Leaderboard |
| `ADMIN` | Semua akses Siswa + Panel Admin (CRUD Dunia/Level/Soal/Badge/User) |

### Endpoint Autentikasi
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/login` | Login, return JWT + user info |
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/forgot-password` | Minta reset password |
| POST | `/api/auth/reset-password` | Reset password dengan token |
| GET | `/api/auth/me` | Dapatkan info user aktif |

---

## 5. Fitur Dashboard

**Route:** `/dashboard`

Dashboard utama yang menampilkan statistik pembelajaran secara real-time:

- **Total XP** — Poin pengalaman kumulatif dari semua quest
- **Streak** — Hari berturut-turut belajar (current / longest)
- **Level Progress** — Jumlah level selesai / total (misal: 5/18)
- **Badge Collection** — Jumlah badge terkumpul
- **Continue Learning** — Tombol lanjut ke level terakhir
- **World Selection** — 3 kartu dunia untuk navigasi cepat
- **Leaderboard Widget** — Posisi user di leaderboard
- **RPG Mode Banner** — Akses cepat ke mode RPG

---

## 6. Sistem 3 Dunia

### Struktur Dunia

```
Dunia (3)
├── Level (6 per dunia = 18 total)
│   ├── Soal (8 per level = 144 total)
│   │   ├── Opsi A, B, C, D
│   │   ├── Jawaban Benar
│   │   └── Pembahasan
│   └── Status: LOCKED → OPEN → COMPLETED
└── Boss Level (level ke-6)
```

### Detail Dunia

#### English Village (Dunia 1)
- **Deskripsi:** Desa Bahasa Inggris — belajar vocabulary, grammar, dan fonetik
- **Warna:** Hijau (#7A9B6B) + Orange (#D97757)
- **Musuh:** Monster Typo, Hantu Grammar, Tulang Fonetik, Laba Huruf
- **NPC:** Bu Guru Siti (Guru), Pak Pustaka (Pustakawan)
- **Boss:** Raja Grammar (HP 150, hadiah 200 XP + 100 coin + Pedang Besi)
- **Topik Soal:** Vocabulary harian (Apple/Apel), Simple Present tense, Adjectives

#### Math Desert (Dunia 2)
- **Deskripsi:** Gurun Matematika — aritmatika, aljabar, geometri
- **Warna:** Kuning (#C9A46A) + Hijau (#2C5F5D)
- **Musuh:** Kalajengking Angka, Bug Hitungan, Ogre Aljabar, Lendir Desimal
- **NPC:** Prof. Aljabar (Ilmuwan), Penyihir Hitung (Master Bilangan)
- **Boss:** Titan Angka (HP 180, hadiah 250 XP + 120 coin)
- **Topik Soal:** Penjumlahan/pengurangan, perkalian/pembagian, pecahan, aljabar (x), luas persegi

#### Logic Forest (Dunia 3)
- **Deskripsi:** Hutan Logika — pola bilangan, deduksi, syllogism, pengetahuan umum
- **Warna:** Biru (#3A4A6B) + Hijau (#5A7B5A)
- **Musuh:** Zombie Bingung, Rangka Deduksi, Ogre Teka-teki, Labalaba Logika
- **NPC:** Peri Logika (Elf), Burung Hantu Bijak (Oracle)
- **Boss:** Maha Puzzle (HP 200, hadiah 300 XP + 150 coin)
- **Topik Soal:** Pola bilangan, syllogism (modus ponens), deduksi logika, Fibonacci, pengetahuan umum (planet, H2O)

### World Map

**Route:** `/worldmap`

- 3 portal animasi dengan efek glow
- Background starfield
- Dashed SVG path antar portal
- Wizard marker sebagai penunjuk
- Klik portal → navigasi ke level map dunia tersebut

### Level Map

**Route:** `/dunia/:id`

- Path alternating kiri-kanan (seperti peta harta karun)
- Background gambar per dunia
- 6 node level dengan status:
  - **Terbuka (OPEN)** — Bisa diklik, border kuning bercahaya
  - **Selesai (COMPLETED)** — Border hijau, centang
  - **Terkunci (LOCKED)** — Border abu-abu, kunci
  - **BOSS** — Badge khusus di level ke-6
- Mastery tip: "Butuh 70% untuk lanjut ke level berikutnya"

---

## 7. Mode Quiz (Quest)

**Route:** `/quest/:levelId`

### Flow Quiz
1. Siswa memilih level berstatus OPEN
2. Sistem mengambil 8 soal (backend atau auto-generated)
3. Siswa menjawab satu per satu dengan 4 opsi (A/B/C/D)
4. Setelah semua dijawab, submit untuk scoring
5. **Batas lulus: 70% (6/8 benar)**
6. Jika lulus → level selesai, buka level berikutnya + XP bonus
7. Jika gagal → ulangi dengan soal baru

### Question Pool System
- **File:** `useQuestionPool.ts`
- Tracking soal yang sudah dijawab di `localStorage` (`rpg_answered_soal`)
- Setelah pertama kali selesai: 6 soal baru + 2 soal review
- Tombol "Generate Ulang" untuk paksa soal segar

### Auto-Generated Questions
**File:** `questionGenerator.ts`

| Dunia | Jenis Soal | Contoh |
|-------|------------|--------|
| English | Vocabulary | "Apa arti dari 'Book'?" → Buku |
| English | Grammar | "I ___ to school every day" → go |
| English | Adjective | "Opposite of 'hot'" → cold |
| Math | Aritmatika | "12 + 7 = ?" → 19 |
| Math | Pecahan | "1/2 + 1/4 = ?" → 3/4 |
| Math | Aljabar | "Jika 2x + 4 = 10, x = ?" → 3 |
| Math | Geometri | "Luas persegi sisi 5 = ?" → 25 |
| Logic | Pola Bilangan | "2, 4, 6, 8, ?" → 10 |
| Logic | Syllogism | Modus ponens, contrapositive |
| Logic | Deduksi | Puzzle logika |
| Logic | Pengetahuan Umum | "Planet ke-3 dari matahari?" → Bumi |

### Quest HUD
- Nama dunia
- Counter XP real-time
- 3 nyawa (heart)
- Progress bar
- Label: "BUTUH 70% UNTUK LANJUT"

### Hasil Quiz
- **Skor persentase** dengan warna hijau/merah
- **XP didapat** (benar x 10 + bonus level jika lulus)
- **Review soal** — semua soal ditampilkan dengan:
  - Jawaban user (benar = hijau, salah = merah)
  - Jawaban benar ditampilkan
  - Pembahasan lengkap

---

## 8. Mode Top-Down Map

**Route:** `/rpg` (Hub) dan `/rpg/dunia/:id` (Dunia)

### RPG Hub World (`/rpg`)
- Peta tile-based 20x15 grid
- Movement: WASD / Arrow keys
- **3 Portal Dunia:** Village, Desert, Forest — klik untuk masuk
- **Musuh:** Slime Bingung (HP 20) — lawan via Battle Quiz
- **NPC:** Master QuestLearn (tips), Penjaga Peta (petunjuk rahasia)
- Collision detection dengan dinding

### RPG Dunia Map (`/rpg/dunia/:id`)
- Peta per dunia dengan background tematik
- **Musuh unik per dunia** (2 musuh)
- **NPC unik per dunia** (2 NPC + 1 Toko)
- Interaksi: tekan E saat dekat entity
- Status musuh: Normal → Terkalahkan (grey out)

---

## 9. Mode Side-Scroller Platformer

**Route:** `/rpg/dunia/:id` → toggle "Canvas" atau "Phaser 3"

### 3 View Mode
| Mode | Teknologi | File |
|------|-----------|------|
| **Canvas** | Raw Canvas2D API | `PixelPlatformer.tsx` (1559 baris) |
| **Phaser 3** | Phaser Arcade Physics | `PlatformerScene.ts` + `HUDScene.ts` |
| **Top-Down** | React tile grid | `RPGMap.tsx` |

### Gameplay Platformer

#### Karakter
- Sprite pixel art procedural (24x36px)
- 4 frame animasi: idle, walk1, walk2, jump
- Walk animation 8fps saat bergerak
- Jump frame saat di udara
- Flip horizontal sesuai arah gerak

#### Mekanik Gerak
- **A/D atau ←/→** — Bergerak kiri/kanan (200px/s)
- **W/Space/↑** — Lompat (-350 velocity)
- **Enter/J** — Serang pedang (ATK 22, range 42px)
- **E** — Interaksi pintu/NPC
- **Coyote time** — Masih bisa lompat 7 frame setelah melangkah off-edge
- **Jump buffer** — Input lompat di-buffer 8 frame sebelum mendarat

#### Map
- World width: 3800px (kamera scrolling)
- 9 ground segments + 16 floating platforms
- 8 gaps dengan spike (paku)
- 3 checkpoints (menyimpan spawn point)
- Parallax scrolling: 3 layer bukit

#### Interaktif
| Elemen | Fungsi |
|--------|--------|
| **Pintu Level** | Masuk ke quiz (3 tipe: terbuka, terkunci, selesai) |
| **NPC** | Dialog dan tips |
| **Koin** | +1 coin, 40 koin tersebar di map, spin + bob animation |
| **Hati** | +25 HP, jatuh dari musuh (35% chance), hilang setelah 10 detik |
| **Spike** | 15 damage, knockback ke atas |
| **Checkpoint** | Menyimpan posisi respawn, visual flag |

#### Musuh
| Tipe | HP | Speed | Warna |
|------|-----|-------|-------|
| Slime | 40 | 60 | Hijau |
| Ghost | 50 | 50 | Ungu |
| Skeleton | 60 | 70 | Krem |
| Spider | 45 | 80 | Coklat |
| Ogre | 70-80 | 35-40 | Coklat tua |

- Patrol otomatis (bolak-balik)
- Flash effect saat terkena
- HP bar di atas musuh
- **Stomp:** Lompat di atas musuh = 28 damage
- **Kontak:** Sentuh musuh = 12 damage + knockback
- Saat musuh mati: +5 coin, drop hati (35%)

#### HUD (Heads-Up Display)
- Panel HP dengan 5 hearts (dari 50 HP max)
- Coin counter dengan ikon koin
- World name + level progress
- Hint bar: kontrol saat idle, interaksi pintu saat dekat
- Attack label saat menyerang

#### Sound Effects
| Event | Efek Suara |
|-------|------------|
| Lompat | Tone naik (300→500 Hz) |
| Koin | Dua tone naik (988→1319 Hz) |
| Serang | Noise + sawtooth |
| Hit enemy | Sawtooth + noise |
| Stomp | Tone naik cepat |
| Terkena damage | Tone turun (150→100 Hz) |
| Kematian | 5 tone turun berturut-turut |
| Heal | 3 tone naik (523→659→784 Hz) |
| Masuk pintu | 3 tone naik |
| Checkpoint | 2 tone naik |

---

## 10. Sistem RPG: Musuh & Boss

### Musuh per Dunia

| Dunia | Musuh 1 | Musuh 2 |
|-------|---------|---------|
| English | Monster Typo (HP 30, +15 XP, +10 coin) | Hantu Grammar (HP 40, +20 XP, +15 coin) |
| Math | Kalajengking Angka (HP 35, +15 XP, +12 coin) | Bug Hitungan (HP 45, +25 XP, +18 coin) |
| Logic | Zombie Bingung (HP 30, +15 XP, +10 coin) | Ogre Teka-teki (HP 50, +30 XP, +20 coin) |

### Battle Quiz System
- **File:** `BattleModal.tsx`
- Klik musuh → muncul modal battle
- Soal quiz diambil dari tema dunia
- **Jawab benar:** Musuh terkena damage
- **Jawab salah:** "MELESET!" — pilihan retry atau kabur
- Musuh defeated → +XP +Coin

### Boss Battle

| Dunia | Boss | HP | Hadiah |
|-------|------|----|--------|
| English | Raja Grammar | 150 | 200 XP, 100 coin, Pedang Besi |
| Math | Titan Angka | 180 | 250 XP, 120 coin |
| Logic | Maha Puzzle | 200 | 300 XP, 150 coin |

**File:** `BossBattleModal.tsx`

- 5 ronde pertarungan
- HP Player: 100 vs HP Boss: 150-200
- **Benar:** Player serang boss (20-34 damage)
- **Salah:** Boss serang player (15-24 damage)
- **Special:** Jika ronde habis tapi HP boss < 50%, player menang tipis
- Hadiah item khusus (contoh: Pedang Besi +25% damage)

---

## 11. Sistem RPG: Toko & Inventory

### Toko

**File:** `ShopModal.tsx`

| Item | Emoji | Harga | Tipe | Efek |
|------|-------|-------|------|------|
| Ramuan Kecil | 🧪 | 20 coin | potion | +20 HP |
| Ramuan Besar | ⚗️ | 40 coin | potion | +50 HP |
| Pedang Kayu | 🗡️ | 50 coin | weapon | +10% damage quiz |
| Pedang Besi | ⚔️ | 100 coin | weapon | +25% damage, +10 XP bonus |
| XP Boost | ⚡ | 30 coin | boost | +50% XP untuk 3 battle |
| Kunci Boss | 🗝️ | 150 coin | key | Skip langsung ke boss battle |

### Sumber Coin
- Starting: 60 coin
- defeat musuh: 10-20 coin
- Boss defeat: 100-150 coin

### Inventory
- 2 tab: Beli & Inventory
- Persetujuan jumlah item (owned)
- Disimpan di `localStorage` (`rpg_inventory`)

---

## 12. Sistem RPG: Kustomisasi Karakter

**Route:** `/rpg/customize`
**File:** `PlayerCustomizer.tsx`

### Pilihan Avatar (8)
| Avatar | Emoji | Default Color |
|--------|-------|---------------|
| Wizard | 🧙 | #9333EA |
| Scholar | 📚 | #2C5F5D |
| Explorer | 🧭 | #D97757 |
| Ninja | 🥷 | #3A322C |
| Knight | ⚔️ | #8A7F74 |
| Elf | 🧝 | #7A9B76 |
| Robot | 🤖 | #8A7F74 |
| Dragon | 🐉 | #C97064 |

### Warna (8)
`#D97757` `#2C5F5D` `#E8A93B` `#7A9B76` `#C97064` `#3A322C` `#8A7F74` `#9333EA`

### Fitur
- Nickname: 2-12 karakter, validated
- Live preview: avatar + warna + nama
- Disimpan di `localStorage` (`rpg_player`)

---

## 13. Sistem XP, Streak & Badge

### XP (Experience Points)
| Sumber | XP |
|--------|----|
| Jawaban benar | 10 per soal |
| Level selesai (bonus) | 50-100 (naik per level) |
| Musuh defeated | 10-30 |
| Boss defeated | 200-300 |
| Badge unlock | Bonus per badge |

Total XP digunakan untuk ranking leaderboard.

### Streak
- `currentStreak` — Hari berturut-turut belajar
- `longestStreak` — Rekor terpanjang
- Tracking via `lastActiveDate` di database
- Logic: jika kemarin aktif → streak+1, jika hari ini sudah aktif →不变, jika gap → reset ke 1

### Badge (10 badge ter-seed)

| Badge | Kode | Syarat | XP Bonus |
|-------|------|--------|----------|
| Langkah Pertama | FIRST_STEP | Selesaikan 1 level | - |
| Pembelajar Konsisten | STREAK_3 | Streak 3 hari | - |
| Pembelajar Super | STREAK_7 | Streak 7 hari | - |
| Kolektor XP Kecil | XP_100 | 100 XP | - |
| Kolektor XP Besar | XP_500 | 500 XP | - |
| Level 5 Master | LEVEL_5 | Selesaikan 5 level | - |
| Level 10 Master | LEVEL_10 | Selesaikan 10 level | - |
| Perfect Score | PERFECT | Skor 100% | - |
| + 2 badge lainnya | - | - | - |

Badge di-unlock otomatis setelah quest submission oleh server.

---

## 14. Leaderboard

**Route:** `/leaderboard`

- **Filter:** Mingguan / Bulanan / All Time
- **Podium Top 3:** Emas (🥇), Perak (🥈), Perunggu (🥉) dengan ikon Crown/Medal/Award
- **Full List:** Ranked list dengan nomor urut
- **Ranking:** Sorted berdasarkan `totalXp` descending
- **Real-time:** Update setelah setiap quest submission

---

## 15. Halaman Profil

**Route:** `/profile`

- **User Profile Card:** Avatar, nama, email, role
- **Tab Badge:** Koleksi badge dalam grid
- **Tab Progress:** Riwayat pengerjaan quest (level, skor, XP, tanggal)

---

## 16. Panel Admin

**Route:** `/admin/*` (requires ROLE_ADMIN)

### Admin Dashboard (`/admin`)
- Statistik: 27 Users, 3 Dunia, 18 Levels, 144 Soal, 10 Badges
- Quick links ke semua halaman CRUD

### CRUD Operations

Semua halaman admin memiliki fitur:
- **Search** real-time
- **Filter** (status, difficulty, kategori)
- **Sort** (tanggal, nama, urutan)
- **Pagination** (prev/next, nomor halaman, items per page: 5/10/20)
- **Toast notifications** (success/error/warning)
- **Form validation** (required fields, min/max length)

#### Manage Dunia (`/admin/dunia`)
- Create/Read/Update/Delete Dunia
- Fields: nama, slug, deskripsi, warna, urutan, status aktif

#### Manage Level (`/admin/level`)
- CRUD Level per dunia
- Fields: nama, deskripsi, urutan, XP reward, min score, boss flag, aktif

#### Manage Soal (`/admin/soal`)
- CRUD Soal dengan table view
- Search by question text
- Filter by difficulty (MUDAH / SEDANG / SULIT)
- Form: levelId, pertanyaan, opsi A-D, jawaban benar, difficulty, XP, pembahasan
- **Upload gambar** (multipart, disimpan di `/uploads/`)

#### Manage Badge (`/admin/badge`)
- CRUD Badge: nama, kode unik, deskripsi, warna, XP bonus, syarat type + value

#### Manage Users (`/admin/users`)
- Daftar user dengan search (nama/email) dan filter role

---

## 17. Database & Model Data

### ERD Summary

```
User ──1:1── UserProfile
User ──1:M── ProgressUser
User ──M:M── Badge (via UserBadge)

Dunia ──1:M── Level
Level ──1:M── Soal
Level ──1:M── ProgressUser

Soal ──1:M── JawabanDetail
ProgressUser ──1:M── JawabanDetail
```

### 9 Entities

| Entity | Tabel | Field Utama |
|--------|-------|-------------|
| **User** | `users` | id, email (UNIQUE), password (BCrypt), nama, role, totalXp, currentStreak, longestStreak, lastActiveDate |
| **UserProfile** | `user_profiles` | id, phone, birthDate, bio, preferredLanguage |
| **Dunia** | `dunia` | id, nama (UNIQUE), slug, deskripsi, iconUrl, backgroundColor, urutan, isActive |
| **Level** | `levels` | id, nama, deskripsi, urutan, xpReward, minScoreLulus, isBossLevel, isActive |
| **Soal** | `soal` | id, pertanyaan, tipeSoal, opsiA-D, jawabanBenar, pembahasan, gambarUrl, xpPoint, tingkatKesulitan |
| **ProgressUser** | `progress_user` | id, skor, totalSoal, jawabanBenar, isLulus, percobaanKe, xpDidapat, waktuMulai, waktuSelesai |
| **JawabanDetail** | `jawaban_detail` | id, jawabanUser, isBenar, xpDidapat |
| **Badge** | `badges` | id, nama, kode, deskripsi, iconUrl, warna, syaratType, syaratValue, xpBonus |
| **UserBadge** | `user_badges` | id, earnedAt |

### Soft Delete
Diterapkan pada **Dunia** dan **Soal** menggunakan `deleted_at` column.

### Seed Data (otomatis saat pertama kali run)
- 1 admin + 25 random students + 1 demo user
- 3 Dunia, 18 Levels, 144 Soal, 10 Badges
- Soal auto-generated dengan pembahasan lengkap

---

## 18. API Endpoints

### Auth
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/forgot-password` | Public | Minta reset |
| POST | `/api/auth/reset-password` | Public | Reset password |
| GET | `/api/auth/me` | Auth | Info user |

### Dunia
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/public/dunia` | Public | Semua dunia |
| GET | `/api/dunia?search=&isActive=&page=&size=` | Auth | Paginated dunia |
| GET | `/api/dunia/user` | Auth | Dunia + progress |
| GET | `/api/dunia/{id}` | Auth | Detail dunia |
| POST | `/api/admin/dunia` | Admin | Create |
| PUT | `/api/admin/dunia/{id}` | Admin | Update |
| DELETE | `/api/admin/dunia/{id}` | Admin | Soft delete |

### Level
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/dunia/{duniaId}/levels` | Auth | Levels per dunia + status |
| GET | `/api/levels/{id}` | Auth | Detail level |
| POST | `/api/admin/levels` | Admin | Create |
| PUT | `/api/admin/levels/{id}` | Admin | Update |
| DELETE | `/api/admin/levels/{id}` | Admin | Delete |

### Soal
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/levels/{levelId}/soal` | Auth | Soal untuk quiz |
| GET | `/api/soal?levelId=&search=&tingkatKesulitan=&page=&size=` | Auth | Paginated soal |
| POST | `/api/admin/soal` | Admin | Create (multipart) |
| PUT | `/api/admin/soal/{id}` | Admin | Update (multipart) |
| DELETE | `/api/admin/soal/{id}` | Admin | Soft delete |

### Quest & Progress
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| POST | `/api/quest/submit` | Auth | Submit jawaban quiz |
| GET | `/api/progress?page=&size=` | Auth | Riwayat progress |
| GET | `/api/dashboard` | Auth | Data dashboard |
| GET | `/api/leaderboard?period=` | Auth | Leaderboard |
| GET | `/api/public/leaderboard?period=` | Public | Leaderboard publik |

### Badge
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/badges` | Auth | Semua badge |
| GET | `/api/badges/user` | Auth | Badge user |
| POST | `/api/admin/badges` | Admin | Create |
| PUT | `/api/admin/badges/{id}` | Admin | Update |
| DELETE | `/api/admin/badges/{id}` | Admin | Delete |

### User (Admin)
| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| GET | `/api/admin/users?search=&role=&page=&size=` | Admin | Paginated user |
| GET | `/api/admin/users/{id}` | Admin | Detail user |

### Static / Docs
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/uploads/{filename}` | File upload |
| GET | `/swagger-ui.html` | API docs |
| GET | `/h2-console` | Database console |

---

## 19. Sound Effects & Animasi

### Sound Effects
Dibuat secara procedural menggunakan **Web Audio API** (tanpa file audio external).

**File:** `frontend/src/game/audio.ts`

| Event | Tipe | Deskripsi |
|-------|------|-----------|
| Jump | Square wave | Tone naik 300→500 Hz |
| Coin | Square wave | Dua tone naik 988→1319 Hz |
| Attack | Noise + sawtooth | Serangan melee |
| Hit Enemy | Sawtooth + noise | Musuh terkena |
| Stomp | Square wave | Lompat di atas musuh |
| Hurt | Sawtooth | Player terkena damage |
| Death | Sawtooth | 5 tone turun berturut |
| Heal | Sine wave | 3 tone naik harmonis |
| Door | Square wave | 3 tone naik |
| Checkpoint | Sine wave | 2 tone naik |

### Animasi Player
- **Spritesheet** 4 frame (24x36px per frame, 96x36 total)
- Frame 0: Idle (berdiri diam)
- Frame 1-2: Walk (kaki bergantian)
- Frame 3: Jump (kaki terentang)
- Walk animation: 8fps looping saat velocity > 20
- Jump frame saat不在 tanah
- Flip horizontal sesuai arah

### Animasi World
- **Coin:** Spin 360° loop + bob up-down (sine ease)
- **NPC:** Bounce up-down (sine ease)
- **Heart drop:** Bob up-down
- **Background hills:** Parallax scrolling (3 layer,不同 kecepatan)
- **Camera:** Smooth follow + shake saat damage
- **Damage numbers:** Float up + fade out
- **Particles:** Explosion effect saat hit/kill/collect

---

## 20. Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@questlearn.id` | `admin123` |
| Siswa | `siswa@demo.id` | `demo123` |
| Siswa | `sitiaminah2@gmail.com` | `siswa123` |

> **Note:** Jika backend tidak berjalan, frontend otomatis masuk mode mock. Login dengan email yang mengandung `@` akan berhasil.

---

## Cara Menjalankan

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Backend berjalan di http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
# Proxy /api → http://localhost:8080
```

### Build Production
```bash
cd frontend
npm run build  # Output di dist/
```

---

*Dokumentasi ini terakhir diperbarui: Juli 2026*
