# QuestLearn — Game Design Document (Pixel Art)

> Dokumen ini fokus khusus ke sisi **game/visual** — peta level, karakter, HUD, dan mekanisme interaksi. Untuk arsitektur sistem, entitas database, dan endpoint, lihat `PROJECT_DESIGN.md`. Semua deskripsi di bawah disesuaikan persis dengan 4 aset yang sudah dibuat.

---

## 1. Inventaris Aset

| File | Dunia | Deskripsi Visual Asli |
|---|---|---|
| `bg-english-village.png` | Bahasa Inggris | Desa Inggris siang hari — rumah beratap jerami & batu, bendera Union Jack & St. George, papan toko "BOOKS", papan "WELCOME TO LITTLEWOOD", bangku taman, kotak bunga, pohon birch, ladang hijau, gereja kecil di kejauhan |
| `bg-math-desert.png` | Matematika Dasar | Gurun gaya platformer — HUD di pojok atas (SCORE/LIVES/LEVEL), karakter penjelajah (topi & tas) sedang berlari-lompat, piramida bertuliskan rumus (`2x+10=24`, `y=mx+b`, `πr²=A`, `∫(3x²)dx`), kaktus dihiasi angka, koin, obor, matahari terbenam |
| `bg-logic-forest.png` | Logika & Pengetahuan Umum | Hutan malam misterius — bulan sabit, kunang-kunang, lentera menyala tergantung di pohon, potongan puzzle rune bercahaya (emas/oranye) berserakan di tanah, tanda tanya bercahaya melayang, reruntuhan pilar batu, nisan tua |
| `wizard-pixel.png` | Global (avatar) | Karakter wizard kecil berjubah ungu dengan tongkat emas, gaya chibi/pixel, latar transparan — dipakai sebagai avatar utama user |

**Catatan penting:** background Desert sudah punya karakter "penjelajah" bawaan di dalam gambarnya sendiri (bukan wizard). Untuk konsistensi, **wizard tetap jadi avatar resmi user di semua dunia** — karakter penjelajah di background Desert diperlakukan sebagai elemen dekoratif scene saja (seperti NPC latar), bukan avatar yang dikontrol.

---

## 2. Homepage — Auto Slideshow Background

Halaman pertama yang dilihat user (landing/home sebelum atau sesudah login) — background-nya **otomatis bergonta-ganti** (cross-fade) menampilkan ketiga scene dunia secara bergiliran: Village → Desert → Forest → kembali ke Village, dan seterusnya. Ini murni ambiance/showcase, bukan halaman pemilihan dunia yang interaktif (pemilihan dunia tetap ada di halaman/section tersendiri setelah ini, misalnya di Dashboard).

**Konsep:**
- 3 gambar (`bg-english-village.png`, `bg-math-desert.png`, `bg-logic-forest.png`) ditumpuk sebagai layer, masing-masing tampil penuh 1 layar secara bergantian dengan **transisi cross-fade** (fade out gambar sekarang, fade in gambar berikutnya), bukan potongan/dipilih user
- Durasi tiap slide sekitar 4–5 detik sebelum pindah ke slide berikutnya, siklus berulang otomatis selama user berada di halaman ini
- Konten di atas background (judul "QuestLearn", tagline singkat, tombol CTA "Mulai Petualangan"/"Masuk") **tetap diam/statis** — tidak ikut berubah, hanya background di belakangnya yang hidup
- Overlay gradient gelap tipis di atas background (dari transparan di atas ke lebih gelap di bawah) supaya teks & tombol tetap terbaca jelas di atas gambar apa pun yang sedang tampil
- Indikator titik kecil (dot) di bagian bawah menandakan slide mana yang sedang aktif, sinkron dengan siklus otomatis

**Kenapa ini pas dijadikan kesan pertama:** user langsung "diperkenalkan" ke ketiga dunia sekaligus sebelum masuk ke salah satunya — memberi preview variasi konten tanpa harus klik apa pun, dan menegaskan identitas visual pixel art QuestLearn sejak detik pertama.

