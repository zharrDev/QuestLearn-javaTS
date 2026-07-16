# Flowchart Perancangan Sistem QuestLearn

## 1. Flow Authentication

```
[Start] -> [Buka Landing Page] 
-> {Sudah Login?} -- tidak --> [Pilih Login/Register]
   |
   ya -> [Cek Token di LocalStorage] -> Valid? -> ya -> [Redirect Dashboard]
                                | tidak -> [Hapus token, ke Login]

[Login] -> Input email & password (validation realtime: required, email format)
-> POST /api/auth/login
-> {Success 200?} -> ya -> Simpan JWT di LocalStorage + user data -> Redirect Dashboard + Toast success
                  -> tidak -> Tampilkan Error (401/422) + fallback mock login untuk demo (siswa@demo.id / admin@questlearn.id) -> Toast

[Register] -> Input nama, email, password, confirmPassword (validation: min 2 char, email, min 6 char, confirm cocok)
-> POST /api/auth/register -> Success -> simpan JWT -> Dashboard

[Forgot Password] -> Input email -> POST /api/auth/forgot-password -> Backend generate UUID token simpan in-memory Map, log ke console -> Tampilkan pesan "cek email" -> User dapat token via console (demo) -> ke Reset Password? token via query param

[Reset Password] -> Token + newPassword + confirmPassword -> POST /api/auth/reset-password -> {Token valid?} -> ya -> Update password hashed -> Success -> Login page
-> tidak -> Error 400 "Token tidak valid"

[Logout] -> Hapus token & user dari LocalStorage -> Redirect Landing
```

## 2. Flow Siswa Belajar (Core Flow)

```
[Dashboard PrivateRoute] -> GET /api/dashboard (real-time) -> Tampilkan Card Summary (XP, streak, completed level, badges)
-> Lanjut Belajar (list level OPEN) ambil dari progress -> Pilih Dunia (/api/dunia/user) -> Tampilkan Peta Dunia (progress per dunia)
-> Klik Dunia -> GET /api/dunia/{id}/levels -> Backend hitung status per level berdasarkan progress_user yang lulus:
   - Level 1 selalu OPEN
   - Level N OPEN jika level N-1 COMPLETED (isLulus true)
   - Selain itu LOCKED
   - Jika progress N sudah lulus -> COMPLETED
-> Tampilkan LevelMap UI (node bulat, garis putus-putus, gembok untuk LOCKED, bintang/ceklis untuk COMPLETED/OPEN, badge BOSS)

-> Klik Level OPEN -> GET /api/levels/{id}/soal -> Tampilkan QuestPage (8 soal)

[QuestPage]
-> Loop Soal: Tampilkan QuestionCard (pertanyaan, opsi A-D, XP point, tingkat kesulitan)
-> User pilih jawaban (state answers Map<soalId, jawabanUser>)
-> Progress bar top sticky (answered / total)
-> Klik Kumpulkan -> Validasi semua terjawab -> POST /api/quest/submit {levelId, jawaban:[{soalId, jawabanUser}]}

Backend submitQuest:
-> Load soal map -> bandingkan jawabanUser vs jawabanBenar (case-insensitive trim)
-> Hitung benar, skor = benar/total*100, XP = sum xp per soal benar + xp_reward level jika lulus
-> isLulus = skor >= min_score_lulus (70)
-> Save/replace ProgressUser + JawabanDetail
-> Update User totalXp, streak:
   - Jika last_active_date == yesterday -> current_streak+1 else if today already -> tetap else reset 1 (atau 1 jika pertama)
   - Update last_active_date = today, longest_streak = max(current, longest)
-> Check & Unlock Badges (loop semua badge, if not already earned dan syarat terpenuhi -> create UserBadge + bonus XP)
-> Return ProgressResponse + message

Frontend:
-> Tampilkan Result Card: 🎉 jika lulus else 💪, skor %, XP didapat
-> Tampilkan semua Soal lagi dengan showResult=true: highlight benar (sage), salah (dustyRose), tampilkan pembahasan per soal (inti edukasi)
-> Tombol: Ulangi, Kembali ke Peta Level, Ke Dashboard (jika lulus)
-> Toast success/warning

-> Jika lulus -> level selanjutnya otomatis jadi OPEN (karena GET levels berikutnya akan hitung ulang)
-> Dashboard ter-update (completedLevels bertambah)
-> Leaderboard ter-update (totalXp sorting)
```

## 3. Flow Admin CRUD

