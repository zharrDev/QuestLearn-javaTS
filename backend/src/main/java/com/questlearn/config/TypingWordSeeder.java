package com.questlearn.config;

import com.questlearn.entity.*;
import com.questlearn.repository.*;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.Priority;
import jakarta.enterprise.event.Observes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Word banks for the typing arena. One bank per language world, split into the
 * three difficulty tiers used by the client.
 */
@Component
public class TypingWordSeeder {

    @Autowired TypingWordRepository typingWordRepository;
    @Autowired DuniaRepository duniaRepository;

    void onStart(@Observes @Priority(2000) StartupEvent ev) {
        System.out.println("=== ENSURING TYPING WORDS ===");

        seed("bahasa-inggris", englishEasy(), englishMedium(), englishHard());
        seed("bahasa-indonesia", indonesianEasy(), indonesianMedium(), indonesianHard());
        seed("bahasa-spanyol", spanishEasy(), spanishMedium(), spanishHard());
        seed("bahasa-prancis", frenchEasy(), frenchMedium(), frenchHard());
        seed("bahasa-jerman", germanEasy(), germanMedium(), germanHard());
        seed("bahasa-portugis", portugueseEasy(), portugueseMedium(), portugueseHard());

        System.out.println("Typing words available: " + typingWordRepository.count());
    }

    /** Adds a world's bank only when that world has no active words yet. */
    private void seed(String slug, List<String> easy, List<String> medium, List<String> hard) {
        Dunia dunia = duniaRepository.findBySlug(slug).orElse(null);
        if (dunia == null) {
            System.out.println("WARNING: dunia " + slug + " tidak ada, skip.");
            return;
        }
        if (typingWordRepository.countByDuniaIdAndIsActiveTrue(dunia.getId()) > 0) {
            return;
        }
        List<TypingWord> words = new ArrayList<>();
        for (String text : easy) words.add(word(dunia, text, TypingWord.LevelKesulitan.EASY));
        for (String text : medium) words.add(word(dunia, text, TypingWord.LevelKesulitan.MEDIUM));
        for (String text : hard) words.add(word(dunia, text, TypingWord.LevelKesulitan.HARD));
        typingWordRepository.saveAll(words);
    }

    private TypingWord word(Dunia dunia, String text, TypingWord.LevelKesulitan level) {
        return TypingWord.builder().dunia(dunia).teks(text).levelKesulitan(level).build();
    }

    /* ---------------------------- English ---------------------------- */
    private List<String> englishEasy() {
        return Arrays.asList("book", "home", "light", "apple", "water", "house", "table", "chair",
                "door", "bird", "fish", "tree", "star", "moon", "rain", "snow", "fire", "wind",
                "song", "dance", "read", "walk", "talk", "play", "sing", "jump", "run", "eat",
                "drink", "sleep");
    }

    private List<String> englishMedium() {
        return Arrays.asList("sunrise", "village life", "green forest", "blue ocean", "bright star",
                "happy day", "big house", "small cat", "old tree", "new book", "good morning",
                "good night", "thank you", "see you", "come here", "go there", "sit down",
                "stand up", "open door", "close window", "turn left", "turn right", "go straight",
                "sweet dreams", "take care");
    }

    private List<String> englishHard() {
        return Arrays.asList("The quiet village woke up.", "A gentle breeze blew through the trees.",
                "She opened the old wooden door.", "He walked along the dusty road.",
                "The stars shone brightly above.", "Children played in the meadow.",
                "The farmer tended his crops.", "Birds sang in the morning light.",
                "The river flowed past the village.", "An old man sat on the porch.",
                "If you try hard, you will succeed.", "The more you read, the more you learn.",
                "Practice makes perfect every day.", "Never give up on your dreams.",
                "What is the meaning of this word?");
    }

    /* --------------------------- Indonesian -------------------------- */
    private List<String> indonesianEasy() {
        return Arrays.asList("buku", "rumah", "lampu", "apel", "air", "meja", "kursi", "pintu",
                "burung", "ikan", "pohon", "bulan", "hujan", "salju", "api", "angin", "lagu",
                "tari", "baca", "jalan", "bicara", "main", "nyanyi", "lompat", "lari", "makan",
                "minum", "tidur", "pagi", "malam");
    }

