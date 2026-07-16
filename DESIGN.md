# QuestLearn — Platform Belajar Berbasis Game

> Nama sementara, bisa diganti sesuai selera (alternatif: LevelUp Learn, EduQuest, Pathify).

---

## 1. Ringkasan Konsep

**QuestLearn** adalah platform belajar berbasis gamifikasi ala Duolingo — user belajar lewat "Dunia" (kategori mapel), yang terbagi jadi beberapa "Level" berjenjang, dan tiap Level berisi "Quest" (soal-soal). User dapat XP, jaga streak harian, kumpulin badge, dan bersaing di leaderboard.

**Yang membedakan dari LMS biasa:**
- Level terkunci berjenjang (mastery-based progression) — nggak bisa loncat ke materi lanjutan sebelum kuasai dasar
- Setiap jawaban (benar/salah) disertai **pembahasan** — ini yang menjaga unsur edukasi tetap jadi inti, bukan sekadar kuis
- Streak harian & leaderboard mendorong konsistensi belajar
- Badge otomatis ke-unlock berdasarkan pencapaian nyata (bukan hadiah kosong)

**Target pengguna:** siapa pun yang mau belajar topik tertentu (bahasa, matematika dasar, dll) dengan cara yang lebih menarik daripada baca modul biasa.

---

## 2. Pemetaan ke Ketentuan Umum Projekan S1

| Ketentuan | Pemenuhan di QuestLearn |
|---|---|
| Responsive (mobile/tablet/desktop) | Semua halaman, terutama peta level & dashboard, di-uji di 3 breakpoint |
| Auth lengkap (login, register, logout, forgot/reset password) | Wajib ada semua, JWT disimpan di Local Storage |
| Routing (public/private/role) | Public: landing, login; Private: dashboard, main quest; Role: admin panel |
| Dashboard real-time | Total XP, streak, leaderboard mingguan, progress per dunia |
| CRUD lengkap 6+ entitas | Users, Dunia, Level, Soal, Progress, Badge (detail di bawah) |
| Search, filter, sort | Di halaman admin (kelola soal/level), dan leaderboard (filter mingguan/bulanan) |
| Pagination | List soal (admin), riwayat progress user |
| Upload file | Upload gambar untuk soal (misal gambar buah untuk vocab), avatar user |
| Form validation realtime | Semua form auth & form admin (bikin soal, dll) |
| Notification (toast) | Setiap submit jawaban, CRUD admin, unlock badge |
| Error handling (401/403/404/500) | Halaman khusus + fallback API gagal |
| REST API + status code sesuai | Standar |
| RBAC 2 role | Admin (kelola konten) vs Siswa (belajar & main) |
| DB: 6 tabel utama, 5 relasi, PK/FK, 3NF, timestamp, soft delete 2 tabel, seed 20 data | Lihat skema di bawah |

---

## 3. Scope Konten (Dunia, Level, Soal)

Untuk menjaga scope tetap realistis dikerjakan solo namun tetap terasa lengkap:

**Jumlah Dunia: 3**
1. **Bahasa Inggris**
2. **Matematika Dasar**
3. **Logika & Pengetahuan Umum**

**Jumlah Level per Dunia: 6**

Contoh breakdown level Dunia "Bahasa Inggris":
1. Vocabulary Dasar (benda sehari-hari)
2. Simple Present Tense
3. Vocabulary Menengah (kata sifat, kata kerja)
4. Simple Past Tense
5. Listening Dasar
6. Grammar Campuran (level "boss", gabungan semua sebelumnya)

Contoh breakdown level Dunia "Matematika Dasar":
1. Operasi Hitung Dasar (tambah, kurang)
2. Perkalian & Pembagian
3. Pecahan Dasar
4. Aljabar Sederhana (persamaan 1 variabel)
5. Bangun Datar Dasar
6. Soal Cerita Campuran (level "boss")

Contoh breakdown level Dunia "Logika & Pengetahuan Umum":
1. Pola & Urutan (angka/gambar berpola)
2. Logika Sebab-Akibat Sederhana
3. Teka-teki Deduksi (mis. siapa duduk di mana)
4. Pengetahuan Umum Dasar (sains, sejarah ringan)
5. Analisis Pernyataan (benar/salah logis)
6. Soal Campuran (level "boss")

