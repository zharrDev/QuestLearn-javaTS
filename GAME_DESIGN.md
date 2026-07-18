# QuestLearn: Typing Strike — Game Design Redesign

> Redesign dari RPG quiz-based menjadi **3D typing combat game** untuk melatih kecepatan & akurasi mengetik. Dokumen ini menggantikan mekanisme gameplay inti di `GAME_DESIGN.md`, tapi tetap mewarisi tema 3 Dunia, karakter wizard, dan struktur progres yang sudah ada.

---

## 1. Konsep Inti

Karakter wizard user berdiri di sebuah arena 3D. Dari berbagai arah, **musuh muncul membawa kata/kalimat melayang di atas kepala mereka**. User harus mengetik kata itu — huruf demi huruf — sebelum musuh mencapai karakter. Setiap huruf benar memicu **animasi tebasan pedang**; kata yang selesai diketik = musuh tertebas habis dan hancur.

Ini murni game latihan mengetik cepat (typing speed trainer), dibungkus combat RPG 3D supaya terasa seru, bukan latihan ngetik yang membosankan.

---

## 2. Mekanik Inti (Core Gameplay Loop)

### 2.1 Spawn Musuh
- Musuh muncul dari beberapa arah sekaligus (depan, kiri, kanan — bisa juga dari belakang di level susah), masing-masing membawa **kata/kalimat berbeda** melayang di atasnya.
- Musuh bergerak mendekat ke karakter secara perlahan namun pasti. Semakin lama tidak diketik, semakin dekat — kalau sampai nyentuh karakter, karakter kena damage dan musuh itu hilang (dianggap "lolos").

### 2.2 Sistem Targeting (Lock-on by First Letter)
Karena banyak musuh muncul bersamaan, dipakai mekanik **lock-on otomatis via huruf pertama**:
- User mengetik huruf pertama → sistem mencari musuh yang katanya diawali huruf tersebut → musuh itu jadi **target aktif** (ditandai visual: outline menyala / warna beda).
- Kalau ada 2+ musuh dengan huruf awal sama → yang **paling dekat ke karakter** yang otomatis terpilih.
- Setelah target terkunci, semua ketikan berikutnya diarahkan ke kata musuh itu saja, sampai kata selesai atau target hancur/lolos.
- User bisa "batal lock" secara implisit kalau dia mulai ngetik huruf yang cocok sama musuh lain yang lebih mendesak — tapi progress di kata sebelumnya hilang (musuh lama tetap jalan mendekat).

### 2.3 Input Salah
- Kalau user salah ketik huruf berikutnya dari kata yang sedang dikunci:
  - **Huruf yang salah ditolak** — kursor/highlight tidak maju, huruf yang seharusnya diketik **berkedip/menyala merah** sebagai indikator.
  - Karakter TIDAK menebas (animasi diam / pose "block/parry" singkat) sampai user mengetik huruf yang benar.
  - Musuh tetap terus bergerak mendekat selama user salah ketik — jadi ada tekanan waktu real, bukan cuma tekanan akurasi.
- Ini dicatat sebagai bagian dari perhitungan **akurasi** (bukan sekadar lolos/gagal), dipakai buat statistik akhir sesi.

### 2.4 Efek Visual per Huruf & per Kata
- Tiap huruf benar → tebasan pedang kecil (slash particle + sedikit gerakan pedang), huruf di teks musuh berubah warna (misal abu → hijau/emas) menandakan sudah "ditebas".
- Kata selesai → tebasan besar/final slash, musuh pecah jadi partikel/hancur, +skor & +XP muncul sebagai floating text.
- Musuh yang lolos (nyentuh karakter) → efek hit ke karakter, health bar berkurang, sedikit screen shake.

### 2.5 Karakter Aktif Bergerak — Bukan Diam di Tempat
Karakter **tidak berdiri statis**. Selama sesi berjalan, dia terus bergerak dinamis di arena — lari, lompat, berpindah posisi mendekat/menghindar dari musuh — dan gerakan pedangnya menyatu dengan pergerakan itu, bukan animasi tebas yang terpisah dari gerak badan. Detailnya:

