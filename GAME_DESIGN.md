# QuestLearn: Typing Strike — Game Design Redesign

> Redesign dari RPG quiz-based menjadi **2D side-scroller pixel art typing combat game**, terinspirasi langsung dari gameplay & rasa gerak *Apple Knight: Mini Dungeons* (lari, lompat, dash, tebas pedang responsif) — untuk melatih kecepatan & akurasi mengetik. Dokumen ini menggantikan mekanisme gameplay inti di `GAME_DESIGN.md`, tapi tetap mewarisi tema 3 Dunia, karakter wizard, dan struktur progres yang sudah ada.

---

## 1. Konsep Inti

Karakter wizard user berlari & lompat di sepanjang level side-scroller 2D pixel art, persis rasa gerak *Apple Knight: Mini Dungeons*. Di sepanjang jalur, **muncul deretan kotak berisi huruf** (bukan monster/karakter musuh) yang menyusun sebuah kata. User harus mengetik kata itu — huruf demi huruf — sebelum kotak-kotak itu mencapai karakter. Begitu huruf yang ditekan cocok dengan kotak targetnya, karakter **langsung menebas seketika** (instant response); kotak pecah, kata yang selesai diketik = seluruh kotak dalam grup itu tertebas habis.

Ini murni game latihan mengetik cepat (typing speed trainer), dibungkus action platformer 2D pixel art supaya terasa seru & gerak-cepat, bukan latihan ngetik yang membosankan.

---

## 2. Mekanik Inti (Core Gameplay Loop)

### 2.1 Musuh = Deretan Kotak Huruf (Bukan Karakter)
Musuh di game ini **bukan karakter/monster**, tapi **kotak/balok pixel art** (mirip block Minecraft) — satu kotak isinya **satu huruf**. Satu kata direpresentasikan sebagai **deretan kotak berurutan** yang menyatu jadi satu grup:

- Contoh kata `book` = 4 kotak berjejer, masing-masing bertuliskan pixel-font besar: `B` `O` `O` `K`.
- Grup kotak ini muncul di sepanjang level (dari sisi kanan layar mengikuti arah scroll khas side-scroller, bisa juga dari platform di atas/bawah karakter), dan bergerak mendekat ke karakter secara perlahan namun pasti — sama seperti musuh berjalan di Apple Knight, cuma di sini bentuknya kotak huruf, bukan monster. Kotak per kotak tetap berjejer rapi selama bergerak.
- Kotak yang sudah ditebas hilang dari deretan (pecah jadi partikel pixel), sehingga deretan makin pendek tiap huruf yang diketik benar — secara visual user bisa lihat progress "kata makin habis".
- Kalau grup kotak sampai nyentuh karakter (belum habis ditebas semua), karakter kena damage sesuai sisa kotak yang belum ditebas, lalu grup itu hilang (dianggap "lolos").

### 2.2 Sistem Targeting (Lock-on by First Letter)
Karena banyak grup kotak muncul bersamaan, dipakai mekanik **lock-on otomatis via huruf pertama**:
- User mengetik huruf pertama → sistem mencari grup kotak yang **kotak paling depan/pertamanya** berisi huruf tersebut → grup itu jadi **target aktif** (ditandai visual: seluruh kotak dalam grup itu menyala/outline beda warna dari grup lain).
- Kalau ada 2+ grup dengan kotak pertama huruf sama → grup yang **paling dekat ke karakter** yang otomatis terpilih.
- Setelah target terkunci, karakter otomatis lari ke arah grup itu dan menebas kotak-kotaknya **satu per satu sesuai urutan**, mengikuti ketikan user, sampai semua kotak dalam grup habis atau grup itu lolos.
- User bisa "batal lock" secara implisit kalau dia mulai ngetik huruf yang cocok sama kotak-terdepan grup lain yang lebih mendesak — tapi progress di grup sebelumnya hilang (grup lama tetap jalan mendekat, kotak yang sudah ditebas tetap hilang, sisanya tetap utuh).

### 2.3 Input Salah
- Kalau user salah ketik huruf yang seharusnya (kotak paling depan dari grup yang sedang dikunci):
  - **Ketikan salah ditolak** — kotak yang seharusnya ditebas **berkedip/menyala merah** sebagai indikator, tidak ada kotak yang hilang.
  - Karakter TIDAK menebas (animasi diam / pose "block/parry" singkat) sampai user mengetik huruf yang benar.
  - Grup kotak tetap terus bergerak mendekat selama user salah ketik — jadi ada tekanan waktu real, bukan cuma tekanan akurasi.
- Ini dicatat sebagai bagian dari perhitungan **akurasi** (bukan sekadar lolos/gagal), dipakai buat statistik akhir sesi.

