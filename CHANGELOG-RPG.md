# Changelog - RPG 2D + Auto Update Soal

## Fitur Baru Sesuai Request Terbaru:

### 1. 3 Dunia Terpisah (English, Math, Logic)
- **Desa Bahasa Inggris 🇬🇧** (/rpg/dunia/1): Tema village hangat #D97757, rumah-rumah, buku, quest vocab & grammar
  - Level 1-6: Vocab Dasar, Simple Present, Vocab Menengah, Simple Past, Listening, Grammar Boss
  - Musuh: Monster Typo 👾, Hantu Grammar 👻
  - NPC: Bu Guru Siti 👩‍🏫, Pak Pustaka 📚

- **Gurun Matematika 🔢** (/rpg/dunia/2): Tema desert #2C5F5D, patung angka, labirin hitungan
  - Level: Operasi Dasar, Perkalian, Pecahan, Aljabar, Bangun Datar, Cerita Boss
  - Musuh: Kalajengking Angka 🦂, Bug Hitungan 👾
  - NPC: Prof Aljabar 👨‍🔬, Penyihir Hitung 🧙‍♂️

- **Hutan Logika 🧠** (/rpg/dunia/3): Tema forest puzzle #E8A93B, pohon teka-teki, mystery
  - Level: Pola & Urutan, Sebab-Akibat, Deduksi, Pengetahuan Umum, Analisis Pernyataan, Campuran Boss
  - Gameplay: Pure logic puzzle, pola angka, silogisme, deduksi posisi
  - Musuh: Zombie Bingung 🧟, Ogre Teka-teki 👹
  - NPC: Peri Logika 🧝‍♀️, Burung Hantu Oracle 🦉

### 2. Gating - Harus Jawab Soal Dulu Baru Bisa Lanjut
- Minimal 70% untuk lulus dan buka level selanjutnya
- Jika belum 70%, tombol "Lanjut ke Level Selanjutnya" disabled + muncul 🔒
- Pesan: "Butuh 70% buat lanjut ke level selanjutnya"
- Di map, level terkunci tidak bisa di-click, ada gembok
- Di platformer side-scroller, signpost level terkunci tidak bisa masuk, toast warning

### 3. Soal Auto-Update Anti Bosan
- **Sistem:** Soal yang sudah dijawab disimpan di localStorage (rpg_answered_soal)
- Saat load level, filter soal yang sudah pernah dijawab, generate soal baru otomatis via questionGenerator.ts
- Setelah lulus 1x, next attempt: 6 soal baru + 2 soal lama (review)
- Tombol: "🔄 Coba Soal Baru (Auto-Update)" dan "Mau soal baru? Generate soal baru otomatis"
- **Generator:**
  - English: Random vocab dari bank kata, grammar templates random
  - Math: Random operasi hitung (tambah/kurang/kali/bagi/pecahan/aljabar/luas) dengan angka random
  - Logic: Random pola angka (arithmetic sequence), silogisme, teka-teki deduksi, pengetahuan umum
- Jadi soal baru terus, gak hafalan! Sesuai request "soalnya otomatis update lah kalo misal udh pernah dijawab"

### 4. Karakter Custom & Nickname
- Halaman /rpg/customize: pilih 8 avatar + warna + nickname 2-12 karakter
- Disimpan di localStorage rpg_player
- Tampil di semua map, bisa ganti kapan aja via "Ganti Karakter"
- Preview live

### 5. Mode Minecraft / Pixel Platformer (sesuai screenshot Lost Dungeon)
- **PixelPlatformer.tsx**: Side-scroller ala Terraria/Minecraft 2D, bukan top-down
  - Karakter hooded wizard ungu #5D3A9B dengan tongkat emas (mirip screenshot)
  - Sky gradient, ground, grass, platform kayu
  - Shop stall seperti screenshot (atap merah, NPC bearded man, shield + hijau)
  - Signpost level seperti papan kayu dengan panah
  - Health bar top-left mirip screenshot: heart + 36/50 + coin 60
  - Controls: A/D atau Arrow Left/Right gerak, W/Space lompat, E interaksi
  - Camera follow, gravity, platform collision
  - Mobile joystick

- **Top-Down mode** tetap ada sebagai toggle: bisa ganti Side-Scroller ↔ Top-Down

### 6. Battle + NPC Dialog
- Musuh: HP bar, emoji, kalau deket tekan E → Battle Quiz modal (jawab soal bener buat serang)
- Menang: +XP, musuh hilang, toast
- Kalah: bisa coba lagi atau kabur
- NPC: Dialog multi-page, role, bisa ngobrol untuk tips

### 7. File Zip
- questlearn-FINAL-RPG-Minecraft.zip (9.5MB) include portable Maven + frontend + backend
- Bisa jalan tanpa install Maven: backend/maven/bin/mvn.cmd
- Frontend: pnpm install + pnpm dev (kamu pakai pnpm)

### Cara Main Cepat:
1. /rpg/customize → set nickname & avatar
2. /rpg → hub world, lawan slime, ngobrol NPC
3. Pilih portal dunia (Inggris/Math/Logika)
4. Di dunia: jelajahi side-scroller, kalahkan musuh, ngobrol NPC, dekati signpost level
5. Quest: jawab soal (8 soal, butuh 70% baru kebuka next level)
6. Soal auto-update: kalau udah pernah jawab, next batch soal baru random lagi
7. Logic world pure teka-teki logika banget sesuai request!