**Implementasi teknis:** 3 elemen `<img>` (atau `background-image` div) ditumpuk absolute dalam 1 container, masing-masing diberi CSS `@keyframes` opacity dengan `animation-delay` bertingkat (mis. slide 1 mulai di 0s, slide 2 di 4s, slide 3 di 8s, siklus total 12s lalu berulang) — murni CSS, tidak butuh JavaScript carousel library.

**Prototype referensi:** `homepage_slideshow_prototype.html` (bisa dibuka langsung di browser untuk melihat efeknya berjalan).

---

## 3. Breakdown per Dunia

### 🏘️ Bahasa Inggris — "Littlewood Village"

**Mood:** hangat, cerah, tenang — cocok untuk belajar percakapan & kosakata sehari-hari.

**Elemen visual yang sudah ada & fungsinya:**
- Papan toko **"BOOKS"** → jadi penanda alami lokasi Level Vocabulary/Grammar
- Papan **"WELCOME TO LITTLEWOOD"** → titik masuk/start scene, cocok jadi "gerbang" awal peta
- Rumah-rumah berjejer → tiap rumah bisa jadi 1 titik level (6 rumah = 6 level)
- Bangku taman & kotak bunga → titik "istirahat" visual antar level, tidak fungsional, murni dekorasi jalur
- Bendera (Union Jack/St. George) → aksen dekoratif konsisten dengan tema Inggris

**Penempatan node level (mengikuti tata letak asli gambar):**
1. Depan rumah pertama kiri (dekat gerbang start)
2. Depan toko buku "BOOKS"
3. Depan rumah tengah (rumah batu dengan bendera)
4. Depan rumah kanan
5. Di dekat gereja kecil di kejauhan (level 5, mulai terlihat di ujung jalan)
6. Titik akhir jalan / balik ke pusat desa (level "boss")

**Mekanisme quest:** *"Talk to the Villager"* — dialog NPC penduduk desa lewat speech bubble pixel-art. NPC bisa ditempatkan berdiri di depan tiap rumah (aset tambahan yang perlu dibuat: 2-3 sprite penduduk sederhana). Format soal: pilihan dialog, atau drag kata ke kalimat rumpang untuk grammar.

---

### 🏜️ Matematika Dasar — "Pyramid Run"

**Mood:** energik, adventure — cocok dengan gaya "lari-lompat" yang memang sudah tergambar di asetnya.

**Elemen visual yang sudah ada & fungsinya:**
- **Piramida bertuliskan rumus** (`2x+10=24`, `y=mx+b`, `πr²=A`, `∫(3x²)dx`) → tiap piramida bisa jadi penanda tema level (aljabar, geometri, kalkulus dasar dst.) — cocok banget dipakai literal sebagai "gerbang" level
- **Kaktus berhias angka** → dekorasi ambient, bisa dianimasikan sedikit (goyang pelan) di area gurun terbuka
- **HUD bawaan gambar** (SCORE/LIVES/LEVEL) → dipakai **persis** sebagai pola HUD resmi QuestLearn di seluruh dunia (lihat Bagian 4)
- **Koin & obor** → koin dipakai sebagai representasi visual XP di scene, obor sebagai penanda titik level yang sudah menyala (selesai)

**Penempatan node level:**
1. Titik awal dekat kaktus kiri (dataran rendah)
2. Platform batu kecil (sesuai balok di gambar)
3. Depan piramida pertama (`2x+10=24` — Aljabar Sederhana)
4. Antara dua piramida (`πr²=A` — Bangun Datar)
5. Depan piramida besar kanan (`∫(3x²)dx` — dijadikan tantangan "bonus" visual meski materi tetap level dasar, jangan sampai soal beneran kalkulus di luar scope Matematika Dasar)
6. Puncak/ujung kanan scene, dekat koin besar bersinar (level "boss")

