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

@Component
public class DataSeeder {

    @Autowired UserRepository userRepository;
    @Autowired UserProfileRepository profileRepository;
    @Autowired DuniaRepository duniaRepository;
    @Autowired LevelRepository levelRepository;
    @Autowired SoalRepository soalRepository;
    @Autowired BadgeRepository badgeRepository;
    @Autowired ProgressUserRepository progressRepository;

    @Autowired PasswordEncoder encoder;

    void onStart(@Observes @Priority(1000) StartupEvent ev) {
        if (userRepository.count() > 0) return; // already seeded

        System.out.println("=== SEEDING DATA QUESTLEARN ===");

        // Users: admin + 25 siswa
        User admin = User.builder()
                .nama("Admin QuestLearn").email("admin@questlearn.id").password(encoder.encode("admin123"))
                .role(User.Role.ADMIN).totalXp(1000).currentStreak(10).longestStreak(10)
                .build();
        admin = userRepository.save(admin);
        profileRepository.save(UserProfile.builder().user(admin).phone("081234567890").bio("Administrator QuestLearn").build());

        List<User> students = new ArrayList<>();
        Random rand = new Random();
        String[] names = {"Budi Santoso","Siti Aminah","Rizky Pratama","Dewi Lestari","Andi Wijaya","Maya Sari","Joko Widodo","Rina Wati","Fajar Nugroho","Lina Marlina","Agus Setiawan","Nurul Huda","Eko Prasetyo","Fitri Handayani","Hendra Gunawan","Puspita Sari","Doni Kusuma","Yuni Astuti","Bagus Permadi","Sari Indah","Aditya Putra","Kartika Dewi","Slamet Riyadi","Intan Permata","Bambang Pamungkas"};
        for (int i=0;i<names.length;i++) {
            String email = names[i].toLowerCase().replaceAll(" ","") + (i+1) + "@gmail.com";
            User u = User.builder()
                    .nama(names[i]).email(email).password(encoder.encode("siswa123"))
                    .role(User.Role.SISWA)
                    .totalXp(rand.nextInt(500)).currentStreak(rand.nextInt(7))
                    .longestStreak(rand.nextInt(10)).lastActiveDate(LocalDate.now().minusDays(rand.nextInt(3)))
                    .avatarUrl("https://api.dicebear.com/7.x/initials/svg?seed="+names[i].replaceAll(" ","%20"))
                    .build();
            u = userRepository.save(u);
            profileRepository.save(UserProfile.builder().user(u).phone("08"+ (1000000000+rand.nextInt(900000000))).bio("Pembelajar semangat dari "+names[i]).build());
            students.add(u);
        }
        // demo user
        User demo = User.builder().nama("Demo Siswa").email("siswa@demo.id").password(encoder.encode("demo123")).role(User.Role.SISWA).totalXp(120).currentStreak(3).longestStreak(5).build();
        demo = userRepository.save(demo);
        profileRepository.save(UserProfile.builder().user(demo).bio("Akun demo untuk testing").build());
        students.add(demo);

        // Dunia
        Dunia inggris = Dunia.builder().nama("Bahasa Inggris").slug("bahasa-inggris").deskripsi("Kuasai vocabulary, grammar, dan listening bahasa Inggris dari dasar hingga menengah").backgroundColor("#D97757").urutan(1).isActive(true).iconUrl("🇬🇧").build();
        Dunia mtk = Dunia.builder().nama("Matematika Dasar").slug("matematika-dasar").deskripsi("Asah kemampuan berhitung, aljabar, geometri, dan logika matematika").backgroundColor("#2C5F5D").urutan(2).isActive(true).iconUrl("🔢").build();
        Dunia logika = Dunia.builder().nama("Logika & Pengetahuan Umum").slug("logika-pengetahuan-umum").deskripsi("Tingkatkan kemampuan berpikir kritis, deduksi, dan wawasan umum").backgroundColor("#E8A93B").urutan(3).isActive(true).iconUrl("🧠").build();
        inggris = duniaRepository.save(inggris);
        mtk = duniaRepository.save(mtk);
        logika = duniaRepository.save(logika);

        // Levels
        List<String> engLevelNames = Arrays.asList("Vocabulary Dasar","Simple Present Tense","Vocabulary Menengah","Simple Past Tense","Listening Dasar","Grammar Campuran");
        List<String> engDesc = Arrays.asList("Kata benda sehari-hari & sapaan","Kebiasaan & fakta umum","Kata sifat & kerja umum","Menceritakan masa lalu","Memahami percakapan singkat","Ujian boss - semua materi campur");
        List<Level> engLevels = new ArrayList<>();
        for (int i=0;i<6;i++) {
            Level lvl = Level.builder().dunia(inggris).nama(engLevelNames.get(i)).deskripsi(engDesc.get(i)).urutan(i+1).xpReward(50+i*10).minScoreLulus(70).isBossLevel(i==5).isActive(true).build();
            engLevels.add(levelRepository.save(lvl));
        }

        List<String> mtkNames = Arrays.asList("Operasi Hitung Dasar","Perkalian & Pembagian","Pecahan Dasar","Aljabar Sederhana","Bangun Datar Dasar","Soal Cerita Campuran");
        List<String> mtkDesc = Arrays.asList("Tambah & kurang cepat","Perkalian & pembagian 1-100","Setengah, seperempat, dsb","Persamaan satu variabel","Keliling & luas","Boss level - cerita nyata");
        List<Level> mtkLevels = new ArrayList<>();
        for (int i=0;i<6;i++) {
            Level lvl = Level.builder().dunia(mtk).nama(mtkNames.get(i)).deskripsi(mtkDesc.get(i)).urutan(i+1).xpReward(50+i*10).minScoreLulus(70).isBossLevel(i==5).isActive(true).build();
            mtkLevels.add(levelRepository.save(lvl));
        }

        List<String> logNames = Arrays.asList("Pola & Urutan","Sebab-Akibat","Teka-teki Deduksi","Pengetahuan Umum Dasar","Analisis Pernyataan","Soal Campuran");
        List<String> logDesc = Arrays.asList("Lanjutkan pola angka/gambar","Jika maka dengan contoh nyata","Siapa duduk di mana?","Sains & sejarah ringan","Benar/salah logis","Boss - semua tipe soal");
        List<Level> logLevels = new ArrayList<>();
        for (int i=0;i<6;i++) {
            Level lvl = Level.builder().dunia(logika).nama(logNames.get(i)).deskripsi(logDesc.get(i)).urutan(i+1).xpReward(50+i*10).minScoreLulus(70).isBossLevel(i==5).isActive(true).build();
            logLevels.add(levelRepository.save(lvl));
        }

        // Soal English - we create diverse set
        seedEnglish(engLevels);
        seedMath(mtkLevels);
        seedLogic(logLevels);

        // Badges - 10 badges
        List<Badge> badges = Arrays.asList(
                Badge.builder().nama("Langkah Pertama").kode("FIRST_STEP").deskripsi("Selesaikan level pertamamu!").warna("#7A9B76").syaratType("FIRST_LEVEL").syaratValue(1).xpBonus(20).build(),
                Badge.builder().nama("Pembelajar Konsisten").kode("STREAK_3").deskripsi("Belajar 3 hari berturut-turut").warna("#E8A93B").syaratType("STREAK").syaratValue(3).xpBonus(30).build(),
                Badge.builder().nama("Minggu Produktif").kode("STREAK_7").deskripsi("Streak 7 hari! Luar biasa").warna("#D97757").syaratType("STREAK").syaratValue(7).xpBonus(50).build(),
                Badge.builder().nama("Kolektor XP").kode("XP_100").deskripsi("Kumpulkan 100 XP").warna("#2C5F5D").syaratType("XP").syaratValue(100).xpBonus(10).build(),
                Badge.builder().nama("Master XP").kode("XP_500").deskripsi("Kumpulkan 500 XP").warna("#2C5F5D").syaratType("XP").syaratValue(500).xpBonus(30).build(),
                Badge.builder().nama("Pemenang 5 Level").kode("LEVEL_5").deskripsi("Selesaikan 5 level").warna("#7A9B76").syaratType("LEVEL_COMPLETE").syaratValue(5).xpBonus(40).build(),
                Badge.builder().nama("Penjelajah Dunia").kode("LEVEL_10").deskripsi("Selesaikan 10 level").warna("#D97757").syaratType("LEVEL_COMPLETE").syaratValue(10).xpBonus(60).build(),
                Badge.builder().nama("Nilai Sempurna").kode("PERFECT").deskripsi("Dapatkan 100% di satu level").warna("#E8A93B").syaratType("PERFECT_SCORE").syaratValue(1).xpBonus(50).build(),
                Badge.builder().nama("Polyglot Pemula").kode("ENG_MASTER").deskripsi("Selesaikan semua level Bahasa Inggris").warna("#D97757").syaratType("LEVEL_COMPLETE").syaratValue(6).xpBonus(100).build(),
                Badge.builder().nama("Ahli Logika").kode("LOGIC_MASTER").deskripsi("Selesaikan dunia Logika").warna("#E8A93B").syaratType("LEVEL_COMPLETE").syaratValue(18).xpBonus(150).build(),
                // Typing badges
                Badge.builder().nama("Jago Ngetik Pemula").kode("WPM_20").deskripsi("Raih 20 WPM di sesi typing").warna("#7A9B76").syaratType("WPM").syaratValue(20).xpBonus(20).build(),
                Badge.builder().nama("Jago Ngetik Menengah").kode("WPM_40").deskripsi("Raih 40 WPM di sesi typing").warna("#E8A93B").syaratType("WPM").syaratValue(40).xpBonus(30).build(),
                Badge.builder().nama("Master Typist").kode("WPM_60").deskripsi("Raih 60 WPM di sesi typing").warna("#D97757").syaratType("WPM").syaratValue(60).xpBonus(50).build(),
                Badge.builder().nama("Akurat Banget").kode("ACC_95").deskripsi("Akurasi 95% dalam satu sesi typing").warna("#2C5F5D").syaratType("ACCURACY").syaratValue(95).xpBonus(30).build(),
                Badge.builder().nama("Pembantai Musuh").kode("KILL_100").deskripsi("Kalahkan 100 musuh total di typing mode").warna("#E8A93B").syaratType("TYPING_KILLS").syaratValue(100).xpBonus(40).build()
        );
        for (Badge b : badges) badgeRepository.save(b);

        System.out.println("Seeding selesai: Users="+userRepository.count()+" Dunia="+duniaRepository.count()+" Level="+levelRepository.count()+" Soal="+soalRepository.count()+" Badge="+badgeRepository.count());
    }

