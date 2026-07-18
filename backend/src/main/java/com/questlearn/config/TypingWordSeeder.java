package com.questlearn.config;

import com.questlearn.entity.*;
import com.questlearn.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(2)
public class TypingWordSeeder implements CommandLineRunner {

    @Autowired TypingWordRepository typingWordRepository;
    @Autowired DuniaRepository duniaRepository;

    @Override
    public void run(String... args) throws Exception {
        if (typingWordRepository.count() > 0) return;

        System.out.println("=== SEEDING TYPING WORDS ===");

        Dunia inggris = duniaRepository.findBySlug("bahasa-inggris").orElse(null);
        Dunia mtk = duniaRepository.findBySlug("matematika-dasar").orElse(null);
        Dunia logika = duniaRepository.findBySlug("logika-pengetahuan-umum").orElse(null);

        if (inggris == null || mtk == null || logika == null) {
            System.out.println("WARNING: Dunia belum tersedia, skip typing word seed.");
            return;
        }

        // === ENGLISH VILLAGE ===
        seedEnglishWords(inggris);
        seedMathWords(mtk);
        seedLogicWords(logika);

        System.out.println("Typing words seeded: " + typingWordRepository.count());
    }

    private void seedEnglishWords(Dunia dunia) {
        List<TypingWord> words = new ArrayList<>();

        // EASY: 3-5 huruf
        for (String w : Arrays.asList("book", "home", "light", "apple", "water", "house", "table", "chair",
                "door", "bird", "fish", "tree", "star", "moon", "rain", "snow", "fire", "wind", "song", "dance",
                "read", "walk", "talk", "play", "sing", "jump", "run", "eat", "drink", "sleep")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.EASY));
        }

        // MEDIUM: 5-8 huruf, frasa pendek
        for (String w : Arrays.asList("sunrise", "village life", "green forest", "blue ocean", "bright star",
                "happy day", "big house", "small cat", "old tree", "new book", "read book", "walk home",
                "good morning", "good night", "thank you", "see you", "come here", "go there", "sit down",
                "stand up", "open door", "close window", "turn left", "turn right", "go straight")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.MEDIUM));
        }

        // HARD: kalimat pendek
        for (String w : Arrays.asList("The quiet village woke up.", "A gentle breeze blew through the trees.",
                "She opened the old wooden door.", "He walked along the dusty road.", "The stars shone brightly above.",
                "Children played in the meadow.", "The farmer tended his crops.", "Birds sang in the morning light.",
                "The river flowed past the village.", "An old man sat on the porch.",
                "If you try hard, you will succeed.", "The more you read, the more you learn.",
                "Practice makes perfect every day.", "Never give up on your dreams.",
                "What is the meaning of this word?")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.HARD));
        }

        typingWordRepository.saveAll(words);
    }

    private void seedMathWords(Dunia dunia) {
        List<TypingWord> words = new ArrayList<>();

        // EASY
        for (String w : Arrays.asList("zero", "plus", "minus", "times", "divide", "equals", "seven", "twelve",
                "twenty", "fifty", "hundred", "count", "math", "sum", "half", "double", "three", "eight",
                "nine", "four", "five", "six", "eleven", "fifteen", "thirty", "sixty", "eighty", "ninety",
                "twelve", "ten")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.EASY));
        }

        // MEDIUM: ekspresi numerik & istilah
        for (String w : Arrays.asList("y = mx + b", "x + 5 = 12", "2x = 10", "a + b = c", "pi r squared",
                "nine minus four", "six times seven", "twenty plus eight", "one hundred divided by five",
                "three squared", "square root", "fifteen percent", "forty two", "average", "median")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.MEDIUM));
        }

        // HARD: persamaan & kalimat matematika
        for (String w : Arrays.asList("2x + 10 = 24, solve for x", "x squared plus y squared equals z squared",
                "the derivative of x squared is 2x", "sin squared theta plus cos squared theta equals one",
                "if x equals five then y equals ten", "the area of a circle is pi times r squared",
                "one plus two times three equals seven", "the square root of 144 is twelve",
                "e equals m c squared", "log base 10 of 100 equals 2")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.HARD));
        }

        typingWordRepository.saveAll(words);
    }

    private void seedLogicWords(Dunia dunia) {
        List<TypingWord> words = new ArrayList<>();

        // EASY
        for (String w : Arrays.asList("maze", "rune", "owl", "key", "map", "gate", "code", "hint",
                "clue", "path", "door", "lock", "ring", "gem", "orb", "seal", "trap", "puzzle",
                "logic", "truth", "false", "test", "solve", "think", "brain", "smart", "proof", "find",
                "rule", "order")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.EASY));
        }

        // MEDIUM
        for (String w : Arrays.asList("deduce the pattern", "solve the riddle", "find the answer",
                "think carefully", "follow the clues", "unlock the gate", "light the torch",
                "cross the bridge", "open the chest", "read the map", "if A then B",
                "not B therefore", "all men are mortal", "Socrates is a man", "cause and effect")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.MEDIUM));
        }

        // HARD
        for (String w : Arrays.asList("If A then B, not B, so not A.", "All humans are mortal. Socrates is human.",
                "Every effect has a cause.", "The only true wisdom is in knowing you know nothing.",
                "I think therefore I am.", "What can be asserted without evidence can be dismissed without evidence.",
                "The map is not the territory.", "If you can not explain it simply you do not understand it well.",
                "It does not matter how slowly you go as long as you do not stop.",
                "Simple can be harder than complex.")) {
            words.add(createWord(dunia, w, TypingWord.LevelKesulitan.HARD));
        }

        typingWordRepository.saveAll(words);
    }

    private TypingWord createWord(Dunia dunia, String teks, TypingWord.LevelKesulitan level) {
        return TypingWord.builder()
                .dunia(dunia)
                .teks(teks)
                .levelKesulitan(level)
                .build();
    }
}