**Jumlah Soal per Level: 8**

**Total soal:** 3 Dunia × 6 Level × 8 Soal = **144 soal** — otomatis memenuhi syarat seed data minimal 20 data per tabel utama.

**Minimal skor lulus per level:** 70% (misal 6 dari 8 soal benar) untuk membuka level berikutnya.

---

## 4. Struktur Entitas & Relasi

1. **users** — akun & progress ringkas (total_xp, current_streak)
2. **dunia** — kategori mapel (mis. Bahasa Inggris, Matematika Dasar)
3. **level** — stage berjenjang per dunia
4. **soal** — quest/pertanyaan per level, termasuk kolom `pembahasan`
5. **progress_user** — histori & status pengerjaan level per user
6. **badge** — daftar pencapaian
7. **user_badge** — pivot M:M user ↔ badge
8. **jawaban_detail** *(opsional, tracking granular)* — pivot progress ↔ soal

**Relasi:**
- Dunia → Level (1:M)
- Level → Soal (1:M)
- User → Progress (1:M)
- Progress → Level (M:1)
- Progress → Jawaban Detail (1:M)
- User ↔ Badge (M:M via user_badge)

**Soft delete:** diterapkan di `dunia` dan `soal` (biar histori tetap ada meski konten dihapus admin).

---

## 5. Daftar Halaman (Frontend)

### Publik
- Landing page (pitch singkat + CTA daftar)
- Login / Register / Forgot Password / Reset Password

### Siswa (Private)
- **Dashboard** — ringkasan XP, streak, badge terbaru, lanjutkan belajar
- **Peta Dunia** — pilih kategori mapel
- **Peta Level** — tampilan "peta game" per dunia, level terkunci/terbuka
- **Halaman Quest** — kerjakan soal, dapat feedback + pembahasan langsung
- **Leaderboard** — ranking mingguan/bulanan/all-time
- **Profil & Badge** — koleksi badge, riwayat progress

### Admin (Role Route)
- Kelola Dunia (CRUD)
- Kelola Level (CRUD, urutan)
- Kelola Soal (CRUD, upload gambar, search/filter/sort/pagination)
- Kelola Badge & syarat unlock
- Lihat statistik user (siapa paling aktif, dsb)

### Error Pages
- 401, 403, 404, 500 + fallback ketika API gagal

---

## 6. Arah Desain & Suasana Visual — Pixel Art Game

> **Catatan:** arah desain ini menggantikan versi "warm editorial minimalis" sebelumnya. QuestLearn sekarang mengadopsi estetika **pixel art retro game** penuh, dengan mekanisme **lite-platformer** (karakter bisa lari & lompat secara visual, tanpa physics engine kompleks).

### Konsep & Mood

Website terasa seperti **membuka game 16-bit**, bukan seperti membuka aplikasi belajar. Setiap Dunia (Bahasa Inggris, Matematika, Logika) punya scene pixel art sendiri yang jadi latar peta level, dan user "menjelajah" dunia itu lewat karakter (wizard) sebagai avatar mereka — bukan sekadar klik tombol di daftar level.

**Prinsip:**
- Visual harus konsisten pixel art di semua elemen — termasuk UI chrome (tombol, panel, HUD), bukan cuma background
- Konten soal tetap harus terbaca jelas — dibungkus visual game, tapi teks pertanyaan & pembahasan tidak boleh dikorbankan demi estetika
- Tiap Dunia punya "kepribadian" visual sendiri (lihat breakdown di bawah), tapi UI global (navbar, HUD, tombol) tetap satu bahasa desain yang konsisten

### Aset Referensi yang Sudah Ada

| Aset | Dunia | Penggunaan |
|---|---|---|
| `bg-english-village.png` | Bahasa Inggris | Background scene peta level — desa Inggris hangat, ada toko buku, rumah, bendera |
| `bg-math-desert.png` | Matematika | Background scene peta level — gurun dengan piramida bertuliskan rumus, gaya platformer runner |
| `bg-logic-forest.png` | Logika & Pengetahuan Umum | Background scene peta level — hutan malam misterius, puzzle piece & tanda tanya bercahaya |
| `wizard-pixel.png` | Global (avatar) | Karakter utama/avatar user — dipakai di peta level (traversal), profil, dan potret dialog |