    private void seedEnglish(List<Level> levels) {
        // Level 1 vocab dasar
        List<Soal> l1 = Arrays.asList(
                createSoal(levels.get(0), "What is 'Apple' in Indonesian?", "Pilihan Apel Indonesia", "Apel", "Jeruk", "Pisang", "Anggur", "A", "Apple = Apel, contoh buah yang umum.", "MUDAH", 10),
                createSoal(levels.get(0), "What color is 'Blue'?", "Warna Biru dalam bahasa Indonesia?", "Merah", "Biru", "Hijau", "Kuning", "B", "Blue = Biru seperti langit.", "MUDAH", 10),
                createSoal(levels.get(0), "Choose the correct translation: 'Book'", "Pilih terjemahan 'Book'", "Buku", "Meja", "Kursi", "Pintu", "A", "Book artinya Buku.", "MUDAH", 10),
                createSoal(levels.get(0), "What is 'Cat'?", "Hewan berkumis yang suka ikan", "Anjing", "Kucing", "Burung", "Ikan", "B", "Cat = Kucing.", "MUDAH", 10),
                createSoal(levels.get(0), "Complete: 'Good _____ (pagi)'", "Sapaan pagi hari", "Morning", "Afternoon", "Evening", "Night", "A", "Good Morning = Selamat Pagi.", "MUDAH", 10),
                createSoal(levels.get(0), "What is 'Water'?", "Cairan untuk minum", "Air", "Api", "Tanah", "Angin", "A", "Water = Air.", "MUDAH", 10),
                createSoal(levels.get(0), "Translate 'House'", "Tempat tinggal", "Rumah", "Sekolah", "Pasar", "Kantor", "A", "House = Rumah.", "MUDAH", 10),
                createSoal(levels.get(0), "What is 'Sun'?", "Benda langit yang menyinari siang", "Matahari", "Bulan", "Bintang", "Awan", "A", "Sun = Matahari.", "MUDAH", 10)
        );
        soalRepository.saveAll(l1);

        // Level 2 Simple Present
        List<Soal> l2 = Arrays.asList(
                createSoal(levels.get(1), "I ____ (eat) breakfast every morning", "Kebiasaan sehari-hari", "eats", "eat", "eating", "ate", "B", "I/You/We/They + verb base. I eat.", "SEDANG", 10),
                createSoal(levels.get(1), "She ____ (go) to school every day", "He/She/It + s/es", "go", "goes", "going", "went", "B", "She goes - tambah es.", "SEDANG", 10),
                createSoal(levels.get(1), "They ____ football on Sunday", "Kata kerja play", "plays", "playing", "play", "played", "C", "They play - tanpa s.", "SEDANG", 10),
                createSoal(levels.get(1), "____ you like coffee?", "Question simple present", "Do", "Does", "Did", "Are", "A", "Do you...?", "SEDANG", 10),
                createSoal(levels.get(1), "He does not ____ meat", "Negative form", "eats", "eat", "eating", "ate", "B", "does not + verb1.", "SEDANG", 10),
                createSoal(levels.get(1), "Water ____ at 100 degrees", "Fakta umum", "boil", "boils", "boiling", "boiled", "B", "Fakta umum pakai s.", "SEDANG", 10),
                createSoal(levels.get(1), "My father ____ in a bank", "Pekerjaan", "work", "works", "working", "worked", "B", "My father = He, pakai works.", "SEDANG", 10),
                createSoal(levels.get(1), "We ____ English", "Kebiasaan belajar", "study", "studies", "studying", "studied", "A", "We study.", "SEDANG", 10)
        );
        soalRepository.saveAll(l2);

        // Level 3 vocab menengah
        List<Soal> l3 = Arrays.asList(
                createSoal(levels.get(2), "Choose the adjective: 'The sky is ____'", "Kata sifat untuk langit luas", "beautiful", "quickly", "beautifully", "beauty", "A", "beautiful = kata sifat.", "SEDANG", 12),
                createSoal(levels.get(2), "Opposite of 'Happy' is ____", "Lawan kata happy", "Sad", "Glad", "Joyful", "Excited", "A", "Happy vs Sad.", "MUDAH", 12),
                createSoal(levels.get(2), "Verb for 'Berlari' is", "Aksi cepat dengan kaki", "Run", "Walk", "Jump", "Sit", "A", "Run = Berlari.", "MUDAH", 12),
                createSoal(levels.get(2), "'Diligent' means", "Rajin dalam bahasa Inggris", "Malas", "Rajin", "Cerdas", "Lambat", "B", "Diligent = rajin.", "SEDANG", 12),
                createSoal(levels.get(2), "Noun from 'Teach' is", "Bentuk noun", "Teacher", "Teaching", "Teaches", "Taught", "A", "Teacher = pengajar.", "SEDANG", 12),
                createSoal(levels.get(2), "What is 'Brave'?", "Sifat pemberani", "Takut", "Berani", "Sedih", "Senang", "B", "Brave = Berani.", "MUDAH", 12),
                createSoal(levels.get(2), "Synonym of 'Big' is", "Persamaan big", "Large", "Small", "Tiny", "Little", "A", "Big = Large.", "MUDAH", 12),
                createSoal(levels.get(2), "What is 'Honest'?", "Sifat jujur", "Jujur", "Bohong", "Malas", "Marah", "A", "Honest = Jujur.", "SEDANG", 12)
        );
        soalRepository.saveAll(l3);

        // Level 4 Simple Past
        List<Soal> l4 = Arrays.asList(
                createSoal(levels.get(3), "I ____ to Bali last year (go)", "Past of go", "go", "went", "gone", "going", "B", "Past tense go -> went.", "SEDANG", 12),
                createSoal(levels.get(3), "She ____ not come yesterday", "Negative past", "did", "does", "do", "was", "A", "Did not + verb1.", "SEDANG", 12),
                createSoal(levels.get(3), "They ____ football yesterday", "Past play", "play", "played", "playing", "plays", "B", "Played.", "MUDAH", 12),
                createSoal(levels.get(3), "____ you see him yesterday?", "Question past", "Do", "Does", "Did", "Are", "C", "Did you...?", "SEDANG", 12),
                createSoal(levels.get(3), "I was ____ when you called", "Past continuous", "sleep", "sleeping", "slept", "sleeps", "B", "was sleeping.", "SEDANG", 12),
                createSoal(levels.get(3), "We ____ dinner at 7 PM last night", "Irregular eat", "eat", "ate", "eaten", "eating", "B", "Ate.", "MUDAH", 12),
                createSoal(levels.get(3), "He ____ his key yesterday", "Lose past", "lose", "lost", "losing", "losed", "B", "Lost.", "MUDAH", 12),
                createSoal(levels.get(3), "The movie ____ at 8 PM", "Start past", "start", "started", "starting", "starts", "B", "Started.", "SEDANG", 12)
        );
        soalRepository.saveAll(l4);

        // Level 5 listening dasar (simulate with text)
        List<Soal> l5 = Arrays.asList(
                createSoal(levels.get(4), "Listen: 'How are you?' Best reply", "Jawaban sapaan", "I'm fine, thank you", "I am a table", "Yes, I do", "I like apple", "A", "How are you? -> I'm fine.", "MUDAH", 15),
                createSoal(levels.get(4), "If someone says 'Thank you', you say", "Balasan terima kasih", "You're welcome", "I'm sorry", "Good night", "See you", "A", "You're welcome.", "MUDAH", 15),
                createSoal(levels.get(4), "Hear: 'What time is it? It is 3 o'clock' - what time?", "Waktu", "3 PM/AM", "4 PM", "2 PM", "5 PM", "A", "3 o'clock.", "MUDAH", 15),
                createSoal(levels.get(4), "Hear: 'I have two brothers' means", "Jumlah saudara", "Punya 2 saudara laki", "Punya 2 saudari", "Anak tunggal", "Punya 3 saudara", "A", "Two brothers.", "SEDANG", 15),
                createSoal(levels.get(4), "Listen: 'Can you help me?' polite request", "Permintaan bantuan", "Sure", "No", "I am not", "Yes I am book", "A", "Sure = Tentu.", "SEDANG", 15),
                createSoal(levels.get(4), "If audio: 'It's raining', you should bring", "Benda untuk hujan", "Umbrella", "Sunglasses", "Hat", "Shoes", "A", "Umbrella for rain.", "MUDAH", 15),
                createSoal(levels.get(4), "Quick listening: 'She is cooking in the kitchen' Where?", "Tempat memasak", "Kitchen", "Bedroom", "Bathroom", "Garden", "A", "In the kitchen.", "SEDANG", 15),
                createSoal(levels.get(4), "Hear: 'The book is on the table' Where is the book?", "Posisi buku", "On the table", "Under table", "In table", "At table", "A", "On the table.", "MUDAH", 15)
        );
        soalRepository.saveAll(l5);

        // Level 6 boss
        List<Soal> l6 = Arrays.asList(
                createSoal(levels.get(5), "I ____ English for 2 years (have studied)", "Present perfect", "have studied", "has studied", "studied", "studying", "A", "I have studied.", "SULIT", 20),
                createSoal(levels.get(5), "Which is correct? 'She ___ to the market yesterday'", "Past + waktu", "go", "went", "goes", "going", "B", "Went yesterday.", "SULIT", 20),
                createSoal(levels.get(5), "Synonym of 'Smart' + use present: 'He ___ very smart'", "Be + adjective", "is", "are", "am", "be", "A", "He is smart.", "SULIT", 20),
                createSoal(levels.get(5), "If it rains, we ____ at home (will stay)", "Future conditional", "will stay", "stay", "stays", "stayed", "A", "Future simple.", "SULIT", 20),
                createSoal(levels.get(5), "Past of 'Buy' is", "Irregular verb", "Bought", "Buyed", "Buy", "Buying", "A", "Buy -> Bought.", "SEDANG", 20),
                createSoal(levels.get(5), "Choose correct order: 'never / I / have / seen / this'", "Penyusunan kalimat", "I have never seen this", "I never have seen this", "Never I have seen this", "I have seen never this", "A", "I have never seen this.", "SULIT", 20),
                createSoal(levels.get(5), "What is plural of 'Child'?", "Irregular plural", "Children", "Childs", "Childes", "Childrens", "A", "Children.", "SEDANG", 20),
                createSoal(levels.get(5), "Complete: 'If I ___ you, I would study harder'", "Subjunctive", "was", "were", "am", "will be", "B", "If I were you.", "SULIT", 20)
        );
        soalRepository.saveAll(l6);
    }

