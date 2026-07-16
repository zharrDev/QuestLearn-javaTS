package com.questlearn.service;
import com.questlearn.dto.request.BadgeRequest;
import com.questlearn.dto.response.*;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface BadgeService {
    PaginatedResponse<BadgeResponse> getAll(String search, Pageable pageable);
    BadgeResponse getById(Long id);
    BadgeResponse create(BadgeRequest request);
    BadgeResponse update(Long id, BadgeRequest request);
    void delete(Long id);
    List<BadgeResponse> getUserBadges(Long userId);
    void checkAndUnlockBadges(Long userId);
}
