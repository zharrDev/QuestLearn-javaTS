# QuestLearn — Platform Belajar Berbasis Game 🎮📚

> Platform belajar berbasis gamifikasi ala Duolingo — user belajar lewat "Dunia" (kategori mapel), yang terbagi jadi beberapa "Level" berjenjang, dan tiap Level berisi "Quest" (soal-soal) dengan pembahasan. Dilengkapi XP, streak harian, badge, dan leaderboard.

![QuestLearn](https://img.shields.io/badge/Stack-React%20%2B%20Quarkus%20%2B%20Godot-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Demo%20Ready-success)

---

## 🎮 Game Client (Godot 4)

Arena typing tersedia sebagai game **Godot 4** native (Windows `.exe`) di `game/questlearn`.
Semua layar game dirender engine Godot — bukan HTML/CSS — dan memakai aset PNG yang sudah ada.
Game terhubung ke backend yang sama: login JWT, daftar dunia, ambil kata `/typing/start`,
dan submit hasil `/typing/submit`.

- Build: `game/questlearn/build/windows/QuestLearnTyping.exe`
- Login demo: `siswa@demo.id` / `demo123`
- Detail, kontrol, dan cara export: [`game/questlearn/README.md`](game/questlearn/README.md)
- Test otomatis: `godot --headless --path game/questlearn res://tests/smoke.tscn`

---

## 🎯 Fitur Utama (Memenuhi Ketentuan Proyekan S1)

### Frontend (Client Side)
- ✅ **6 Dunia Bahasa** — English, Bahasa Indonesia, Español, Français, Deutsch, Português dengan word bank asli tiap bahasa (akurasi tetap ramah keyboard: huruf beraksen bisa diketik tanpa aksen)
- ✅ **Arena 2D** — versi web tetap punya arena canvas; versi game produksi sekarang memakai **Godot 4** dengan aset PNG asli (background, crate, hero idle/run/jump/slash). Kotak selalu berdiri di atas tanah/tebing, bukan mengambang
- ✅ **Game Feel Produksi** — game loop delta-time, countdown, pause (Esc), mute (WebAudio), input mobile, target word HUD, combo, screen shake, dan anti-repetisi kata
- ✅ **Responsive Layout** - Mobile (≤768px), Tablet (769-1024px), Desktop (>1024px) — semua halaman utama pakai Tailwind responsive, tidak overflow
- ✅ **Authentication Flow Lengkap** - Login, Register, Logout, Forgot Password, Reset Password. JWT disimpan di LocalStorage, session persist saat refresh
- ✅ **Routing** - Public Route (landing, login), Private Route (dashboard, quest), Role Route (admin panel), Redirect ketika tidak ada hak akses
- ✅ **Dashboard Real-time** - Card summary (XP, streak), statistik total data, aktivitas terbaru (continue learning, badge, leaderboard) — data dari backend
- ✅ **CRUD Interface Lengkap** - 6+ entitas: Dunia, Level, Soal, Badge, User, Progress — semua ada List, Detail, Tambah, Edit, Hapus terhubung API
- ✅ **Search, Filter, Sort** - Di halaman admin kelola soal/level/dunia & leaderboard (filter mingguan/bulanan, sort A-Z, terbaru/terlama, filter status/kategori)
- ✅ **Pagination** - Prev/Next, nomor halaman, info jumlah data, pilihan jumlah per halaman (5/10/20)
- ✅ **Upload File** - Upload gambar untuk soal dan avatar (backend simpan di /uploads, akses via /uploads/**, frontend pakai multipart)
- ✅ **Form Validation Realtime** - Required, min/max karakter, format email, password confirmation — error muncul realtime saat typing
- ✅ **Notification** - Toast notification untuk success/error/warning/info di setiap submit & CRUD
- ✅ **Error Handling** - Halaman 401, 403, 404, 500 + fallback ketika API gagal (try/catch dengan mock data fallback agar demo tetap jalan)

### Backend (Server Side)
- ✅ **REST API** - Standar REST dengan GET, POST, PUT, PATCH (via PUT), DELETE, status code sesuai (200, 201, 400, 401, 403, 404, 422, 500)
- ✅ **Auth & Authorization** - Register, Login, Logout, Forgot/Reset Password, JWT, Refresh token logic implisit di expiration
- ✅ **RBAC 2 Role** - ADMIN (kelola konten) vs SISWA (belajar & main) — dibedakan via @PreAuthorize / SecurityConfig
- ✅ **CRUD Lengkap 6 Entitas** - Users, Dunia, Level, Soal, ProgressUser, Badge + tambahan UserBadge (M:M), JawabanDetail, UserProfile (1:1)
- ✅ **Server Validation** - Bean Validation (@NotBlank, @Email, @Size, @Unique via check) + GlobalExceptionHandler mengembalikan JSON konsisten
- ✅ **Upload File** - Endpoint POST /admin/soal dengan multipart file, disimpan di ./uploads
- ✅ **Global Error Handling** - 400, 401, 403, 404, 422, 500 format response konsisten ApiResponse
- ✅ **Database Relationship** - 6+ tabel utama, 5+ relasi, terdapat:
  - OneToOne: User ↔ UserProfile
  - OneToMany: Dunia → Level, Level → Soal, User → Progress
  - ManyToOne: Progress → Level, JawabanDetail → Soal
  - ManyToMany: User ↔ Badge via user_badge
- ✅ **Soft Delete** - Diterapkan di Dunia dan Soal pakai @SQLDelete dan @Where + deleted_at column
- ✅ **API Documentation** - Swagger/OpenAPI via springdoc-openapi (akses /swagger-ui.html & /api-docs)
- ✅ **Security** - Password Hashing (BCrypt), JWT Authentication, CORS, Request Validation, SQL Injection Prevention via JPA
- ✅ **Search, Filter, Pagination API** - Semua endpoint list mendukung ?search=&filter&sort=&page=&limit — contoh: GET /soal?page=0&size=10&search=verb&tingkatKesulitan=MUDAH&sort=createdAt&direction=desc

### Database
- Minimal 6 tabel utama, 5 relasi, PK/FK, 3NF (sudah normalized), timestamp created_at/updated_at di BaseEntity, soft delete 2 tabel, seed konten utama (27 users, 6 dunia bahasa, 36 level, 419 kata typing, 14 badge). Tabel kuis pilihan ganda lama tetap ada untuk kompatibilitas API, tetapi tidak lagi diisi karena gameplay sekarang sepenuhnya typing.

---

## 🗂️ Struktur Folder Proyek (Monorepo)

```
questlearn/
├── backend/                          # Quarkus 3.17 + Java 17
│   ├── src/main/java/com/questlearn/
│   │   ├── config/                   # SecurityConfig, CorsConfig, OpenApiConfig, DataSeeder
│   │   ├── controller/               # REST endpoints (Auth, Dunia, Level, Soal, Progress, Badge, User)
│   │   ├── service/                  # Business logic (interface + impl)
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── entity/                   # JPA entities (User, Dunia, Level, Soal, Progress, Badge, etc)
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── security/                 # JWT filter, provider, UserDetails
│   │   ├── exception/                # GlobalExceptionHandler
│   │   └── QuestlearnApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── frontend/                          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── types/                    # Interface per domain
│   │   ├── services/                 # API call layer (axios)
│   │   ├── hooks/                    # useAuth, useToast
│   │   ├── components/
│   │   │   ├── common/               # Button, Card, Input, Pagination, Toast
│   │   │   ├── layout/               # Navbar, PrivateRoute
│   │   │   ├── level-map/            # Peta level node
│   │   │   └── quest/                # QuestCard
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register, Forgot, Reset
│   │   │   ├── dashboard/
│   │   │   ├── dunia/                # Dunia list + Level map
│   │   │   ├── quest/                # Kerjakan soal
│   │   │   ├── leaderboard/
│   │   │   ├── profile/
│   │   │   ├── admin/                # Kelola dunia/level/soal/badge
│   │   │   └── errors/               # 401,403,404,500
│   │   ├── context/                  # AuthContext, ToastContext
│   │   ├── routes/                   # AppRoutes
│   │   └── styles/                   # Tailwind
│   └── package.json
│
├── docs/
│   ├── flowchart/                    # Flowchart perancangan
│   └── erd/                          # ERD database
│
├── README.md
└── .gitignore
```

---

## 🎨 Design System

**Mood:** hangat, personal, playful — seperti buku catatan progres belajar yang hidup

**Palet Warna:**
- Primary Terracotta `#D97757` — tombol utama, progress
- Secondary Deep Teal `#2C5F5D` — header, navigasi
- Accent Amber `#E8A93B` — XP, reward
- Success Sage Green `#7A9B76` — jawaban benar, badge
- Error Dusty Rose `#C97064` — jawaban salah (lembut)
- Background Warm Cream `#FAF6F0`, Surface Off-white `#FFFDF9`
- Text Charcoal `#3A322C`, Warm Grey `#8A7F74`, Border Sand `#E5DDD1`

**Tipografi:**
- Heading: Fraunces / Lora (serif hangat, personal)
- Body: Plus Jakarta Sans / Inter (bersih, mudah dibaca)

**Komponen Khas:**
- Peta Level: node bulat terhubung garis putus-putus, locked = gembok, open = terracotta, completed = sage checkmark
- Progress XP: rounded progress bar amber
- Kartu Soal: 16-20px radius, shadow lembut
- Badge: bulat/medali sederhana
- Toast: rounded, warna sesuai jenis

---

## 🚀 Cara Instalasi & Menjalankan

### Prasyarat
- Node.js 18+, pnpm
- Java 17, Maven 3.8+ (atau memakai `backend/mvnw.cmd`)
- Godot 4.3 + export templates (untuk game client)
- H2 (embedded, sudah termasuk)

### Backend (Quarkus)
```bash
cd backend
# dev mode dengan hot reload
./mvnw quarkus:dev
# Windows: mvnw.cmd quarkus:dev

# build produksi
./mvnw clean package
java -jar target/quarkus-app/quarkus-run.jar
```
- API: http://localhost:8080/api/*
- Swagger UI: http://localhost:8080/q/swagger-ui/
- H2 Console: http://localhost:8080/h2-console (jdbc:h2:file:./data/questlearn)

### Frontend (React + Vite)
```bash
cd frontend
pnpm install
pnpm dev
# frontend: http://localhost:5173
# proxy /api ke backend :8080 sudah dikonfigurasi di vite.config.ts
```

### Build Production
```bash
cd frontend
pnpm build
# dist/ siap di-deploy
```

---

## 🔑 Akun Demo

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| Admin | `admin@questlearn.id` | `admin123` | Kelola Dunia/Level/Soal/Badge/User + lihat statistik |
| Siswa | `siswa@demo.id` | `demo123` | Dashboard, Peta Dunia, Quest, Leaderboard, Profil & Badge |
| Siswa (random) | `sitiaminah2@gmail.com` | `siswa123` | dll — 25 user seed |

> Catatan: Jika backend belum jalan, frontend otomatis fallback ke mock data agar tetap bisa didemo (mode demo). Login dengan email apapun yang mengandung `@` akan dianggap berhasil di mode mock.

---

## 📊 Scope Konten (Seed Data)

**6 Dunia Bahasa** — arena typing 2D dengan konten asli tiap bahasa:
1. **English** 🇬🇧 — 30 kata mudah, 25 frasa, 15 kalimat
2. **Bahasa Indonesia** 🇮🇩 — 30 kata mudah, 24 frasa, 15 kalimat
3. **Español** 🇪🇸 — 30 kata mudah, 25 frasa, 15 kalimat
4. **Français** 🇫🇷 — 30 kata mudah, 25 frasa, 15 kalimat
5. **Deutsch** 🇩🇪 — 30 kata mudah, 25 frasa, 15 kalimat
6. **Português** 🇵🇹 — 30 kata mudah, 25 frasa, 15 kalimat

**Total 419 kata/frasa/kalimat** di tabel `typing_words`, dibagi 3 tingkat kesulitan (EASY/MEDIUM/HARD).

Setiap dunia punya 6 chapter (First Words → Boss: Full Sentences) untuk struktur progres & admin.

**Badge:** 14 badge otomatis unlock (First Step, Streak 3/7, XP 100/500, WPM 20/40/60, Akurasi 95%, 100 kotak, Polyglot, dll).

> Konten kuis pilihan ganda lama sudah tidak dipakai di gameplay. Arena sekarang 100% typing.

---

## 🔗 Daftar Endpoint API (Contoh)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me

GET    /api/dunia/user                    # untuk siswa (dengan progress)
GET    /api/dunia?page=0&size=10&search=inggris&sort=urutan&direction=asc
GET    /api/dunia/{id}
POST   /api/admin/dunia
PUT    /api/admin/dunia/{id}
DELETE /api/admin/dunia/{id}              # soft delete

GET    /api/dunia/{duniaId}/levels        # peta level dengan status LOCKED/OPEN/COMPLETED
GET    /api/levels?page=&size=&duniaId=&search=
POST   /api/admin/levels
...

GET    /api/levels/{levelId}/soal          # soal untuk quest (dengan jawaban & pembahasan)
GET    /api/soal?page=0&size=10&search=verb&tingkatKesulitan=MUDAH&levelId=1
POST   /api/admin/soal/json
POST   /api/admin/soal                     # multipart dengan file gambar
DELETE /api/admin/soal/{id}                # soft delete

POST   /api/quest/submit                   # submit jawaban {levelId, jawaban:[{soalId, jawabanUser}]}
GET    /api/progress?page=&size=
GET    /api/dashboard
GET    /api/leaderboard?period=weekly|monthly|all

GET    /api/badges/user
GET    /api/badges?page=&search=
POST   /api/admin/badges

GET    /api/admin/users?search=&role=SISWA&page=&size=
GET    /uploads/{filename}                 # static file hasil upload
```

Semua endpoint list support `page`, `size`, `search`, `sort`, `direction`, `filter` spesifik.

---

## 📝 Flowchart & ERD

### Flowchart Login → Quest Flow
```
[User Buka Landing] → [Register/Login] → JWT disimpan di LocalStorage
→ Redirect Dashboard (fetch /api/dashboard real-time)
→ Pilih Dunia (/api/dunia/user) → Lihat Peta Level (/dunia/{id}/levels) status LOCKED/OPEN/COMPLETED
→ Klik Level OPEN → Fetch Soal (/levels/{id}/soal)
→ Jawab Soal → Submit (/quest/submit) → Backend hitung skor, XP, streak, check badge
→ Tampilkan Hasil + Pembahasan per soal
→ Jika Lulus (≥70%) → Buka level selanjutnya + toast + badge jika unlock
→ Update Dashboard & Leaderboard
```

### Flowchart Admin CRUD
```
[Login Admin] → RoleRoute cek ROLE_ADMIN → Dashboard Admin
→ Kelola Dunia/Level/Soal/Badge: List dengan search/filter/sort/pagination
→ Tambah/Edit: form validation realtime → POST/PUT dengan file upload (multipart)
→ Hapus: DELETE soft delete (deleted_at) → toast success
→ Lihat User Stats & Leaderboard
```

### ERD Sederhana
```
users ||--o{ user_profiles : "1:1"
users ||--o{ progress_user : "1:M"
users ||--o{ user_badges : "1:M"
dunia ||--o{ levels : "1:M"
levels ||--o{ soal : "1:M"
levels ||--o{ progress_user : "1:M"
progress_user ||--o{ jawaban_detail : "1:M"
soal ||--o{ jawaban_detail : "1:M"
badges ||--o{ user_badges : "1:M"
```

Lihat file `docs/erd/ERD.md` untuk detail.

---

## ✅ Checklist Ketentuan Proyekan S1

- [x] Responsive 3 breakpoint
- [x] Auth lengkap (login, register, logout, forgot, reset) + JWT LocalStorage + persist refresh
- [x] Routing public/private/role + redirect
- [x] Dashboard real-time (bukan statis)
- [x] CRUD 6+ entitas lengkap
- [x] Search (keyword), Filter (status/kategori/tanggal), Sort (terbaru/terlama/A-Z/Z-A) bisa bersamaan
- [x] Pagination (prev/next, nomor, info total, pilih per halaman)
- [x] Upload file gambar/PDF
- [x] Form validation realtime (required, min/max, email, phone, password confirmation)
- [x] Toast Notification CRUD
- [x] Halaman error 401/403/404/500 + fallback API gagal (mock)
- [x] REST API + status code sesuai
- [x] RBAC 2 role
- [x] DB 6 tabel, 5 relasi (1:1, 1:M, M:1, M:M), PK/FK, 3NF, timestamp, soft delete 2 tabel, seed 20 data

---

## 📦 Pengumpulan

- Repo: Monorepo (frontend + backend satu repo) — siap push ke GitHub public
- README lengkap (ini)
- Akun demo tercantum
- Flowchart & ERD di /docs
- Seed data 6 dunia bahasa + 419 kata typing + 36 chapter otomatis saat pertama run
- Deadline: Jumat, 18 September 2026, 22.00 WIB — **Sudah Ready**

---

## 👨‍💻 Tech Stack

- **Game client:** Godot 4.3 (GDScript, GL Compatibility), 640x360 pixel-art canvas
- **Frontend:** React 18 + TypeScript + Tailwind CSS + React Router + Axios
- **Backend:** Java 17 + Quarkus 3.17.5 + JWT (jjwt 0.11.5) + Hibernate ORM + H2 + Lombok + SmallRye OpenAPI
- **Game backend contract:** `/api/auth/login`, `/api/dunia/user`, `/api/typing/start`, `/api/typing/submit`
- **Database:** H2 (embedded) untuk dev, MySQL/PostgreSQL ready via driver
- **Upload:** Local folder ./uploads + endpoint statis /uploads/**

---

## 🙌 Catatan

- Frontend sengaja dibuat dengan **mock fallback** supaya tetap bisa didemo meskipun backend belum jalan — memenuhi prinsip error handling & fallback API gagal.
- Warna & desain mengikuti arahan di PROJECT_DESIGN.md: hangat, personal, playful, tidak korporat kaku.
- Semua soal sudah ada **pembahasan** sebagai inti edukasi, bukan sekadar benar/salah.

Selamat belajar dengan QuestLearn! 🚀