### 2.4 Efek Visual per Huruf & per Kata
- Tiap huruf benar → **kotak paling depan pecah jadi partikel pixel** (efek block-break ala Minecraft) dibarengi tebasan pedang kecil, sisa kotak di belakangnya otomatis maju mengisi posisi terdepan.
- Kata selesai (kotak terakhir dalam grup pecah) → tebasan besar/final slash, ledakan partikel pixel lebih ramai, +skor & +XP muncul sebagai floating text pixel-font.
- Grup kotak yang lolos (nyentuh karakter) → efek hit ke karakter, health bar berkurang, sedikit screen shake, kotak sisa yang belum ditebas ikut hancur/menghilang.

### 2.5 Karakter Aktif Bergerak — Bukan Diam di Tempat
Karakter **tidak berdiri statis**. Selama sesi berjalan, dia terus bergerak dinamis di arena — lari, lompat, berpindah posisi mendekat/menghindar dari musuh — dan gerakan pedangnya menyatu dengan pergerakan itu, bukan animasi tebas yang terpisah dari gerak badan. Detailnya:

- **Saat target terkunci (lock-on)**: karakter otomatis lari/dash ke arah grup kotak yang jadi target, sambil bersiap posisi menebas (pedang terangkat).
- **Tiap huruf benar diketik**: satu gerakan tebas (slash) ke kotak paling depan tereksekusi di tengah animasi lari — misal tebas horizontal saat lari mendekat, atau tebas ke atas kalau kebetulan lagi di fase lompat. Jadi ritme tebasan menyatu dengan ritme lari, bukan berhenti dulu baru nebas.
- **Grup kotak yang posisinya agak jauh/di sisi berbeda**: karakter bisa **lompat** buat mencapai grup itu, terutama di level Hard saat grup muncul dari banyak arah sekaligus — memberi kesan combat yang lincah, bukan sekadar tebas di tempat.
- **Kata selesai (semua kotak dalam grup habis)**: gerakan finishing move — tebasan besar disertai sedikit gerakan mundur/berputar (recovery pose) sebelum lari lagi ke target berikutnya.
- **Idle di antara target** (belum ada huruf diketik / menunggu musuh mendekat cukup jauh untuk di-lock): karakter tetap bergerak — jalan santai/waspada di area tengah arena — supaya scene tidak terasa beku.
- **Kalau salah ketik**: karakter berhenti sejenak di posisi terakhirnya dengan pose "block/parry" (bukan mundur total), lalu lanjut lari-nebas begitu huruf yang benar diketik.

Secara teknis, ini berarti animasi karakter butuh beberapa **state/clip** yang saling menyambung: `idle`, `run`, `jump`, `slash` (beberapa varian arah), `block`, dan `finisher` — dikontrol lewat state machine sederhana di kode (state berubah berdasarkan event: huruf benar, huruf salah, kata selesai, jarak ke target). Kalau pakai pendekatan sprite billboard 2D (lihat bagian 5), ini bisa berupa **sprite sheet animasi** per state (mirip animasi sprite platformer biasa) yang ditempel di objek 3D, jauh lebih ringan diproduksi daripada rigging animasi 3D penuh.

### 2.6 Kondisi Game Over / Selesai Sesi
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

## 5. Visual — 2D Side-Scroller Pixel Art (Referensi: Apple Knight — Mini Dungeons)

Gaya visual & rasa gerak game ini mengacu ke **Apple Knight: Mini Dungeons** — action platformer 2D pixel art dengan lari, lompat, dash, dan tebas pedang yang responsif — tapi semua **aset visualnya dibuat sendiri (custom, orisinal)**, bukan aset dari game aslinya. Ini side-scroller 2D klasik: kamera dari samping, karakter berlari di atas platform/ground, dan kotak huruf muncul di sepanjang jalur seperti musuh/obstacle di Apple Knight.

### 5.1 Sumber Aset: Gambar Custom Buatan Sendiri
- **Karakter, map/background, dan kotak huruf** semuanya berupa **gambar pixel art custom** yang dibuat sendiri (di-generate AI image tool lalu dirapikan, atau digambar manual pakai Piskel/Aseprite) — bukan aset bawaan Apple Knight, bukan aset gratis pihak ketiga tanpa modifikasi.
- Ketiga jenis aset ini disimpan sebagai **file gambar (PNG transparan)** dan dimuat ke dalam game sebagai *image asset*, bukan digambar prosedural pakai kode (beda dari versi prototype awal yang masih pakai bentuk kotak/geometri kode).
- Spesifikasi teknis aset:

| Aset | Ukuran per frame | Format | Isi |
|---|---|---|---|
| **Karakter (sprite sheet)** | 32×32 px per frame | PNG transparan | 1 file, animasi `idle`, `run`, `jump`, `slash`, `block` disusun per baris |
| **Kotak huruf** | 32×32 px | PNG transparan | Gambar kotak **polos tanpa huruf** — beda tekstur per dunia (kayu/buku untuk Inggris, batu pasir untuk Matematika, kayu berlumut untuk Logika) |
| **Background map** | ~960×360 px (atau lebih lebar untuk scroll) | PNG/JPG | 1 gambar utuh per dunia (Village/Desert/Forest) |

