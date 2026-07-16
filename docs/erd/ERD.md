# ERD QuestLearn

## Tabel Utama (8 tabel, memenuhi 6 minimal)

### users
- id PK
- email UNIQUE
- password (hashed BCrypt)
- nama
- avatar_url
- role ENUM(ADMIN, SISWA)
- total_xp INT
- current_streak INT
- longest_streak INT
- last_active_date DATE
- deleted_at (nullable, soft delete logic via @Where)
- created_at, updated_at

### user_profiles (1:1 dengan users)
- id PK
- user_id FK UNIQUE → users.id
- phone
- birth_date
- bio
- preferred_language

### dunia
- id PK
- nama UNIQUE
- slug
- deskripsi
- icon_url
- background_color
- urutan
- is_active
- deleted_at (soft delete)
- created_at, updated_at

Relasi: dunia 1:M levels

### levels
- id PK
- dunia_id FK → dunia.id (M:1)
- nama
- deskripsi
- urutan
- xp_reward
- min_score_lulus (70)
- is_boss_level
- is_active
- created_at, updated_at

Relasi: levels 1:M soal, 1:M progress_user

### soal
- id PK
- level_id FK → levels.id
- pertanyaan TEXT
- tipe_soal ENUM(PILIHAN_GANDA, ISIAN_SINGKAT, BENAR_SALAH)
- opsi_a, opsi_b, opsi_c, opsi_d
- jawaban_benar (A/B/C/D)
- pembahasan TEXT (inti edukasi)
- gambar_url (upload)
- xp_point
- tingkat_kesulitan (MUDAH, SEDANG, SULIT)
- deleted_at (soft delete)
- created_at, updated_at

Relasi: soal 1:M jawaban_detail

### progress_user
- id PK
- user_id FK → users.id (M:1)
- level_id FK → levels.id (M:1)
- skor INT (0-100)
- total_soal
- jawaban_benar
- is_lulus BOOLEAN
- percobaan_ke
- xp_didapat
- waktu_mulai, waktu_selesai
- created_at, updated_at
- UNIQUE(user_id, level_id)

Relasi: progress_user 1:M jawaban_detail

### jawaban_detail
- id PK
- progress_id FK → progress_user.id
- soal_id FK → soal.id
- jawaban_user
- is_benar
- xp_didapat
- created_at, updated_at

### badges
- id PK
- nama UNIQUE
- kode UNIQUE
- deskripsi
- icon_url
- warna
- syarat_type (XP, STREAK, LEVEL_COMPLETE, FIRST_LEVEL, PERFECT_SCORE)
- syarat_value INT
- xp_bonus
- is_active
- created_at, updated_at

### user_badges (pivot M:M users ↔ badges)
- id PK
- user_id FK → users.id
- badge_id FK → badges.id
- earned_at
- created_at, updated_at
- UNIQUE(user_id, badge_id)

## Relasi Lengkap
- users 1:1 user_profiles (OneToOne) ✅
- dunia 1:M levels (OneToMany) ✅
- levels M:1 dunia (ManyToOne) ✅
- levels 1:M soal (OneToMany)
- users 1:M progress_user (OneToMany)
- progress_user M:1 users, M:1 levels (ManyToOne) ✅
- progress_user 1:M jawaban_detail
- jawaban_detail M:1 progress_user, M:1 soal (ManyToOne)
- badges 1:M user_badges
- users 1:M user_badges
- users M:M badges via user_badges (ManyToMany) ✅

## Diagram (ASCII)

```
[users]----1:1----[user_profiles]
  |1
  |M
  |----[progress_user]----M----[levels]----M----[dunia]
  |         |1                      |1
  |         |M                      |M
  |    [jawaban_detail]          [soal]
  |         M:1                     |
  |         |----[soal]-------------|
  |
  M----[user_badges]----M----[badges]
```

## 3NF
Semua tabel sudah 3NF: tidak ada transitive dependency, semua non-key atribut tergantung langsung ke PK.

## Timestamp & Soft Delete
- Semua tabel utama punya created_at, updated_at via BaseEntity @CreationTimestamp @UpdateTimestamp
- Soft delete di dunia & soal pakai deleted_at + @SQLDelete + @Where(clause="deleted_at IS NULL")

## Seed Data
- 27 users (1 admin + 25 random + 1 demo)
- 3 dunia
- 18 level (6 per dunia)
- 144 soal (8 per level)
- 10 badge
- Progress & UserBadge akan ter-create otomatis saat user submit quest

## Index & FK
- PK auto increment, FK indexed oleh JPA
- UNIQUE constraints: users.email, dunia.nama, badges.kode, progress_user(user_id,level_id), user_badges(user_id,badge_id)
