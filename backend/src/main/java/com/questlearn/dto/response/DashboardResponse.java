package com.questlearn.dto.response;
import lombok.*;
import java.util.List;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardResponse {
    private Integer totalXp;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer completedLevels;
    private Integer totalLevels;
    private Integer totalBadges;
    private List<LevelResponse> continueLearning;
    private List<BadgeResponse> recentBadges;
    private List<LeaderboardEntry> leaderboardWeekly;
}