- **Saat target terkunci (lock-on)**: karakter otomatis lari/dash ke arah musuh yang jadi target, sambil bersiap posisi menebas (pedang terangkat).
- **Tiap huruf benar diketik**: satu gerakan tebas (slash) tereksekusi di tengah animasi lari — misal tebas horizontal saat lari mendekat, atau tebas ke atas kalau kebetulan lagi di fase lompat. Jadi ritme tebasan menyatu dengan ritme lari, bukan berhenti dulu baru nebas.
- **Musuh yang posisinya agak jauh/di sisi berbeda**: karakter bisa **lompat** buat mencapai musuh itu, terutama di level Hard saat musuh muncul dari banyak arah sekaligus — memberi kesan combat yang lincah, bukan sekadar tebas di tempat.
- **Kata selesai (musuh hancur)**: gerakan finishing move — tebasan besar disertai sedikit gerakan mundur/berputar (recovery pose) sebelum lari lagi ke target berikutnya.
- **Idle di antara target** (belum ada huruf diketik / menunggu musuh mendekat cukup jauh untuk di-lock): karakter tetap bergerak — jalan santai/waspada di area tengah arena — supaya scene tidak terasa beku.
- **Kalau salah ketik**: karakter berhenti sejenak di posisi terakhirnya dengan pose "block/parry" (bukan mundur total), lalu lanjut lari-nebas begitu huruf yang benar diketik.

Secara teknis, ini berarti animasi karakter butuh beberapa **state/clip** yang saling menyambung: `idle`, `run`, `jump`, `slash` (beberapa varian arah), `block`, dan `finisher` — dikontrol lewat state machine sederhana di kode (state berubah berdasarkan event: huruf benar, huruf salah, kata selesai, jarak ke target). Kalau pakai pendekatan sprite billboard 2D (lihat bagian 5), ini bisa berupa **sprite sheet animasi** per state (mirip animasi sprite platformer biasa) yang ditempel di objek 3D, jauh lebih ringan diproduksi daripada rigging animasi 3D penuh.

### 2.5 Kondisi Game Over / Selesai Sesi
- Sesi berupa **wave/gelombang** dengan durasi tertentu (misal 60–90 detik) atau target jumlah musuh dikalahkan.
- Game over kalau health karakter habis (terlalu banyak musuh lolos).
- Di akhir sesi, tampil ringkasan: **WPM (kata per menit), Akurasi %, Combo terpanjang, Skor, Musuh dikalahkan**.

---

## 3. Tingkat Kesulitan (Easy → Hard, dipilih bebas oleh user)

| Level | Panjang Kata | Kecepatan Musuh Mendekat | Jumlah Musuh Bersamaan | Karakter Spesial |
|---|---|---|---|---|
| **Easy** | 3–5 huruf, kata umum | Lambat | 1 musuh dulu, lalu maks 2 | Semua huruf kecil, tanpa tanda baca |
| **Medium** | 5–8 huruf / frasa pendek | Sedang | 2–3 musuh | Ada huruf kapital di awal kalimat |
| **Hard** | Frasa/kalimat pendek (2–5 kata) | Cepat | 3+ musuh, spawn dari segala arah | Tanda baca, angka, kombinasi huruf kapital-kecil |

- **User bebas pilih dunia + level kesulitan sendiri** (tidak dipaksa gating linear seperti sistem lama) — cocok untuk latihan ngetik karena setiap orang punya kecepatan awal beda.
- Opsional (rekomendasi): tetap simpan **statistik terbaik per kombinasi Dunia+Level** (WPM tertinggi, akurasi tertinggi) untuk leaderboard & badge, walau tidak ada gating wajib.

---

## 4. Konten Kata per Dunia (Word Bank Baru Khusus Typing)

Sesuai arahan: **bukan lagi soal edukasi kuis**, tapi bank kata/kalimat yang temanya tetap mengikuti nuansa tiap dunia, supaya beda dunia terasa beda vibe-nya:

| Dunia | Tema Kata | Contoh Easy | Contoh Medium | Contoh Hard |
|---|---|---|---|---|
| **Desa Bahasa Inggris** 🇬🇧 | Kata & frasa Inggris umum | `book`, `home`, `light` | `sunrise`, `village life` | `The quiet village woke up.` |
| **Gurun Matematika** 🔢 | Angka, simbol, istilah numerik ditulis | `zero`, `plus`, `12+7` | `y = mx + b` | `2x + 10 = 24, solve for x` |
| **Hutan Logika** 🧠 | Kata teka-teki, istilah logika | `maze`, `rune`, `owl` | `deduce the pattern` | `If A then B, not B, so...` |

- Word bank ini **disimpan terpisah dari tabel `Soal` lama** (yang berbasis pilihan ganda) — dibuat entitas baru, misal `TypingWord` (id, dunia_id, teks, level_kesulitan).
- **Anti-repetisi tetap dipertahankan** dari sistem lama: kata yang baru saja muncul dalam satu sesi tidak boleh muncul lagi sampai pool kata habis diputar / di-shuffle ulang. Generator otomatis (mirip `questionGenerator.ts` lama) bisa dipakai untuk kombinasi angka/frasa acak di dunia Matematika & Logika supaya variasinya nyaris tak terbatas.

---

## 5. Visual 3D — Pendekatan yang Realistis untuk Solo Dev

Full 3D modeling (karakter, musuh, environment low-poly penuh) itu scope besar. Rekomendasi pendekatan **"3D space + billboard sprite"** (dipakai banyak game indie, terasa 3D tapi produksi asetnya ringan):

- **Arena/environment**: 3D sederhana (ground plane, langit, beberapa objek 3D dasar seperti batu/pohon/pilar) bertema sesuai dunia (Village/Desert/Forest), background bisa reuse aset pixel art yang sudah ada (`bg-english-village.png`, dst) sebagai skybox/backdrop.
- **Karakter & musuh**: sprite 2D pixel art (wizard yang sudah ada) di-*billboard* (selalu menghadap kamera) di dalam ruang 3D — jadi tetap terasa 3D karena kedalaman & pergerakan musuh dari berbagai sisi, tapi produksi asetnya tetap 2D sprite yang sudah kamu punya.
- **Kata mengambang**: teks di-render sebagai HTML overlay yang posisinya di-proyeksikan dari koordinat 3D musuh (teknik umum di react-three-fiber pakai `Html` dari drei), supaya teks tetap tajam & mudah styling (warna per huruf, efek highlight).
- **Kamera**: third-person, sedikit di atas & belakang karakter, arena melengkung/setengah lingkaran di depan supaya musuh dari kiri-kanan-depan kelihatan jelas.

**Stack teknis yang disarankan** (tetap dalam ekosistem React yang sudah dipakai):
- `three` + `@react-three/fiber` + `@react-three/drei` untuk scene 3D di React
- State ketikan & logic lock-on di-handle di React state (bukan di dalam Three.js scene graph) supaya gampang di-debug

---

## 6. Dampak ke Sistem yang Sudah Ada

| Sistem Lama | Perubahan |
|---|---|
| `Soal` (soal pilihan ganda) | Tetap ada di DB untuk histori/kompatibilitas, tapi **tidak dipakai lagi** di gameplay utama. Diganti `TypingWord`. |
| Quest gating 70% | Diganti jadi **statistik personal best** (WPM & akurasi) per Dunia+Level, tanpa gating linear wajib — user bebas pilih level. |
| Battle Quiz Modal (musuh → soal modal) | Diganti total oleh mekanik lock-on & ngetik langsung di scene 3D, tidak ada modal terpisah lagi. |
| XP & Badge | Tetap dipakai, tapi trigger-nya diubah: XP dari musuh dikalahkan, badge baru seperti "WPM pertama tembus 40", "Akurasi 100% dalam 1 sesi", "Kalahkan 50 musuh". |
| Leaderboard | Tetap ada, tapi metrik diganti jadi WPM tertinggi / kombinasi WPM+akurasi, bisa difilter per Dunia. |
| Mode Top-Down & Side-Scroller lama | Bisa dipensiunkan atau dijadikan "hub/lobi" saja untuk pilih dunia & level sebelum masuk ke arena 3D typing. |

---