    private void seedMath(List<Level> levels) {
        // Level 1
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(0), "5 + 7 = ?", "Penjumlahan dasar", "10", "12", "13", "11", "B", "5+7=12", "MUDAH", 10),
                createSoal(levels.get(0), "15 - 8 = ?", "Pengurangan", "5", "6", "7", "8", "C", "15-8=7", "MUDAH", 10),
                createSoal(levels.get(0), "9 + 6 - 3 = ?", "Gabungan", "12", "13", "11", "10", "A", "9+6=15-3=12", "MUDAH", 10),
                createSoal(levels.get(0), "20 - 5 + 2 = ?", "Operasi berurutan", "17", "15", "18", "13", "A", "20-5=15+2=17", "MUDAH", 10),
                createSoal(levels.get(0), "100 + 25 = ?", "Ratusan", "115", "120", "125", "130", "C", "100+25=125", "MUDAH", 10),
                createSoal(levels.get(0), "48 - 18 = ?", "Pengurangan puluhan", "20", "25", "30", "35", "C", "48-18=30", "MUDAH", 10),
                createSoal(levels.get(0), "7 + 8 + 5 = ?", "Tiga angka", "18", "19", "20", "21", "C", "7+8=15+5=20", "MUDAH", 10),
                createSoal(levels.get(0), "0 + 15 = ?", "Penjumlahan nol", "0", "15", "1", "5", "B", "0+15=15", "MUDAH", 10)
        ));
        // Level 2
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(1), "6 x 7 = ?", "Perkalian", "42", "40", "36", "48", "A", "6x7=42", "MUDAH", 10),
                createSoal(levels.get(1), "56 : 7 = ?", "Pembagian", "6", "7", "8", "9", "C", "56:7=8", "MUDAH", 10),
                createSoal(levels.get(1), "9 x 9 = ?", "Persegi", "80", "81", "82", "79", "B", "9x9=81", "MUDAH", 10),
                createSoal(levels.get(1), "72 : 9 = ?", "Pembagian", "6", "7", "8", "9", "C", "9x8=72", "MUDAH", 10),
                createSoal(levels.get(1), "12 x 5 = ?", "Kali 5", "50", "55", "60", "65", "C", "12x5=60", "MUDAH", 10),
                createSoal(levels.get(1), "100 : 4 = ?", "Bagi 4", "20", "25", "30", "35", "B", "100:4=25", "MUDAH", 10),
                createSoal(levels.get(1), "7 x 8 : 2 = ?", "Campur", "28", "32", "24", "36", "A", "56:2=28", "SEDANG", 10),
                createSoal(levels.get(1), "81 : 9 x 2 = ?", "Urutan", "16", "18", "20", "14", "B", "9x2=18", "SEDANG", 10)
        ));
        // Level 3 pecahan
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(2), "1/2 + 1/2 = ?", "Penjumlahan pecahan sama penyebut", "1", "2", "1/2", "2/4", "A", "1/2+1/2=1", "MUDAH", 12),
                createSoal(levels.get(2), "3/4 - 1/4 = ?", "Pengurangan pecahan", "1/2", "2/4", "1/4", "2/2", "A", "2/4=1/2", "MUDAH", 12),
                createSoal(levels.get(2), "1/2 dari 10 adalah", "Pecahan dari bilangan", "5", "2", "10", "20", "A", "Setengah dari 10 =5", "MUDAH", 12),
                createSoal(levels.get(2), "2/3 + 1/3 = ?", "Pecahan", "1", "3/3", "2/3", "A dan B benar", "D", "3/3=1 jadi A dan B benar", "MUDAH", 12),
                createSoal(levels.get(2), "Bentuk desimal 1/4", "Desimal", "0,25", "0,5", "0,75", "0,4", "A", "1/4=0,25", "SEDANG", 12),
                createSoal(levels.get(2), "0,5 = ...", "Pecahan desimal", "1/2", "1/4", "1/5", "1/3", "A", "0,5=1/2", "MUDAH", 12),
                createSoal(levels.get(2), "3/5 dari 100", "Pecahan", "60", "50", "30", "20", "A", "3/5*100=60", "SEDANG", 12),
                createSoal(levels.get(2), "1 - 1/3 = ?", "Pengurangan", "2/3", "1/3", "3/3", "0", "A", "2/3", "SEDANG", 12)
        ));
        // Level 4 aljabar
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(3), "Jika x+5=12, maka x=?", "Persamaan sederhana", "5", "6", "7", "12", "C", "x=12-5=7", "MUDAH", 12),
                createSoal(levels.get(3), "2x = 10, x=?", "Kali", "2", "5", "10", "20", "B", "x=5", "MUDAH", 12),
                createSoal(levels.get(3), "3x - 2 = 7, x=?", "Dua langkah", "2", "3", "4", "5", "B", "3x=9 x=3", "SEDANG", 12),
                createSoal(levels.get(3), "Jika y =2x dan x=3, y=?", "Substitusi", "3", "5", "6", "9", "C", "y=6", "MUDAH", 12),
                createSoal(levels.get(3), "x/2 = 8, x=?", "Bagi", "4", "16", "8", "2", "B", "x=16", "MUDAH", 12),
                createSoal(levels.get(3), "5 + x = 5, x=?", "Nol", "0", "5", "10", "1", "A", "x=0", "MUDAH", 12),
                createSoal(levels.get(3), "2x+3=3x-1, x=?", "Satu sisi", "2", "3", "4", "5", "C", "x=4", "SULIT", 12),
                createSoal(levels.get(3), "Jika a=5, b=2, a+b x2 =?", "Operasi", "14", "9", "7", "9", "B", "5+4=9", "SEDANG", 12)
        ));
        // Level 5 bangun datar
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(4), "Luas persegi sisi 5 cm", "Luas = s*s", "20 cm2", "25 cm2", "10 cm2", "15 cm2", "B", "5*5=25", "MUDAH", 15),
                createSoal(levels.get(4), "Keliling persegi 4 cm sisi", "Keliling = 4*s", "8 cm", "12 cm", "16 cm", "20 cm", "C", "4*4=16", "MUDAH", 15),
                createSoal(levels.get(4), "Luas persegi panjang 5x3", "P*L", "15", "8", "16", "10", "A", "15", "MUDAH", 15),
                createSoal(levels.get(4), "Luas segitiga alas 6 tinggi 4", "0,5*a*t", "10", "12", "14", "24", "B", "0,5*24=12", "SEDANG", 15),
                createSoal(levels.get(4), "Jumlah sudut segitiga", "Fakta", "90", "180", "270", "360", "B", "180 derajat", "MUDAH", 15),
                createSoal(levels.get(4), "Diameter lingkaran jika jari-jari 7", "D=2r", "7", "14", "21", "28", "B", "14", "MUDAH", 15),
                createSoal(levels.get(4), "Sisi kubus jika bentuknya persegi ada", "Sisi", "4", "6", "8", "12", "B", "Kubus 6 sisi", "MUDAH", 15),
                createSoal(levels.get(4), "Keliling lingkaran r=7 (phi=22/7)", "2*pi*r", "22", "44", "33", "14", "B", "2*22/7*7=44", "SEDANG", 15)
        ));
        // Level 6 boss cerita
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(5), "Ani punya 5 apel, diberi 3 lagi, dimakan 2. Sisa?", "Cerita", "5", "6", "7", "8", "B", "5+3=8-2=6", "SEDANG", 20),
                createSoal(levels.get(5), "Budi beli 3 buku @5000, bayar 20000 kembalian?", "Uang", "5000", "10000", "15000", "2000", "A", "15000 bayar, kembali 5000", "MUDAH", 20),
                createSoal(levels.get(5), "Sebuah mobil 60 km/jam, jarak 120 km, waktu?", "Kecepatan", "1 jam", "2 jam", "3 jam", "4 jam", "B", "120/60=2", "SEDANG", 20),
                createSoal(levels.get(5), "Jika 2 loyang kue dipotong jadi 8 tiap loyang, 3 potong dimakan, sisa potongan?", "Pecahan cerita", "13", "14", "15", "16", "A", "16-3=13", "SEDANG", 20),
                createSoal(levels.get(5), "Usia Ayah 3x usia Anak, jumlah 40, usia Anak?", "Aljabar cerita", "10", "15", "20", "30", "A", "4x=40 x=10", "SULIT", 20),
                createSoal(levels.get(5), "Persegi panjang keliling 20, panjang 6, lebar?", "Keliling", "4", "5", "6", "8", "A", "2*(6+l)=20 => l=4", "SULIT", 20),
                createSoal(levels.get(5), "Rata-rata 3 angka 10, 12, dan x = 11, x?", "Rata-rata", "10", "11", "12", "9", "B", "(10+12+x)/3=11 => x=11", "SEDANG", 20),
                createSoal(levels.get(5), "Diskon 20% dari 50000", "Diskon", "40000", "45000", "10000", "20000", "A", "50000-10000=40000", "SEDANG", 20)
        ));
    }

    private void seedLogic(List<Level> levels) {
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(0), "Lanjutkan: 2,4,6,8,...", "Pola genap", "9", "10", "11", "12", "B", "Bilangan genap selanjutnya 10", "MUDAH", 10),
                createSoal(levels.get(0), "2,3,5,7,11,... bilangan apa?", "Bilangan prima", "12", "13", "15", "17", "B", "Prima selanjutnya 13", "SEDANG", 10),
                createSoal(levels.get(0), "A,B,C,D,... setelah D?", "Alfabet", "E", "F", "G", "H", "A", "E", "MUDAH", 10),
                createSoal(levels.get(0), "5,10,15,20,... next", "Kelipatan 5", "22", "25", "30", "24", "B", "+5 =25", "MUDAH", 10),
                createSoal(levels.get(0), "1,1,2,3,5,8,... next (Fibonacci)", "Fibo", "11", "12", "13", "14", "C", "5+8=13", "SEDANG", 10),
                createSoal(levels.get(0), "Z,X,V,T,... next", "Mundur 2 huruf", "R", "S", "Q", "P", "A", "Z(26) X(24) V(22) T(20) R(18)", "SULIT", 10),
                createSoal(levels.get(0), "2,6,12,20,... next", "Pola n(n+1)", "24", "28", "30", "36", "C", "5*6=30", "SULIT", 10),
                createSoal(levels.get(0), "100,95,90,85,... next", "-5", "80", "75", "70", "85", "A", "80", "MUDAH", 10)
        ));
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(1), "Jika hujan, jalan basah. Hujan. Maka?", "Silogisme", "Jalan basah", "Jalan kering", "Tidak hujan", "Tidak tahu", "A", "Modus ponens", "SEDANG", 12),
                createSoal(levels.get(1), "Semua burung bisa terbang. Penguin burung. Maka?", "Deduksi", "Penguin bisa terbang (secara logika)", "Penguin tidak burung", "Tidak bisa disimpulkan", "Semua burung penguin", "A", "Secara logika premis, ya", "SEDANG", 12),
                createSoal(levels.get(1), "Jika lampu mati, gelap. Tidak gelap. Maka?", "Kontraposisi", "Lampu tidak mati", "Lampu mati", "Gelap", "Tidak tahu", "A", "Kontraposisi", "SEDANG", 12),
                createSoal(levels.get(1), "Ani lebih tinggi dari Budi. Budi lebih tinggi dari Cici. Siapa tertinggi?", "Urutan", "Ani", "Budi", "Cici", "Sama", "A", "Ani tertinggi", "MUDAH", 12),
                createSoal(levels.get(1), "Jika lapar maka makan. Tidak makan. Maka?", "Logika", "Tidak lapar (kemungkinan)", "Lapar", "Makan", "Kenyang", "A", "Kemungkinan tidak lapar", "MUDAH", 12),
                createSoal(levels.get(1), "Semua siswa rajin. Rudi siswa. Rudi?", "Silogisme", "Rajin", "Malas", "Bukan siswa", "Tidak rajin", "A", "Rajin", "MUDAH", 12),
                createSoal(levels.get(1), "Jika hari Minggu, libur. Hari ini libur. Apakah hari Minggu?", "Fallacy", "Belum tentu", "Pasti Minggu", "Pasti Senin", "Tidak libur", "A", "Affirming consequent - belum tentu", "SULIT", 12),
                createSoal(levels.get(1), "Adi adik Beni, Beni adik Caca. Siapa termuda?", "Urutan", "Adi", "Beni", "Caca", "Tidak tahu", "A", "Adi termuda", "MUDAH", 12)
        ));
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(2), "3 orang duduk berderet. A di tengah, B di kiri A, posisi C?", "Deduksi posisi", "Kanan A", "Kiri B", "Tengah", "Tidak duduk", "A", "C di kanan A", "MUDAH", 12),
                createSoal(levels.get(2), "Jika Andi bukan di posisi 1 dan bukan di akhir (3 orang), Andi di?", "Posisi", "1", "2", "3", "Tidak ada", "B", "Posisi tengah", "MUDAH", 12),
                createSoal(levels.get(2), "4 warna: Merah tidak di ujung, Biru di sebelah Merah. Kemungkinan ujung?", "Logic puzzle", "Biru", "Merah tidak mungkin ujung, jadi Hijau/Kuning", "Merah", "Tidak tahu", "B", "Merah tidak di ujung, jadi ujung warna lain", "SULIT", 12),
                createSoal(levels.get(2), "Teka-teki: Kakek budi punya 3 anak... etc logic sederhana: Siapa anak tengah?", "Tengah", "Anak 1", "Anak 2", "Anak 3", "Tidak ada", "B", "Anak 2", "MUDAH", 12),
                createSoal(levels.get(2), "Jika semua kursi merah di ruang A, kursi biru di ruang B, di mana kursi merah?", "Lokasi", "Ruang A", "Ruang B", "Ruang C", "Semua ruang", "A", "Ruang A", "MUDAH", 12),
                createSoal(levels.get(2), "5 orang antre, Dina di depan Eko, Cici di belakang Dina, urutan depan ke depan: siapa paling depan jika Cici bukan terakhir?", "Antre", "Dina", "Eko", "Cici", "Tidak bisa tentukan", "D", "Info kurang", "SULIT", 12),
                createSoal(levels.get(2), "Jika kotak A > B > C ukuran berat, mana terberat?", "Urutan", "A", "B", "C", "Sama", "A", "A", "MUDAH", 12),
                createSoal(levels.get(2), "3 kunci: hanya satu benar. Kunci A salah, B salah, maka?", "Deduksi", "C benar", "A benar", "B benar", "Semua salah", "A", "C benar", "MUDAH", 12)
        ));
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(3), "Planet terbesar di Tata Surya?", "Sains", "Bumi", "Jupiter", "Mars", "Saturnus", "B", "Jupiter", "MUDAH", 15),
                createSoal(levels.get(3), "Ibu kota Indonesia?", "Geografi", "Jakarta (secara historis, kini Nusantara transisi)", "Bandung", "Surabaya", "Medan", "A", "Jakarta (historis) / Nusantara baru", "MUDAH", 15),
                createSoal(levels.get(3), "H2O adalah rumus?", "Kimia", "Air", "Oksigen", "Hidrogen", "Karbon", "A", "Air", "MUDAH", 15),
                createSoal(levels.get(3), "Penemu lampu?", "Sejarah", "Edison", "Einstein", "Newton", "Tesla", "A", "Edison (pengembangan)", "MUDAH", 15),
                createSoal(levels.get(3), "Proses fotosintesis butuh?", "Bio", "Cahaya matahari", "Air hujan saja", "Tanpa CO2", "Tanpa klorofil", "A", "Cahaya", "MUDAH", 15),
                createSoal(levels.get(3), "Benua terbesar?", "Geografi", "Asia", "Afrika", "Eropa", "Australia", "A", "Asia", "MUDAH", 15),
                createSoal(levels.get(3), "Manakah mamalia?", "Hewan", "Paus", "Hiu", "Lele", "Belut", "A", "Paus mamalia", "SEDANG", 15),
                createSoal(levels.get(3), "Alat ukur suhu?", "Fisika", "Termometer", "Barometer", "Amperemeter", "Voltmeter", "A", "Termometer", "MUDAH", 15)
        ));
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(4), "Pernyataan: 'Semua kucing punya ekor. Kiki punya ekor. Apakah Kiki kucing?'", "Logika", "Belum tentu", "Pasti kucing", "Pasti bukan kucing", "Tidak ada kucing", "A", "Affirming consequent fallacy", "SULIT", 12),
                createSoal(levels.get(4), "Jika P maka Q. Tidak Q. Maka tidak P. Ini sah? (Modus Tollens)", "Validitas", "Sah", "Tidak sah", "Kadang sah", "Tidak bisa tentukan", "A", "Modus Tollens sah", "SEDANG", 12),
                createSoal(levels.get(4), "Pernyataan 'Beberapa A adalah B' negasinya?", "Negasi", "Semua A bukan B", "Semua A adalah B", "Beberapa A bukan B", "Tidak ada A", "A", "Negasi beberapa = semua bukan", "SULIT", 12),
                createSoal(levels.get(4), "Manakah kontradiksi dari 'Semua siswa lulus'?", "Kontradiksi", "Ada siswa tidak lulus", "Semua siswa tidak lulus", "Beberapa siswa lulus", "Tidak ada siswa", "A", "Ada yang tidak lulus", "SEDANG", 12),
                createSoal(levels.get(4), "Jika hari hujan, saya bawa payung. Hari tidak hujan, apakah bawa payung?", "Implikasi", "Belum tentu", "Tidak bawa", "Bawa", "Hujan", "A", "Tidak bisa disimpulkan", "SEDANG", 12),
                createSoal(levels.get(4), "A dan B tidak bisa benar bersama, tapi bisa salah bersama. Hubungan?", "Oposisi", "Kontrari", "Kontradiktori", "Subkontrari", "Implikasi", "A", "Kontrari", "SULIT", 12),
                createSoal(levels.get(4), "'Jika saya rajin, saya pintar' Ekuivalen?", "Ekuivalen", "Jika tidak pintar, tidak rajin", "Jika pintar, rajin", "Jika rajin, tidak pintar", "Jika malas, bodoh", "A", "Kontraposisi ekuivalen", "SULIT", 12),
                createSoal(levels.get(4), "Semua A adalah B, Beberapa B adalah C, maka?", "Silogisme", "Beberapa A mungkin C", "Semua A adalah C", "Tidak ada A adalah C", "Semua C adalah A", "A", "Mungkin", "SULIT", 12)
        ));
        soalRepository.saveAll(Arrays.asList(
                createSoal(levels.get(5), "Lanjutkan: 1,4,9,16,25,... (kuadrat)", "Pola", "30", "36", "35", "40", "B", "6^2=36", "SEDANG", 20),
                createSoal(levels.get(5), "Jika kode A=1, B=2,... Z=26, nilai CAT?", "Kode huruf", "24", "48", "15", "10", "A", "C3+A1+T20=24", "SEDANG", 20),
                createSoal(levels.get(5), "Planet ketiga dari matahari?", "Sains", "Bumi", "Mars", "Venus", "Merkurius", "A", "Bumi", "MUDAH", 20),
                createSoal(levels.get(5), "5+3*2 = ?", "Prioritas operasi", "16", "11", "10", "13", "B", "3*2=6+5=11", "SEDANG", 20),
                createSoal(levels.get(5), "Antonim 'Abstrak'?", "Kata", "Konkret", "Umum", "Khusus", "Nyata (konkret)", "A", "Konkret", "SEDANG", 20),
                createSoal(levels.get(5), "Jika semua A adalah B dan semua B adalah C, maka semua A adalah...?", "Silogisme", "C", "B", "A", "D", "A", "C", "MUDAH", 20),
                createSoal(levels.get(5), "Berapa jumlah sisi pada dodecahedron?", "Geometri", "12", "20", "8", "6", "A", "12", "SULIT", 20),
                createSoal(levels.get(5), "Jika sekarang jam 10:00, 100 jam lagi jam berapa? (24h cycle)", "Modulo", "14:00 (2 PM)", "10:00", "12:00", "16:00", "A", "100 mod24=4, 10+4=14", "SULIT", 20)
        ));
    }

    private Soal createSoal(Level level, String pertanyaan, String pembahasanClarify, String opsiA, String opsiB, String opsiC, String opsiD, String jawabanBenar, String pembahasan, String tingkat, int xp) {
        return Soal.builder()
                .level(level)
                .pertanyaan(pertanyaan)
                .tipeSoal(Soal.TipeSoal.PILIHAN_GANDA)
                .opsiA(opsiA).opsiB(opsiB).opsiC(opsiC).opsiD(opsiD)
                .jawabanBenar(jawabanBenar)
                .pembahasan(pembahasan + " - " + pembahasanClarify)
                .tingkatKesulitan(tingkat)
                .xpPoint(xp)
                .build();
    }
}