### Palet Warna per Dunia

Alih-alih satu palet global, tiap Dunia punya nuansa warna sendiri yang diturunkan dari background-nya masing-masing — memperkuat identitas visual tiap dunia. UI chrome (navbar, tombol, HUD) tetap pakai palet netral global biar tidak bentrok saat berpindah dunia.

**Global UI (navbar, HUD, tombol, modal):**
| Peran | Warna | Hex |
|---|---|---|
| Panel/HUD background | Dark navy pixel | `#1B2430` |
| Border panel (pixel outline) | Cerah kontras | `#F4E9D8` |
| Primary action (tombol utama) | Amber pixel | `#E8A93B` |
| Success (jawaban benar) | Pixel green | `#6FCF6F` |
| Error (jawaban salah, lembut) | Pixel coral | `#E37B6B` |
| Teks di atas panel gelap | Cream terang | `#F4E9D8` |

**Dunia Bahasa Inggris (Village):** hangat, cerah siang hari — terracotta atap rumah `#B5533C`, hijau rerumputan `#5C8A4A`, biru langit lembut `#8FC1D9`

**Dunia Matematika (Desert):** kontras teal-oranye khas senja gurun — teal gelap `#1F4E4A`, oranye pasir `#D9A24B`, aksen piramida coklat `#8B6F47`

**Dunia Logika (Forest):** gelap & misterius, malam hari — hijau tua `#1E3A2E`, navy langit `#16213A`, kuning lentera menyala `#F2C14E`

### Tipografi

- **Heading & HUD (skor, level, judul dunia):** font pixel penuh — *Press Start 2P* — dipakai terbatas di judul besar, angka skor, dan label HUD (karena kurang terbaca di ukuran kecil)
- **Body text (soal, pembahasan, deskripsi):** font pixel yang tetap nyaman dibaca panjang — *VT323* atau *Silkscreen* (ukuran lebih besar dari font pixel biasa untuk kompensasi keterbacaan), atau kombinasi: body pakai sans-serif bersih (*Inter*) yang dibingkai panel bergaya pixel, supaya soal panjang tetap nyaman dibaca
- Rekomendasi praktis: **Press Start 2P hanya untuk elemen dekoratif/HUD, teks soal & pembahasan tetap sans-serif biasa di dalam panel bergaya pixel** — supaya soal Bahasa Inggris/Matematika/Logika yang butuh dibaca teliti tidak melelahkan mata

### Gaya Visual & Rendering

- Semua sprite/background di-render dengan `image-rendering: pixelated` — supaya tetap tajam (tidak blur) saat di-scale
- UI chrome (tombol, card, modal) dibuat bergaya **pixel border** — outline tebal 2–4px solid dengan sudut kotak (bukan rounded), meniru border game 16-bit klasik
- Shadow **tidak** pakai soft blur seperti desain sebelumnya — kalau ada, pakai **hard drop shadow** (offset tanpa blur, mis. `4px 4px 0px #000`) khas pixel art
- Tombol punya efek "tekan" (pressed state: bergeser 2px ke bawah-kanan saat diklik) meniru button game retro

---

## 7. Peta Dunia & Mekanisme Gameplay

### World Map (halaman pemilihan dunia)
Tiga kartu besar bergaya pixel, masing-masing menampilkan cuplikan background dunianya (village/desert/forest) sebagai thumbnail. Dunia yang belum tersentuh ditampilkan agak gelap/berkabut, dunia yang sedang berjalan ditandai jelas.

