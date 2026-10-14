
package com.questlearn.service.impl;

import com.questlearn.dto.request.SubmitQuestRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.*;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.*;
import com.questlearn.service.BadgeService;
import com.questlearn.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressServiceImpl implements ProgressService {

    @Autowired ProgressUserRepository progressRepository;
    @Autowired JawabanDetailRepository jawabanDetailRepository;
    @Autowired UserRepository userRepository;
    @Autowired LevelRepository levelRepository;
    @Autowired SoalRepository soalRepository;
    @Autowired BadgeService badgeService;
    @Autowired UserBadgeRepository userBadgeRepository;
    @Autowired com.questlearn.service.TypingService typingService;

    @Override
    public PaginatedResponse<ProgressResponse> getUserProgress(Long userId, Pageable pageable) {
        Page<ProgressUser> page = progressRepository.findByUserId(userId, pageable);
        List<ProgressResponse> content = page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return PaginatedResponse.<ProgressResponse>builder()
                .content(content).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    @Override
    public ProgressResponse submitQuest(Long userId, SubmitQuestRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        Level level = levelRepository.findById(request.getLevelId()).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));

        Map<Long, Soal> soalMap = soalRepository.findByLevelId(level.getId()).stream()
                .collect(Collectors.toMap(Soal::getId, s->s));

        int benar = 0;
        int totalXp = 0;
        List<JawabanDetail> details = new ArrayList<>();

        for (SubmitQuestRequest.JawabanItem item : request.getJawaban()) {
            Soal soal = soalMap.get(item.getSoalId());
            if (soal == null) continue;
            boolean isBenar = soal.getJawabanBenar().equalsIgnoreCase(item.getJawabanUser().trim());
            if (isBenar) {
                benar++;
                totalXp += soal.getXpPoint() != null ? soal.getXpPoint() : 10;
            }
            JawabanDetail d = JawabanDetail.builder()
                    .soal(soal)
                    .jawabanUser(item.getJawabanUser())
                    .isBenar(isBenar)
                    .xpDidapat(isBenar ? (soal.getXpPoint()!=null?soal.getXpPoint():10) : 0)
                    .build();
            details.add(d);
        }

        int totalSoal = soalMap.size();
        int skor = totalSoal==0?0:(int)Math.round((double)benar/totalSoal*100);
        boolean lulus = skor >= (level.getMinScoreLulus()!=null?level.getMinScoreLulus():70);
        if (lulus) totalXp += level.getXpReward()!=null?level.getXpReward():0;

        ProgressUser progress = progressRepository.findByUserIdAndLevelId(userId, level.getId()).orElse(null);
        int attempt = 1;
        if (progress != null) {
            attempt = progress.getPercobaanKe() + 1;
            // clear old details if not lulus previously? we keep history but overwrite for simplicity
            jawabanDetailRepository.deleteAll(progress.getJawabanDetails());
            progress.getJawabanDetails().clear();
        } else {
            progress = ProgressUser.builder().user(user).level(level).waktuMulai(LocalDateTime.now()).build();
        }

        progress.setSkor(skor);
        progress.setTotalSoal(totalSoal);
        progress.setJawabanBenar(benar);
        progress.setIsLulus(lulus);
        progress.setPercobaanKe(attempt);
        progress.setXpDidapat(lulus? totalXp : 0); // only give XP if lulus? or partial? We'll give partial even if fail? For motivation, give totalXp even if fail but bonus only if lulus. Let's adjust: totalXp already includes bonus, so if not lulus, xp = benar*10
        if (!lulus) {
            // xp only from correct answers
            int xpPartial = details.stream().mapToInt(d-> d.getXpDidapat()).sum();
            progress.setXpDidapat(xpPartial);
            totalXp = xpPartial;
        }
        progress.setWaktuSelesai(LocalDateTime.now());

        // bind details
        for (JawabanDetail d : details) d.setProgress(progress);
        progress.setJawabanDetails(details);

        progress = progressRepository.save(progress);

        // update user XP and streak
        if (lulus || benar>0) {
            user.setTotalXp((user.getTotalXp()!=null?user.getTotalXp():0) + totalXp);
            // streak logic
            LocalDate today = LocalDate.now();
            LocalDate last = user.getLastActiveDate();
            if (last == null || !last.equals(today)) {
                if (last != null && last.equals(today.minusDays(1))) {
                    user.setCurrentStreak((user.getCurrentStreak()!=null?user.getCurrentStreak():0)+1);
                } else if (last == null || !last.equals(today)) {
                    // if last is not yesterday, reset to 1 if not today
                    if (last == null || !last.equals(today.minusDays(1))) {
                        // check if not already counted today
                        if (last == null || !last.equals(today)) {
                            // if gap >1 day, reset
                            if (last != null && !last.equals(today.minusDays(1))) {
                                user.setCurrentStreak(1);
                            } else if (last == null) {
                                user.setCurrentStreak(1);
                            }
                        }
                    }
                }
                user.setLastActiveDate(today);
                if (user.getCurrentStreak() > (user.getLongestStreak()!=null?user.getLongestStreak():0)) {
                    user.setLongestStreak(user.getCurrentStreak());
                }
            }
            userRepository.save(user);
        }

        // check badges
        badgeService.checkAndUnlockBadges(userId);

        return toResponse(progress);
    }

    @Override
    public DashboardResponse getDashboard(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        List<ProgressUser> lulus = progressRepository.findLulusByUserId(userId);
        long totalLevels = levelRepository.count();
        List<Level> nextLevels = new ArrayList<>();
        // find incomplete levels where previous completed
        Map<Long, List<Level>> byDunia = levelRepository.findAll().stream().collect(Collectors.groupingBy(l->l.getDunia().getId()));
        Set<Long> completedIds = lulus.stream().map(p->p.getLevel().getId()).collect(Collectors.toSet());
        for (Map.Entry<Long, List<Level>> e : byDunia.entrySet()) {
            List<Level> sorted = e.getValue().stream().sorted(Comparator.comparing(Level::getUrutan)).collect(Collectors.toList());
            for (int i=0;i<sorted.size();i++) {
                Level lvl = sorted.get(i);
                if (!completedIds.contains(lvl.getId())) {
                    boolean first = i==0;
                    boolean prevDone = i>0 && completedIds.contains(sorted.get(i-1).getId());
                    if (first || prevDone) {
                        nextLevels.add(lvl);
                        if (nextLevels.size()>=3) break;
                    }
                }
            }
        }

        List<LevelResponse> continueLearning = nextLevels.stream().map(l -> LevelResponse.builder()
                .id(l.getId()).duniaId(l.getDunia().getId()).duniaNama(l.getDunia().getNama())
                .nama(l.getNama()).urutan(l.getUrutan()).isBossLevel(l.getIsBossLevel())
                .totalSoal((int)soalRepository.countByLevelId(l.getId()))
                .build()).collect(Collectors.toList());

        List<BadgeResponse> recentBadges = userBadgeRepository.findByUserId(userId).stream()
                .sorted((a,b)-> b.getEarnedAt().compareTo(a.getEarnedAt()))
                .limit(3).map(ub -> BadgeResponse.builder()
                        .id(ub.getBadge().getId()).nama(ub.getBadge().getNama())
                        .kode(ub.getBadge().getKode()).warna(ub.getBadge().getWarna())
                        .earned(true).earnedAt(ub.getEarnedAt()).build())
                .collect(Collectors.toList());

        List<LeaderboardEntry> leaderboard = getLeaderboard("weekly").stream().limit(5).collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalXp(user.getTotalXp()).currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .completedLevels(lulus.size()).totalLevels((int)totalLevels)
                .totalBadges(userBadgeRepository.findByUserId(userId).size())
                .continueLearning(continueLearning)
                .recentBadges(recentBadges)
                .leaderboardWeekly(leaderboard)
                .build();
    }

    @Override
    public List<LeaderboardEntry> getLeaderboard(String period) {
        // The leaderboard metric is typing WPM, so it shares the typing ranking.
        // `period` is ignored (as before) until time-windowed ranking is implemented.
        return typingService.getLeaderboard(null);
    }

    private ProgressResponse toResponse(ProgressUser p) {
        List<ProgressResponse.JawabanDetailResponse> details = null;
        if (p.getJawabanDetails()!=null) {
            details = p.getJawabanDetails().stream().map(d -> ProgressResponse.JawabanDetailResponse.builder()
                    .soalId(d.getSoal().getId())
                    .pertanyaan(d.getSoal().getPertanyaan())
                    .jawabanUser(d.getJawabanUser())
                    .jawabanBenar(d.getSoal().getJawabanBenar())
                    .isBenar(d.getIsBenar())
                    .pembahasan(d.getSoal().getPembahasan())
                    .build()).collect(Collectors.toList());
        }
        return ProgressResponse.builder()
                .id(p.getId()).levelId(p.getLevel().getId()).levelNama(p.getLevel().getNama())
                .duniaNama(p.getLevel().getDunia()!=null? p.getLevel().getDunia().getNama():null)
                .skor(p.getSkor()).totalSoal(p.getTotalSoal()).jawabanBenar(p.getJawabanBenar())
                .isLulus(p.getIsLulus()).percobaanKe(p.getPercobaanKe()).xpDidapat(p.getXpDidapat())
                .waktuMulai(p.getWaktuMulai()).waktuSelesai(p.getWaktuSelesai())
                .jawabanDetails(details)
                .build();
    }
}
