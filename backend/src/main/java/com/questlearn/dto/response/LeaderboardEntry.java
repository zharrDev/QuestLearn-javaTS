package com.questlearn.dto.response;
import lombok.*;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String nama;
    private String avatarUrl;
    private Integer totalXp;
    // Typing metric: ranking is based on the user's best WPM, not XP.
    private Double wpm;
    private Double akurasi;
    private String duniaNama;
    private Integer rank;
}