### Level Path Scene (peta level per dunia)
- Satu scene besar full-width memakai background asli dunia tersebut, dengan **scroll horizontal** kalau lebar scene melebihi viewport (memberi kesan "menjelajah", bukan sekadar scroll halaman)
- 6 titik level ditempatkan menyebar di sepanjang scene mengikuti kontur visual background (mis. di gundukan pasir untuk Desert, di depan rumah-rumah untuk Village, di dekat lentera pohon untuk Forest)
- **Status titik level:**
  - Terkunci → siluet gelap/pudar, ikon gembok pixel
  - Terbuka (belum selesai) → warna solid, sedikit animasi "berkedip" (glow pulse) menandakan bisa dimainkan
  - Selesai → penanda khas per dunia (mis. bendera kecil di Village, kristal menyala di Desert, lentera menyala penuh di Forest)
- Karakter **wizard** (avatar user) berdiri di titik level yang sedang aktif

### Traversal ("Lite Platformer")
- User klik level terbuka berikutnya → karakter **berlari** (animasi sprite sederhana, frame-based, bukan physics) menuju titik itu, dengan **lompatan kecil** di titik-titik tertentu di sepanjang jalur (murni animasi CSS/JS, tanpa collision detection atau gravity engine)
- Sesampainya di titik → modal/panel soal muncul menutupi sebagian scene (scene tetap terlihat di belakang, blur/dim)
- Level selesai dengan skor cukup → animasi kecil "jalur terbuka" (mis. jembatan muncul, kabut menghilang, lentera berikutnya menyala) sebelum karakter otomatis lanjut ke titik berikutnya

**Catatan teknis penting:** ini **bukan** game engine sungguhan (tidak pakai Phaser/Unity/physics library). Semua animasi lari/lompat cukup dibuat dengan CSS keyframes atau library animasi ringan (mis. Framer Motion) yang men-trigger sprite bergerak dari posisi X ke Y — kompleksitasnya setara komponen UI animasi biasa, bukan game development sungguhan. Ini penting supaya scope tetap realistis dikerjakan solo sebagai project Spring Boot + React.

### Mekanisme Quest per Dunia

**🏘️ Bahasa Inggris — "Talk to the Villager"**
Soal dibungkus dialog NPC penduduk desa lewat speech bubble pixel-art (potret memakai sprite penduduk sederhana). Format soal: pilihan dialog (mirip pilihan ganda tapi dibungkus percakapan), atau drag-and-drop kata ke kalimat rumpang untuk soal vocabulary/grammar.

**🏜️ Matematika — "Catch the Right Number"**
Beberapa angka/simbol jawaban melayang di scene (seperti pada referensi visual), user klik/tap jawaban yang benar dalam batas waktu. Di balik layar tetap logika pilihan-ganda biasa, dibungkus jadi interaksi yang lebih hidup.

**🌲 Logika & Pengetahuan Umum — "Rune Puzzle Matching"**
User men-drag potongan rune/puzzle pixel ke slot yang tepat untuk menyelesaikan pola — cocok untuk soal jenis pola/urutan dan deduksi. Untuk soal pengetahuan umum biasa, tetap format pilihan ganda dibingkai panel rune.

**Implikasi ke struktur data:** tabel `soal` perlu kolom tambahan `tipe_interaksi` (enum: `dialog_pilihan`, `drag_kalimat`, `klik_cepat`, `drag_puzzle`, `pilihan_ganda`) supaya frontend tahu komponen mana yang harus dirender untuk tiap soal. Tabel `dunia` perlu kolom `background_asset_url` dan `tema_visual` untuk menyimpan referensi aset scene.

### Elemen HUD (mengambil pola dari referensi visual gambar Desert)

Bar HUD tetap muncul konsisten di bagian atas saat user berada di Level Path Scene maupun Quest:
- **Skor/XP** (pojok kiri, ikon koin pixel)
- **Nyawa/Percobaan** (representasi hati pixel, dikurangi tiap jawaban salah dalam satu sesi quest — reset tiap masuk level baru, bukan permanen)
- **Nama Dunia & Level aktif** (pojok kanan atau tengah atas)

---

## 8. Struktur Folder Proyek (Monorepo)

