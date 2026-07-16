package com.questlearn.service;
import com.questlearn.dto.request.SubmitQuestRequest;
import com.questlearn.dto.response.*;
import org.springframework.data.domain.Pageable;
public interface ProgressService {
    PaginatedResponse<ProgressResponse> getUserProgress(Long userId, Pageable pageable);
    ProgressResponse submitQuest(Long userId, SubmitQuestRequest request);
    DashboardResponse getDashboard(Long userId);
    java.util.List<LeaderboardEntry> getLeaderboard(String period);
}