**Mekanisme quest:** *"Catch the Right Number"* — angka-angka jawaban melayang di scene mengikuti gaya angka/simbol yang sudah ada di background (`4`, `7`, `π`, `√`, dll — bisa dipakai ulang gaya font pixel yang sama). User klik angka benar sebelum waktu habis.

---

### 🌲 Logika & Pengetahuan Umum — "Whispering Woods"

**Mood:** misterius, tenang, sedikit menegangkan (dalam artian menyenangkan) — cocok untuk teka-teki yang butuh fokus.

**Elemen visual yang sudah ada & fungsinya:**
- **Lentera tergantung di pohon** (menyala dengan efek glow) → **persis** dipakai sebagai penanda titik level — lentera padam = level terkunci, lentera menyala redup = level terbuka, lentera menyala terang = level selesai
- **Potongan puzzle rune bercahaya** yang sudah tersebar di gambar (2 potongan besar + beberapa balok kecil berukir huruf rune) → ini **aset kunci** untuk mekanisme drag-puzzle, bisa langsung dipakai/diadaptasi sebagai sprite potongan puzzle yang di-drag user
- **Tanda tanya bercahaya melayang** (5 buah di gambar) → representasi visual "misteri belum terpecahkan", cocok dipasang tepat di atas node level yang belum dikunjungi
- **Reruntuhan pilar & nisan tua** → dekorasi ambient menambah kesan "hutan kuno"

**Penempatan node level (mengikuti posisi lentera & tanda tanya di gambar):**
1. Lentera kiri (dekat balok rune pertama)
2. Lentera kedua dari kiri (dekat potongan puzzle besar berbentuk L)
3. Titik tengah scene (dekat pilar reruntuhan & sungai kecil bercahaya di background)
4. Lentera kanan-tengah (dekat potongan puzzle kotak-kotak)
5. Lentera paling kanan
6. Titik terjauh kanan, dekat balok rune terakhir bertuliskan "K"/"R" (level "boss")

**Mekanisme quest:** *"Rune Puzzle Matching"* — user drag potongan rune (memakai bentuk & gaya emas/oranye yang identik dengan aset asli) ke slot yang tepat untuk pola/urutan. Untuk soal pengetahuan umum non-visual, tetap pilihan ganda tapi dibingkai panel bergaya rune/batu.

---

## 4. Karakter & Avatar

**Wizard** adalah avatar tunggal & konsisten di seluruh aplikasi:
- **Peta Level:** wizard berdiri/berlari di titik level aktif, animasi lari sederhana (2-4 frame) + efek "lompat kecil" saat berpindah titik
- **Profil User:** potret wizard jadi foto profil default
- **Dialog (Village):** wizard muncul sebagai "sisi kiri" percakapan, NPC penduduk di "sisi kanan"
- **Progress/Badge:** wizard jadi elemen sentral di halaman pencapaian (mis. wizard "naik level" visual — tongkatnya bisa berubah warna/efek seiring makin banyak badge, sebagai nilai tambah opsional)

**Status ekspresif wizard (dibuat dari 1 sprite dasar via variasi sederhana, bukan menggambar ulang total):**
- Normal (dasar, sudah ada)
- Senang (jawaban benar) — bisa cukup ditambah efek sparkle/bintang kecil di sekitar sprite tanpa redraw
- Berpikir (saat quest dibuka) — bisa pakai crop/posisi sprite yang sama dengan ikon "?" kecil di sampingnya

---

## 5. Sistem HUD

Mengikuti pola yang **sudah ada persis** di aset `bg-math-desert.png` — dijadikan standar HUD global:

```
[Pojok kiri atas]                              [Pojok kanan atas]
SCORE: 001250                                          LEVEL 3
LIVES: 3 ♥
[Nama Dunia]
```

**Adaptasi untuk QuestLearn:**
- `SCORE` → diganti `XP` (ikon koin pixel di sebelah angka)
- `LIVES` → jumlah percobaan tersisa dalam satu sesi quest (ikon hati pixel, direset tiap masuk level baru — bukan nyawa permanen)
- Baris ketiga → nama Dunia aktif (mis. "MATEMATIKA DASAR", "BAHASA INGGRIS", "LOGIKA & UMUM")
- `LEVEL` pojok kanan → nomor level yang sedang dikerjakan