    private List<String> indonesianMedium() {
        return Arrays.asList("matahari terbit", "sawah hijau", "laut biru", "bintang terang",
                "hari bahagia", "rumah besar", "kucing kecil", "pohon tua", "buku baru",
                "selamat pagi", "selamat malam", "terima kasih", "sampai jumpa", "kemari",
                "ke sana", "duduk", "berdiri", "buka pintu", "tutup jendela", "belok kiri",
                "belok kanan", "jalan lurus", "hati-hati", "mimpi indah");
    }

    private List<String> indonesianHard() {
        return Arrays.asList("Desa yang tenang mulai terbangun.",
                "Angin pagi berhembus lembut di antara pohon.",
                "Dia membuka pintu kayu tua itu.",
                "Anak-anak bermain di lapangan desa.",
                "Bintang-bintang bersinar terang di langit.",
                "Ibu memasak nasi di dapur.",
                "Kami belajar mengetik setiap hari.",
                "Jangan pernah menyerah pada mimpimu.",
                "Latihan membuat kita semakin cepat.",
                "Setiap pagi adalah awal yang baru.",
                "Air sungai mengalir menuju laut.",
                "Petani merawat sawahnya dengan sabar.",
                "Buku adalah jendela dunia.",
                "Belajar bahasa membuka banyak pintu.",
                "Teruslah mencoba sampai berhasil.");
    }

    /* ---------------------------- Spanish ---------------------------- */
    private List<String> spanishEasy() {
        return Arrays.asList("libro", "casa", "luz", "agua", "mesa", "silla", "puerta", "pájaro",
                "pez", "árbol", "luna", "lluvia", "nieve", "fuego", "viento", "canción",
                "bailar", "leer", "caminar", "hablar", "jugar", "cantar", "saltar", "correr",
                "comer", "beber", "dormir", "sol", "mar", "flor");
    }

    private List<String> spanishMedium() {
        return Arrays.asList("amanecer", "vida del pueblo", "bosque verde", "océano azul",
                "estrella brillante", "día feliz", "casa grande", "gato pequeño", "árbol viejo",
                "libro nuevo", "buenos días", "buenas noches", "gracias", "hasta luego",
                "ven aquí", "ve allá", "siéntate", "levántate", "abre la puerta",
                "cierra la ventana", "gira a la izquierda", "gira a la derecha", "sigue recto",
                "ten cuidado", "dulces sueños");
    }

    private List<String> spanishHard() {
        return Arrays.asList("El pueblo tranquilo despertó.",
                "Una brisa suave soplaba entre los árboles.",
                "Ella abrió la vieja puerta de madera.",
                "Los niños jugaban en el prado.",
                "Las estrellas brillaban en el cielo.",
                "Mi madre cocina en la cocina.",
                "Aprendemos a escribir cada día.",
                "Nunca dejes de perseguir tus sueños.",
                "La práctica te hace más rápido.",
                "Cada mañana es un nuevo comienzo.",
                "El río fluye hacia el mar.",
                "El libro es una ventana al mundo.",
                "Aprender idiomas abre muchas puertas.",
                "Sigue intentándolo hasta lograrlo.",
                "La paciencia es una virtud.");
    }

    /* ---------------------------- French ----------------------------- */
    private List<String> frenchEasy() {
        return Arrays.asList("livre", "maison", "lumière", "pomme", "eau", "table", "chaise",
                "porte", "oiseau", "poisson", "arbre", "lune", "pluie", "neige", "feu", "vent",
                "chanson", "danser", "lire", "marcher", "parler", "jouer", "chanter", "sauter",
                "courir", "manger", "boire", "dormir", "soleil", "mer");
    }

    private List<String> frenchMedium() {
        return Arrays.asList("lever du soleil", "vie du village", "forêt verte", "océan bleu",
                "étoile brillante", "journée heureuse", "grande maison", "petit chat",
                "vieil arbre", "livre neuf", "bonjour", "bonne nuit", "merci", "à bientôt",
                "viens ici", "va là-bas", "assieds-toi", "lève-toi", "ouvre la porte",
                "ferme la fenêtre", "tourne à gauche", "tourne à droite", "tout droit",
                "fais attention", "doux rêves");
    }