```
[Login Admin] -> RoleRoute cek role ADMIN else redirect 403
-> Admin Dashboard -> Card summary total users, dunia, level, soal, badge

[Kelola Dunia]
-> GET /api/dunia?page=0&size=10&search=inggris&sort=urutan&direction=asc (search, filter isActive, sort, pagination)
-> Tampilkan Table + Search input realtime + Filter + Sort dropdown
-> Pagination component (prev/next, nomor, info total, size selector)
-> Tombol Tambah -> Modal Form (nama required min 2, deskripsi, warna, urutan) validation realtime -> POST /api/admin/dunia -> Toast success -> Refresh list
-> Edit -> Load data ke form -> PUT /api/admin/dunia/{id}
-> Hapus -> Confirm -> DELETE /api/admin/dunia/{id} (soft delete, deleted_at=NOW) -> Toast

[Kelola Level] mirip: GET /api/levels?duniaId=&search=&page=... + filter dunia, search nama

[Kelola Soal]
-> GET /api/soal?page=&size=&search=&tingkatKesulitan=&levelId=&sort=id&dir=desc
-> Search by keyword pertanyaan, Filter tingkat (MUDAH/SEDANG/SULIT), Filter levelId, Sort terbaru/terlama/A-Z
-> Pagination lengkap
-> Tambah Soal: Form lengkap (levelId, pertanyaan required, opsi A-D, jawabanBenar A/B/C/D required, pembahasan, tingkat, XP)
-> Upload file: input type=file image/* -> FormData {data: Blob JSON, file: File} -> POST /api/admin/soal multipart -> Backend FileStorageService store ke ./uploads/{uuid}.ext, return /uploads/...
-> Tampilkan gambar di detail jika ada
-> Edit: PUT /api/admin/soal/{id}/json atau multipart
-> Hapus: DELETE soft delete

[Kelola Badge]
-> GET /api/badges?page=&search=
-> CRUD kode unik, syaratType (XP, STREAK, LEVEL_COMPLETE), syaratValue, xpBonus

[Lihat User]
-> GET /api/admin/users?search=&role=SISWA&page=&size=&sort=createdAt&direction=desc
-> Search nama/email, filter role, sort, pagination
```

## 4. Flow Leaderboard

```
[Leaderboard Page] -> GET /api/public/leaderboard?period=weekly|monthly|all
-> Backend (saat ini simple): sort users by totalXp desc limit 20, rank = index+1
-> Frontend: filter tabs weekly/monthly/all -> call API dengan param period
-> Tampilkan Podium Top 3 (emas/perak/perunggu dengan styling lembut) + list sisanya
-> Card per user: avatar bulat, nama, XP, rank medal
-> Search/filter di frontend bisa pakai nama

Realtime: setiap submit quest yang menambah XP akan otomatis mengubah leaderboard di fetch berikutnya
```

## 5. Flow Error Handling

```
[API Request via axios instance] -> Interceptor request tambah Authorization Bearer token dari LocalStorage
-> {Response Success?} -> ya -> Return data -> UI update
-> tidak -> {Status?}
   - 401 Unauthorized -> Hapus token, redirect /login (kecuali sudah di halaman auth) + tampilkan Toast error
   - 403 Forbidden -> Redirect /403 page
   - 404 Not Found -> Tampilkan 404 page atau fallback mock data (untuk demo agar tetap bisa lihat UI)
   - 422 Validation Error -> GlobalExceptionHandler backend return JSON {success:false, message:"Validation failed", data:{field:error}} -> Frontend mapping ke error state per input + Toast
   - 500 Internal Server Error -> Tampilkan 500 page + fallback mock
   - Network Error -> Catch -> Gunakan mockData (mockDunia, mockLevels, mockSoal, mockLeaderboard) agar demo tetap jalan -> Toast warning "Mode demo"

[Frontend Pages] selalu punya try/catch dan mock fallback, memenuhi ketentuan "fallback ketika API gagal"
```

## 6. Sequence Diagram Sederhana (Submit Quest)

```
User (Siswa) -> QuestPage -> progressService.submitQuest()
-> POST /api/quest/submit + JWT
-> JwtAuthTokenFilter validasi token -> UserDetailsService load user -> set Authentication
-> ProgressController -> AuthService.getCurrentUser() -> ProgressService.submitQuest(userId, request)
-> Load Level, Soal map, User
-> Hitung Skor
-> Save ProgressUser + JawabanDetail
-> Update User XP & Streak
-> BadgeService.checkAndUnlockBadges()
-> Return ProgressResponse + message
-> Frontend -> setResult, showResult=true, Toast
```