### 5.2 Huruf di Kotak: Dirender dari Kode, Bukan Bagian dari Gambar
- Gambar kotak huruf **dibuat polos/kosong** (tanpa huruf tercetak di dalamnya).
- **Huruf ditulis lewat kode** (pixel-font, di-render di atas gambar kotak, posisinya diatur otomatis biar pas di tengah) — bukan digambar manual satu-satu untuk A–Z.
- Keuntungan pendekatan ini:
  - Satu gambar kotak polos bisa dipakai ulang untuk **huruf apa saja**, gak perlu 26 gambar berbeda per tema dunia.
  - Warna/gaya huruf gampang diubah dari kode (misal warna beda saat kotak jadi target aktif, animasi kedip merah saat salah ketik) tanpa harus gambar ulang aset.
  - Kalimat/angka/simbol baru dari word bank (bagian 4) otomatis bisa ditampilkan tanpa nambah aset gambar baru.

### 5.3 Elemen Visual Lainnya
- **Perspektif**: kamera side-view (2D), mengikuti karakter (camera follow) seperti platformer pada umumnya.
- **Environment**: platform, tangga/ladder, ground, elemen dekorasi (pohon, batu, rumah, dsb) bertema tiap dunia (Village/Desert/Forest) — dari gambar background custom di atas.
- **Karakter**: sprite pixel art dengan pedang, animasi `idle`, `run`, `jump`, `slash` (beberapa varian arah), `block`, `finisher` — persis nuansa gerak di Apple Knight (lari gesit, lompat ringan, tebasan cepat & responsif), tapi sprite-nya orisinal buatan sendiri.
- **Kotak huruf**: muncul berjejer di sepanjang level (di platform, melayang, atau datang dari sisi kanan layar mengikuti arah scroll), tekstur sesuai tema dunia, huruf besar pixel-font di-render dari kode di tengah kotak.
- **Respons instan per huruf**: begitu user menekan huruf yang sesuai dengan kotak yang jadi target, karakter **langsung menebas seketika** (instant response) — persis rasanya "tap-and-slash" di Apple Knight.

**Stack teknis yang disarankan** (2D, jauh lebih ringan dari rencana 3D sebelumnya):
- Bisa pakai **Canvas 2D / PixiJS / Phaser** (lebih pas untuk game 2D side-scroller) yang dibungkus komponen React, atau React biasa dengan CSS transform + sprite sheet kalau mau lebih sederhana.
- Karakter: `drawImage()` motong sprite sheet per frame sesuai state animasi (`idle`/`run`/`jump`/`slash`/`block`), frame index dinaikkan lewat timer.
- Kotak huruf: `drawImage()` gambar kotak polos + `fillText()` pixel-font di atasnya untuk hurufnya (lihat 5.2).
- Background: `drawImage()` gambar map penuh di lapisan paling belakang tiap frame render.
- State ketikan & logic lock-on tetap di-handle di state game (bukan campur dengan render loop) supaya gampang di-debug

---

## 6. Dampak ke Sistem yang Sudah Ada

| Sistem Lama | Perubahan |
|---|---|
| `Soal` (soal pilihan ganda) | Tetap ada di DB untuk histori/kompatibilitas, tapi **tidak dipakai lagi** di gameplay utama. Diganti `TypingWord`. |
| Quest gating 70% | Diganti jadi **statistik personal best** (WPM & akurasi) per Dunia+Level, tanpa gating linear wajib — user bebas pilih level. |
| Battle Quiz Modal (musuh → soal modal) | Diganti total oleh mekanik lock-on & ngetik langsung di arena side-scroller 2D, tidak ada modal terpisah lagi. |
| XP & Badge | Tetap dipakai, tapi trigger-nya diubah: XP dari musuh dikalahkan, badge baru seperti "WPM pertama tembus 40", "Akurasi 100% dalam 1 sesi", "Kalahkan 50 musuh". |
| Leaderboard | Tetap ada, tapi metrik diganti jadi WPM tertinggi / kombinasi WPM+akurasi, bisa difilter per Dunia. |
| Mode Top-Down & Side-Scroller lama | Bisa dipensiunkan atau dijadikan "hub/lobi" saja untuk pilih dunia & level sebelum masuk ke level typing 2D. |

---

## 7. Langkah Selanjutnya (Saran)

1. **Prototype interaktif mekanik inti sudah dibuat** (versi awal masih pakai bentuk geometris digambar kode, belum pakai gambar asli) — untuk validasi ritme lock-on, tebas instan, dan tekanan waktu.
2. **Aset visual custom sedang dibuat sendiri** (karakter, background per dunia, kotak huruf polos) mengikuti spesifikasi di bagian 5.1 — pixel art orisinal, terinspirasi rasa gerak Apple Knight tanpa meniru asetnya.
3. Setelah aset custom jadi, prototype diupdate untuk pakai gambar asli (`drawImage()` sprite sheet + background, huruf tetap dirender dari kode di atas kotak polos — lihat 5.2).
4. Setelah feel & visual final oke, baru masuk ke desain skema DB (`TypingWord`, `TypingSession`) dan endpoint API baru.