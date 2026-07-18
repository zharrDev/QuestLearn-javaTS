package com.questlearn.service.impl;

import com.questlearn.dto.request.SubmitTypingRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.*;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.*;
import com.questlearn.service.BadgeService;
import com.questlearn.service.TypingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TypingServiceImpl implements TypingService {

    @Autowired TypingWordRepository typingWordRepository;
    @Autowired TypingSessionRepository sessionRepository;
    @Autowired UserRepository userRepository;
    @Autowired DuniaRepository duniaRepository;
    @Autowired BadgeService badgeService;

    @Override
    public TypingStartResponse startSession(Long userId, Long duniaId, String level) {
        Dunia dunia = duniaRepository.findById(duniaId)
                .orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));

        TypingWord.LevelKesulitan kesulitan = TypingWord.LevelKesulitan.valueOf(level.toUpperCase());
        List<TypingWord> words = typingWordRepository.findByDuniaIdAndLevelKesulitanAndIsActiveTrue(duniaId, kesulitan);

        if (words.isEmpty()) {
            throw new ResourceNotFoundException("Tidak ada kata untuk level ini");
        }

        // Shuffle and pick up to 30 words
        Collections.shuffle(words);
        List<String> selectedWords = words.stream()
                .limit(30)
                .map(TypingWord::getTeks)
                .collect(Collectors.toList());

        return TypingStartResponse.builder()
                .sessionId(System.currentTimeMillis()) // temp client-side session id
                .words(selectedWords)
                .totalWords(selectedWords.size())
                .level(level)
                .duniaNama(dunia.getNama())
                .duniaId(duniaId)
                .build();
    }

    @Override
    public TypingSessionResponse submitSession(Long userId, SubmitTypingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        Dunia dunia = duniaRepository.findById(request.getDuniaId())
                .orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));

        // Calculate XP
        int xp = calculateXp(request);

        TypingSession session = TypingSession.builder()
                .user(user)
                .dunia(dunia)
                .level(request.getLevel())
                .skor(request.getSkor())
                .wpm(request.getWpm())
                .akurasi(request.getAkurasi())
                .comboTerpanjang(request.getComboTerpanjang())
                .totalMusuhKalah(request.getTotalMusuhKalah())
                .totalMusuhLolos(request.getTotalMusuhLolos())
                .xpDidapat(xp)
                .waktuMulai(LocalDateTime.now().minusSeconds(request.getWaktuMillis() / 1000))
                .waktuSelesai(LocalDateTime.now())
                .build();
        session = sessionRepository.save(session);

        // Update user XP
        user.setTotalXp((user.getTotalXp() != null ? user.getTotalXp() : 0) + xp);

        // Update streak
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastActiveDate();
        if (last == null || !last.equals(today)) {
            if (last != null && last.equals(today.minusDays(1))) {
                user.setCurrentStreak((user.getCurrentStreak() != null ? user.getCurrentStreak() : 0) + 1);
            } else if (last == null || !last.equals(today)) {
                if (last == null || !last.equals(today.minusDays(1))) {
                    if (last == null || !last.equals(today)) {
                        if (last != null && !last.equals(today.minusDays(1))) {
                            user.setCurrentStreak(1);
                        } else if (last == null) {
                            user.setCurrentStreak(1);
                        }
                    }
                }
            }
            user.setLastActiveDate(today);
            if (user.getCurrentStreak() > (user.getLongestStreak() != null ? user.getLongestStreak() : 0)) {
                user.setLongestStreak(user.getCurrentStreak());
            }
        }
        userRepository.save(user);

        // Check badges
        badgeService.checkAndUnlockBadges(userId);

        return toResponse(session);
    }

    @Override
    public List<TypingSessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaderboardEntry> getLeaderboard(String level) {
        List<TypingSession> sessions;
        if (level != null && !level.isEmpty()) {
            sessions = sessionRepository.findTop20ByOrderByWpmDesc().stream()
                    .filter(s -> s.getLevel().equalsIgnoreCase(level))
                    .limit(20)
                    .collect(Collectors.toList());
        } else {
            sessions = sessionRepository.findTop20ByOrderByWpmDesc();
        }

        List<LeaderboardEntry> result = new ArrayList<>();
        int rank = 1;
        for (TypingSession s : sessions) {
            result.add(LeaderboardEntry.builder()
                    .userId(s.getUser().getId())
                    .nama(s.getUser().getNama())
                    .avatarUrl(s.getUser().getAvatarUrl())
                    .totalXp(s.getXpDidapat())
                    .rank(rank++)
                    .build());
        }
        return result;
    }

    private int calculateXp(SubmitTypingRequest req) {
        int base = req.getTotalMusuhKalah() * 10;
        int wpmBonus = (int) (req.getWpm() != null ? req.getWpm() * 2 : 0);
        int accuracyBonus = (int) (req.getAkurasi() != null && req.getAkurasi() >= 90 ? 20 : req.getAkurasi() != null && req.getAkurasi() >= 75 ? 10 : 0);
        int comboBonus = (req.getComboTerpanjang() != null ? req.getComboTerpanjang() : 0) * 2;
        int levelMultiplier;
        switch (req.getLevel().toUpperCase()) {
            case "HARD": levelMultiplier = 3; break;
            case "MEDIUM": levelMultiplier = 2; break;
            default: levelMultiplier = 1;
        }
        return (base + wpmBonus + accuracyBonus + comboBonus) * levelMultiplier;
    }

    private TypingSessionResponse toResponse(TypingSession s) {
        return TypingSessionResponse.builder()
                .id(s.getId())
                .duniaId(s.getDunia().getId())
                .duniaNama(s.getDunia().getNama())
                .level(s.getLevel())
                .skor(s.getSkor())
                .wpm(s.getWpm())
                .akurasi(s.getAkurasi())
                .comboTerpanjang(s.getComboTerpanjang())
                .totalMusuhKalah(s.getTotalMusuhKalah())
                .totalMusuhLolos(s.getTotalMusuhLolos())
                .xpDidapat(s.getXpDidapat())
                .waktuMulai(s.getWaktuMulai())
                .waktuSelesai(s.getWaktuSelesai())
                .build();
    }
}
