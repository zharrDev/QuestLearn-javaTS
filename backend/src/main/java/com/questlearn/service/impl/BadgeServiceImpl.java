
package com.questlearn.service.impl;

import com.questlearn.dto.request.BadgeRequest;
import com.questlearn.dto.response.BadgeResponse;
import com.questlearn.dto.response.PaginatedResponse;
import com.questlearn.entity.*;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.*;
import com.questlearn.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeServiceImpl implements BadgeService {

    @Autowired BadgeRepository badgeRepository;
    @Autowired UserBadgeRepository userBadgeRepository;
    @Autowired UserRepository userRepository;
    @Autowired ProgressUserRepository progressRepository;
    @Autowired TypingSessionRepository typingSessionRepository;

    @Override
    public PaginatedResponse<BadgeResponse> getAll(String search, Pageable pageable) {
        Page<Badge> page = badgeRepository.findWithFilter(search, pageable);
        List<BadgeResponse> content = page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return PaginatedResponse.<BadgeResponse>builder()
                .content(content).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    @Override
    public BadgeResponse getById(Long id) {
        Badge b = badgeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Badge tidak ditemukan"));
        return toResponse(b);
    }

    @Override
    public BadgeResponse create(BadgeRequest req) {
        Badge b = Badge.builder()
                .nama(req.getNama()).kode(req.getKode()).deskripsi(req.getDeskripsi())
                .warna(req.getWarna()!=null?req.getWarna():"#E8A93B")
                .syaratType(req.getSyaratType()).syaratValue(req.getSyaratValue())
                .xpBonus(req.getXpBonus()!=null?req.getXpBonus():0)
                .build();
        return toResponse(badgeRepository.save(b));
    }

    @Override
    public BadgeResponse update(Long id, BadgeRequest req) {
        Badge b = badgeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Badge tidak ditemukan"));
        b.setNama(req.getNama()); b.setKode(req.getKode()); b.setDeskripsi(req.getDeskripsi());
        if (req.getWarna()!=null) b.setWarna(req.getWarna());
        b.setSyaratType(req.getSyaratType()); b.setSyaratValue(req.getSyaratValue());
        if (req.getXpBonus()!=null) b.setXpBonus(req.getXpBonus());
        return toResponse(badgeRepository.save(b));
    }

    @Override
    public void delete(Long id) {
        Badge b = badgeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Badge tidak ditemukan"));
        badgeRepository.delete(b);
    }

    @Override
    public List<BadgeResponse> getUserBadges(Long userId) {
        List<Badge> all = badgeRepository.findAll();
        List<UserBadge> earned = userBadgeRepository.findByUserId(userId);
        java.util.Map<Long, UserBadge> map = earned.stream().collect(Collectors.toMap(ub->ub.getBadge().getId(), ub->ub));
        return all.stream().map(b -> {
            BadgeResponse r = toResponse(b);
            if (map.containsKey(b.getId())) {
                r.setEarned(true);
                r.setEarnedAt(map.get(b.getId()).getEarnedAt());
            } else {
                r.setEarned(false);
            }
            return r;
        }).collect(Collectors.toList());
    }

    @Override
    public void checkAndUnlockBadges(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        List<Badge> badges = badgeRepository.findAll();
        List<ProgressUser> lulus = progressRepository.findLulusByUserId(userId);

        for (Badge badge : badges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) continue;
            boolean unlock = false;
            String type = badge.getSyaratType();
            Integer val = badge.getSyaratValue();
            if (type == null) continue;
            switch (type) {
                case "XP":
                    if (user.getTotalXp()!=null && user.getTotalXp() >= val) unlock = true;
                    break;
                case "STREAK":
                    if (user.getCurrentStreak()!=null && user.getCurrentStreak() >= val) unlock = true;
                    break;
                case "LEVEL_COMPLETE":
                    if (lulus.size() >= val) unlock = true;
                    break;
                case "FIRST_LEVEL":
                    if (!lulus.isEmpty()) unlock = true;
                    break;
                case "PERFECT_SCORE":
                    if (lulus.stream().anyMatch(p->p.getSkor()!=null && p.getSkor()==100)) unlock = true;
                    break;
                case "WPM":
                    if (typingSessionRepository.findBestWpmByUserId(userId).orElse(0.0) >= val) unlock = true;
                    break;
                case "ACCURACY":
                    if (typingSessionRepository.findBestAkurasiByUserId(userId).orElse(0.0) >= val) unlock = true;
                    break;
                case "TYPING_KILLS":
                    int totalKills = typingSessionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                            .mapToInt(s -> s.getTotalMusuhKalah() != null ? s.getTotalMusuhKalah() : 0)
                            .sum();
                    if (totalKills >= val) unlock = true;
                    break;
                default:
                    break;
            }
            if (unlock) {
                UserBadge ub = UserBadge.builder()
                        .user(user).badge(badge).earnedAt(LocalDateTime.now()).build();
                userBadgeRepository.save(ub);
                if (badge.getXpBonus()!=null && badge.getXpBonus()>0) {
                    user.setTotalXp((user.getTotalXp()!=null?user.getTotalXp():0)+badge.getXpBonus());
                    userRepository.save(user);
                }
            }
        }
    }

    private BadgeResponse toResponse(Badge b) {
        return BadgeResponse.builder()
                .id(b.getId()).nama(b.getNama()).kode(b.getKode())
                .deskripsi(b.getDeskripsi()).iconUrl(b.getIconUrl())
                .warna(b.getWarna()).syaratType(b.getSyaratType())
                .syaratValue(b.getSyaratValue()).build();
    }
}