    private List<String> frenchHard() {
        return Arrays.asList("Le village tranquille s'est réveillé.",
                "Une brise légère soufflait dans les arbres.",
                "Elle a ouvert la vieille porte en bois.",
                "Les enfants jouaient dans la prairie.",
                "Les étoiles brillaient dans le ciel.",
                "Ma mère cuisine dans la cuisine.",
                "Nous apprenons à écrire chaque jour.",
                "N'abandonne jamais tes rêves.",
                "La pratique rend plus rapide.",
                "Chaque matin est un nouveau départ.",
                "La rivière coule vers la mer.",
                "Le livre est une fenêtre sur le monde.",
                "Apprendre les langues ouvre des portes.",
                "Continue d'essayer jusqu'à réussir.",
                "La patience est une vertu.");
    }

    /* ---------------------------- German ----------------------------- */
    private List<String> germanEasy() {
        return Arrays.asList("Buch", "Haus", "Licht", "Apfel", "Wasser", "Tisch", "Stuhl", "Tür",
                "Vogel", "Fisch", "Baum", "Mond", "Regen", "Schnee", "Feuer", "Wind", "Lied",
                "tanzen", "lesen", "gehen", "sprechen", "spielen", "singen", "springen",
                "laufen", "essen", "trinken", "schlafen", "Sonne", "Meer");
    }

    private List<String> germanMedium() {
        return Arrays.asList("Sonnenaufgang", "Dorfleben", "grüner Wald", "blaues Meer",
                "heller Stern", "schöner Tag", "grosses Haus", "kleine Katze", "alter Baum",
                "neues Buch", "guten Morgen", "gute Nacht", "danke schön", "bis bald",
                "komm her", "geh dorthin", "setz dich", "steh auf", "öffne die Tür",
                "mach das Fenster zu", "links abbiegen", "rechts abbiegen", "geradeaus",
                "sei vorsichtig", "schöne Träume");
    }

    private List<String> germanHard() {
        return Arrays.asList("Das stille Dorf erwachte.",
                "Ein sanfter Wind wehte durch die Bäume.",
                "Sie öffnete die alte Holztür.",
                "Die Kinder spielten auf der Wiese.",
                "Die Sterne leuchteten am Himmel.",
                "Meine Mutter kocht in der Küche.",
                "Wir lernen jeden Tag zu tippen.",
                "Gib deine Träume niemals auf.",
                "Übung macht uns immer schneller.",
                "Jeder Morgen ist ein neuer Anfang.",
                "Der Fluss ist tief und klar.",
                "Ein Buch ist ein Fenster zur Welt.",
                "Sprachen lernen öffnet viele Türen.",
                "Versuch es weiter, bis du es schaffst.",
                "Geduld ist eine Tugend.");
    }

    /* --------------------------- Portuguese -------------------------- */
    private List<String> portugueseEasy() {
        return Arrays.asList("livro", "casa", "luz", "maçã", "água", "mesa", "cadeira", "porta",
                "pássaro", "peixe", "árvore", "lua", "chuva", "neve", "fogo", "vento",
                "canção", "dançar", "ler", "andar", "falar", "jogar", "cantar", "pular",
                "correr", "comer", "beber", "dormir", "sol", "mar");
    }

    private List<String> portugueseMedium() {
        return Arrays.asList("nascer do sol", "vida na aldeia", "floresta verde", "oceano azul",
                "estrela brilhante", "dia feliz", "casa grande", "gato pequeno", "árvore velha",
                "livro novo", "bom dia", "boa noite", "obrigado", "até logo", "venha aqui",
                "vá lá", "sente-se", "levante-se", "abra a porta", "feche a janela",
                "vire à esquerda", "vire à direita", "siga em frente", "cuidado", "bons sonhos");
    }

    private List<String> portugueseHard() {
        return Arrays.asList("A aldeia tranquila acordou.",
                "Uma brisa suave soprava entre as árvores.",
                "Ela abriu a velha porta de madeira.",
                "As crianças brincavam no campo.",
                "As estrelas brilhavam no céu.",
                "Minha mãe cozinha na cozinha.",
                "Aprendemos a digitar todos os dias.",
                "Nunca desista dos seus sonhos.",
                "A prática nos deixa mais rápidos.",
                "Cada manhã é um novo começo.",
                "O rio corre para o mar.",
                "O livro é uma janela para o mundo.",
                "Aprender idiomas abre muitas portas.",
                "Continue tentando até conseguir.",
                "A paciência é uma virtude.");
    }
}