```
questlearn/
├── backend/                          # Spring Boot
│   ├── src/main/java/com/questlearn/
│   │   ├── config/                   # SecurityConfig, CorsConfig, SwaggerConfig
│   │   ├── controller/               # REST endpoints (AuthController, DuniaController, dst)
│   │   ├── service/                  # Business logic (interface + impl)
│   │   │   └── impl/
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── entity/                   # JPA entities (User, Dunia, Level, Soal, dst)
│   │   ├── dto/                      # Request/Response DTOs
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── mapper/                   # Entity <-> DTO mapper
│   │   ├── security/                 # JWT filter, provider, UserDetailsService
│   │   ├── exception/                # GlobalExceptionHandler, custom exceptions
│   │   ├── validation/                # Custom validator (mis. unique email)
│   │   └── QuestlearnApplication.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── db/migration/             # Flyway/Liquibase migration + seed data
│   │   └── static/uploads/           # File upload (gambar soal, avatar)
│   ├── src/test/java/...
│   └── pom.xml
│
├── frontend/                          # React + TypeScript
│   ├── src/
│   │   ├── types/                    # Interface/type per domain (dunia.types.ts, dst)
│   │   ├── services/                 # API call layer (axios instance per domain)
│   │   ├── hooks/                    # Custom hooks (useAuth, useDunia, useProgress, dst)
│   │   ├── components/
│   │   │   ├── common/               # Button, Card, Toast, Modal, Pagination
│   │   │   ├── layout/               # Navbar, Sidebar, PrivateRoute, RoleRoute
│   │   │   ├── level-map/            # Komponen peta level (node, connector)
│   │   │   ├── quest/                # Komponen soal & feedback
│   │   │   └── admin/                # Komponen khusus admin (form CRUD, table)
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/
│   │   │   ├── dunia/                # Peta dunia & peta level
│   │   │   ├── quest/
│   │   │   ├── leaderboard/
│   │   │   ├── profile/
│   │   │   ├── admin/                # Kelola dunia/level/soal/badge
│   │   │   └── errors/               # 401, 403, 404, 500
│   │   ├── context/                  # AuthContext (JWT & user state)
│   │   ├── routes/                   # AppRoutes.tsx (public/private/role route config)
│   │   ├── utils/                    # Formatter, validator helper
│   │   ├── styles/                   # Tailwind config, tema warna kustom
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── tailwind.config.ts            # Ekstensi warna palet (terracotta, teal, amber, dst)
│   └── package.json
│
├── docs/
│   ├── flowchart/                    # Dokumentasi perancangan sistem
│   └── erd/                          # ERD database
│
├── README.md
└── .gitignore
```

**Catatan pola arsitektur (konsisten dengan project sebelumnya):**
- Frontend: `types → services → hooks → components → pages` — tiap fitur baru ikuti urutan ini biar konsisten
- Backend: `controller → service → repository → entity`, dengan DTO terpisah dari entity supaya response API rapi dan tidak expose struktur database langsung

---

## 9. Tech Stack (mengikuti pola project kamu sebelumnya)

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Java Spring Boot (REST API, JWT, Spring Security, Bean Validation)
- **Database:** PostgreSQL atau MySQL
- **Dokumentasi API:** Swagger/OpenAPI (springdoc-openapi)
- **Upload file:** disimpan lokal atau cloud storage sederhana (mis. folder `/uploads` + endpoint statis)

---

## 10. Catatan Pengumpulan (sesuai ketentuan)

- Repo GitHub public, monorepo (frontend + backend satu repo)
- README.md lengkap: judul, deskripsi, fitur, tech stack, struktur folder, cara instalasi
- Akun demo (admin & siswa)
- Flowchart perancangan sistem
- Seed data minimal 20 per tabel utama
- Deadline: **Jumat, 18 September 2026, 22.00 WIB**

---

## 11. Langkah Selanjutnya

- [x] Tentukan topik/dunia final — Bahasa Inggris, Matematika Dasar, Logika & Pengetahuan Umum
- [x] Tentukan arah desain — pixel art game, lite-platformer traversal
- [ ] Breakdown daftar endpoint API
- [ ] Buat ERD visual (diagram)
- [ ] Mockup interaktif Level Path Scene (uji animasi traversal karakter)
- [ ] Setup project (Spring Boot + React) & struktur folder
- [ ] Cari/produksi aset tambahan (sprite NPC per dunia, ikon HUD, animasi lari/lompat karakter wizard dalam beberapa frame)