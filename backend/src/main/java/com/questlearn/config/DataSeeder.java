package com.questlearn.config;

import com.questlearn.entity.*;
import com.questlearn.repository.*;
import com.questlearn.security.PasswordEncoder;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.Priority;
import jakarta.enterprise.event.Observes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

/**
 * Seeds the language worlds, their chapter list, demo accounts and badges.
 *
 * Gameplay content (the words you actually type) lives in {@link TypingWordSeeder}.
 * The legacy multiple-choice quiz tables are no longer seeded because the game is
 * a typing arena now.
 */
@Component
public class DataSeeder {

    @Autowired UserRepository userRepository;
    @Autowired UserProfileRepository profileRepository;
    @Autowired DuniaRepository duniaRepository;
    @Autowired LevelRepository levelRepository;
    @Autowired BadgeRepository badgeRepository;
    @Autowired PasswordEncoder encoder;

    private static final class WorldSeed {
        final String slug;
        final String name;
        final String description;
        final String color;
        final String flag;

        WorldSeed(String slug, String name, String description, String color, String flag) {
            this.slug = slug;
            this.name = name;
            this.description = description;
            this.color = color;
            this.flag = flag;
        }
    }

    private static final List<WorldSeed> WORLDS = Arrays.asList(
            new WorldSeed("bahasa-inggris", "English",
                    "Type English words, useful phrases, and everyday sentences.", "#4C7A5E", "🇬🇧"),
            new WorldSeed("bahasa-indonesia", "Bahasa Indonesia",
                    "Ketik kata, frasa, dan kalimat bahasa Indonesia sehari-hari.", "#D97757", "🇮🇩"),
            new WorldSeed("bahasa-spanyol", "Español",
                    "Escribe palabras, frases y oraciones en español.", "#D98E3B", "🇪🇸"),
            new WorldSeed("bahasa-prancis", "Français",
                    "Tapez des mots, des phrases et des textes en français.", "#8A7BC8", "🇫🇷"),
            new WorldSeed("bahasa-jerman", "Deutsch",
                    "Tippe deutsche Wörter, Sätze und Alltagstexte.", "#4A7BA8", "🇩🇪"),
            new WorldSeed("bahasa-portugis", "Português",
                    "Digite palavras, frases e textos em português.", "#2E9AA8", "🇵🇹")
    );

    private static final List<String> CHAPTER_NAMES = Arrays.asList(
            "First Words", "Everyday Life", "Food & Travel",
            "Nature & Places", "People & Feelings", "Boss: Full Sentences"
    );

    private static final List<String> CHAPTER_DESC = Arrays.asList(
            "Short high-frequency words", "Useful daily phrases", "Ordering, shopping and getting around",
            "Describe the world around you", "Express yourself with confidence", "Type complete sentences under pressure"
    );

    void onStart(@Observes @Priority(1000) StartupEvent ev) {
        System.out.println("=== ENSURING QUESTLEARN CONTENT ===");

        // Accounts are only created on an empty database. The content below is
        // idempotent so an existing installation upgrades in place without
        // losing XP, badges or typing history.
        if (userRepository.count() == 0) seedUsers();
        ensureWorlds();
        ensureBadges();

        System.out.println("Content ready: Users=" + userRepository.count()
                + " Dunia=" + duniaRepository.count()
                + " Level=" + levelRepository.count()
                + " Badge=" + badgeRepository.count());
    }

    private void seedUsers() {
        User admin = User.builder()
                .nama("Admin QuestLearn").email("admin@questlearn.id").password(encoder.encode("admin123"))
                .role(User.Role.ADMIN).totalXp(1000).currentStreak(10).longestStreak(10)
                .build();
        admin = userRepository.save(admin);
        profileRepository.save(UserProfile.builder().user(admin).phone("081234567890").bio("Administrator QuestLearn").build());

        Random rand = new Random(42);
        String[] names = {"Budi Santoso", "Siti Aminah", "Rizky Pratama", "Dewi Lestari", "Andi Wijaya",
                "Maya Sari", "Joko Widodo", "Rina Wati", "Fajar Nugroho", "Lina Marlina", "Agus Setiawan",
                "Nurul Huda", "Eko Prasetyo", "Fitri Handayani", "Hendra Gunawan", "Puspita Sari",
                "Doni Kusuma", "Yuni Astuti", "Bagus Permadi", "Sari Indah", "Aditya Putra",
                "Kartika Dewi", "Slamet Riyadi", "Intan Permata", "Bambang Pamungkas"};
        for (int i = 0; i < names.length; i++) {
            String email = names[i].toLowerCase().replaceAll(" ", "") + (i + 1) + "@gmail.com";
            User u = User.builder()
                    .nama(names[i]).email(email).password(encoder.encode("siswa123"))
                    .role(User.Role.SISWA)
                    .totalXp(rand.nextInt(500)).currentStreak(rand.nextInt(7))
                    .longestStreak(rand.nextInt(10)).lastActiveDate(LocalDate.now().minusDays(rand.nextInt(3)))
                    .avatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + names[i].replaceAll(" ", "%20"))
                    .build();
            u = userRepository.save(u);
            profileRepository.save(UserProfile.builder().user(u)
                    .phone("08" + (1000000000 + rand.nextInt(900000000)))
                    .bio("Pembelajar semangat dari " + names[i]).build());
        }