**Styling:** font pixel (Press Start 2P) untuk angka & label, kotak HUD semi-transparan gelap (`#1B2430` dengan opacity ~85%) menempel di pojok, konsisten di semua 3 scene dunia.

---

## 6. Kebutuhan Aset Tambahan

Aset yang sudah ada cukup untuk background & avatar utama. Berikut aset tambahan yang perlu diproduksi menyusul (prioritas dari yang paling penting):

| Aset | Prioritas | Catatan |
|---|---|---|
| Ikon gembok pixel (level terkunci) | Tinggi | Dipakai di semua 3 dunia, satu desain generik cukup |
| Ikon bintang/api unggun kecil (level selesai) | Tinggi | Bisa beda gaya per dunia (bintang di Forest, bendera kecil di Village, kristal/koin di Desert) |
| 2-3 sprite NPC penduduk (Village) | Sedang | Untuk mekanisme dialog |
| Sprite angka/simbol lepas bergaya sama dengan di background Desert | Sedang | Untuk mekanisme "Catch the Right Number" |
| Potongan puzzle rune tambahan (variasi bentuk) | Sedang | Untuk variasi soal di Forest, gaya ikuti yang sudah ada di background |
| Frame animasi lari wizard (2-4 frame tambahan) | Rendah (nilai tambah) | Sprite tunggal saat ini sudah cukup untuk MVP, animasi lari bisa disimulasikan dengan pergeseran posisi CSS dulu |
| Ikon pixel untuk badge/achievement | Rendah | Bisa pakai ikon generik dulu (medali/perisai sederhana) |

---

## 7. Catatan Teknis Implementasi

- Semua background di-render dengan `image-rendering: pixelated` agar tetap tajam saat di-scale ke lebar layar berbeda
- Ukuran asli background (1376×768) cukup untuk desktop; untuk mobile, scene di-crop/pan otomatis mengikuti posisi node aktif, bukan di-scale penuh (supaya detail pixel tidak terlalu kecil)
- Wizard sprite (1024×1024 asli) perlu di-resize ke ~thumbnail konsisten (mis. 64×64 atau 96×96) untuk pemakaian di peta level, dan ukuran lebih kecil lagi (32×32) untuk ikon di navbar/profil
- Font pixel (Press Start 2P) hanya untuk HUD & label pendek — body soal & pembahasan tetap sans-serif biasa demi keterbacaan (lihat `PROJECT_DESIGN.md` bagian tipografi)
- Struktur folder aset yang disarankan:

```
frontend/public/assets/
├── backgrounds/
│   ├── village.png
│   ├── desert.png
│   └── forest.png
├── characters/
│   ├── wizard-idle.png
│   ├── wizard-happy.png       # nilai tambah
│   └── npc-villager-*.png     # untuk dialog Village
├── icons/
│   ├── lock.png
│   ├── star-forest.png
│   ├── flag-village.png
│   ├── crystal-desert.png
│   └── hud/
│       ├── xp-coin.png
│       └── heart.png
└── puzzle/
    └── rune-piece-*.png       # untuk mekanisme Forest
```

---

## 8. Animasi Traversal: Lari, Lompat & Mendarat

Karakter wizard yang ada saat ini cuma **1 sprite statis** — bukan sprite sheet beranimasi. Berikut cara bikin traversal tetap kelihatan "hidup" tanpa harus gambar ulang banyak frame dulu.

### Tingkatan implementasi

**Tingkat 1 — MVP (pakai 1 sprite, murni CSS/JS, tanpa aset tambahan)**

Ilusi gerakan dibangun dari kombinasi transform, bukan pergantian gambar:

| Fase | Efek CSS |
|---|---|
| **Lari** (geser horizontal antar node) | `translateX` dengan easing `linear`/`ease-in-out`, durasi proporsional ke jarak antar node |
| **Bobbing saat lari** | `translateY` naik-turun kecil berulang (mis. ±4px, siklus 200ms) mensimulasikan langkah kaki, dikombinasikan bareng translateX |
| **Lompat** (di titik tertentu, khusus Desert) | Lintasan parabola: `translateY` naik lalu turun mengikuti kurva (bisa pakai `cubic-bezier` custom atau keyframe manual persentase 0%→50%→100%) |
| **Squash saat mendarat** | Sesaat sprite di-`scaleY(0.85) scaleX(1.1)` lalu balik ke normal (100–150ms) — efek klasik platformer biar mendarat kerasa "berbobot" |
| **Hadap arah** | `scaleX(-1)` saat gerak ke kiri (flip horizontal), normal saat ke kanan |
| **Debu mendarat (opsional)** | Lingkaran kecil semi-transparan yang muncul sebentar di bawah kaki lalu fade-out & membesar dikit, dipicu tepat saat squash terjadi |

Semua ini bisa dibikin pakai CSS `@keyframes` atau library ringan (Framer Motion untuk React) — **tidak butuh sprite sheet maupun game engine**, cukup 1 gambar wizard yang sudah ada.

**Tingkat 2 — Nilai tambah (kalau ada waktu produksi aset tambahan)**

Sprite sheet run-cycle 4–6 frame + jump-cycle 2–3 frame, ditukar via `steps()` di CSS animation atau interval JS — hasilnya kaki/jubah wizard beneran "bergerak", bukan cuma sprite tunggal yang digeser. Ini murni polesan, bisa dikerjakan belakangan setelah sistem utama selesai.

### Variasi per Dunia (menyesuaikan mood scene masing-masing)

| Dunia | Gaya Gerak |
|---|---|
| **Desert** | Lompatan jelas & agak besar antar platform batu (sesuai gaya platformer di background aslinya), landing squash lebih ditonjolkan |
| **Village** | Jalan santai, bobbing halus, **tanpa lompat** (jalan menyusuri jalan desa yang rata) |
| **Forest** | Gerak sedikit "melayang"/mengambang (bobbing lebih lembut & lambat), disinkronkan dengan kedipan cahaya lentera di sekitar jalur — memperkuat kesan misterius |

### Urutan lengkap 1 siklus traversal

1. User klik node level berikutnya
2. Wizard mulai **lari** (translateX + bobbing) menuju titik tujuan
3. *(Khusus Desert)* di titik tertentu sepanjang jalur, trigger **lompat** (parabola singkat) melewati "gap" platform
4. Sesampainya di node → **squash mendarat** singkat + opsional debu
5. Sprite kembali ke pose normal (idle), diam di node baru
6. Modal quest muncul menutupi sebagian scene

**Catatan performa:** karena semua efek ini transform-based (bukan reflow layout), animasinya tetap ringan bahkan di HP — aman dipakai meski cuma dikerjakan sendirian dengan waktu terbatas.

---

## 9. Ringkasan Keterkaitan Visual ↔ Gameplay

| Elemen di Gambar Asli | Fungsi Gameplay |
|---|---|
| Papan "BOOKS" (Village) | Penanda level vocabulary/grammar |
| Piramida + rumus (Desert) | Penanda tema level matematika, "gerbang" visual antar level |
| Lentera menyala (Forest) | Status node level (padam/redup/terang = terkunci/terbuka/selesai) |
| Potongan puzzle rune (Forest) | Aset langsung untuk mekanisme drag-puzzle |
| Tanda tanya bercahaya (Forest) | Indikator visual "belum dikerjakan" di atas node |
| HUD SCORE/LIVES/LEVEL (Desert) | Diadopsi jadi standar HUD global seluruh aplikasi |
| Koin & obor (Desert) | Representasi XP & status level selesai |
| Wizard berjubah ungu | Avatar tunggal user di seluruh aplikasi |