        User demo = User.builder().nama("Demo Siswa").email("siswa@demo.id").password(encoder.encode("demo123"))
                .role(User.Role.SISWA).totalXp(120).currentStreak(3).longestStreak(5).build();
        demo = userRepository.save(demo);
        profileRepository.save(UserProfile.builder().user(demo).bio("Akun demo untuk testing").build());
    }

    private void ensureWorlds() {
        int order = 1;
        for (WorldSeed seed : WORLDS) {
            Dunia dunia = duniaRepository.findBySlug(seed.slug).orElse(null);
            if (dunia == null) {
                dunia = duniaRepository.save(Dunia.builder()
                        .nama(seed.name)
                        .slug(seed.slug)
                        .deskripsi(seed.description)
                        .backgroundColor(seed.color)
                        .iconUrl(seed.flag)
                        .urutan(order)
                        .isActive(true)
                        .build());
            }
            order++;

            // Older installs may already have chapters; only create a set when the
            // world has none.
            if (levelRepository.findByDuniaIdOrderByUrutanAsc(dunia.getId()).isEmpty()) {
                for (int i = 0; i < CHAPTER_NAMES.size(); i++) {
                    Level level = Level.builder()
                            .dunia(dunia)
                            .nama(CHAPTER_NAMES.get(i))
                            .deskripsi(CHAPTER_DESC.get(i))
                            .urutan(i + 1)
                            .xpReward(50 + i * 10)
                            .minScoreLulus(70)
                            .isBossLevel(i == CHAPTER_NAMES.size() - 1)
                            .isActive(true)
                            .build();
                    levelRepository.save(level);
                }
            }
        }

        // Hide the retired math/logic worlds from the game without deleting their
        // history. Fresh installs never create them.
        deactivateLegacyWorld("matematika-dasar");
        deactivateLegacyWorld("logika-pengetahuan-umum");
    }

    private void deactivateLegacyWorld(String slug) {
        duniaRepository.findBySlug(slug).ifPresent(dunia -> {
            if (Boolean.TRUE.equals(dunia.getIsActive())) {
                dunia.setIsActive(false);
                duniaRepository.save(dunia);
            }
        });
    }

    private void ensureBadges() {
        List<Badge> badges = Arrays.asList(
                Badge.builder().nama("Langkah Pertama").kode("FIRST_STEP").deskripsi("Selesaikan sesi typing pertamamu!").warna("#7A9B76").syaratType("TYPING_SESSION").syaratValue(1).xpBonus(20).build(),
                Badge.builder().nama("Pembelajar Konsisten").kode("STREAK_3").deskripsi("Belajar 3 hari berturut-turut").warna("#E8A93B").syaratType("STREAK").syaratValue(3).xpBonus(30).build(),
                Badge.builder().nama("Minggu Produktif").kode("STREAK_7").deskripsi("Streak 7 hari! Luar biasa").warna("#D97757").syaratType("STREAK").syaratValue(7).xpBonus(50).build(),
                Badge.builder().nama("Kolektor XP").kode("XP_100").deskripsi("Kumpulkan 100 XP").warna("#2C5F5D").syaratType("XP").syaratValue(100).xpBonus(10).build(),
                Badge.builder().nama("Master XP").kode("XP_500").deskripsi("Kumpulkan 500 XP").warna("#2C5F5D").syaratType("XP").syaratValue(500).xpBonus(30).build(),
                Badge.builder().nama("Pemburu Kata").kode("KILL_25").deskripsi("Selesaikan 25 kata").warna("#7A9B76").syaratType("TYPING_KILLS").syaratValue(25).xpBonus(40).build(),
                Badge.builder().nama("Combo Master").kode("COMBO_20").deskripsi("Capai combo 20 dalam satu sesi").warna("#D97757").syaratType("TYPING_COMBO").syaratValue(20).xpBonus(60).build(),
                Badge.builder().nama("Nilai Sempurna").kode("PERFECT").deskripsi("Akurasi 100% dalam satu sesi typing").warna("#E8A93B").syaratType("ACCURACY").syaratValue(100).xpBonus(50).build(),
                Badge.builder().nama("Polyglot").kode("POLYGLOT").deskripsi("Mainkan semua 6 dunia bahasa").warna("#8A7BC8").syaratType("DISTINCT_DUNIA").syaratValue(6).xpBonus(100).build(),
                Badge.builder().nama("Jago Ngetik Pemula").kode("WPM_20").deskripsi("Raih 20 WPM di sesi typing").warna("#7A9B76").syaratType("WPM").syaratValue(20).xpBonus(20).build(),
                Badge.builder().nama("Jago Ngetik Menengah").kode("WPM_40").deskripsi("Raih 40 WPM di sesi typing").warna("#E8A93B").syaratType("WPM").syaratValue(40).xpBonus(30).build(),
                Badge.builder().nama("Master Typist").kode("WPM_60").deskripsi("Raih 60 WPM di sesi typing").warna("#D97757").syaratType("WPM").syaratValue(60).xpBonus(50).build(),
                Badge.builder().nama("Akurat Banget").kode("ACC_95").deskripsi("Akurasi 95% dalam satu sesi typing").warna("#2C5F5D").syaratType("ACCURACY").syaratValue(95).xpBonus(30).build(),
                Badge.builder().nama("Penyelesai Kata").kode("KILL_100").deskripsi("Selesaikan 100 kata total").warna("#E8A93B").syaratType("TYPING_KILLS").syaratValue(100).xpBonus(40).build()
        );
        for (Badge badge : badges) {
            if (badgeRepository.findByKode(badge.getKode()).isEmpty()) {
                badgeRepository.save(badge);
            }
        }
    }
}
