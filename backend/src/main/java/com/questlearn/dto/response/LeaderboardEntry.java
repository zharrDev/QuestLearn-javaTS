package com.questlearn.dto.response;
import lombok.*;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LeaderboardEntry {
    private Long userId;
    private String nama;
    private String avatarUrl;
    private Integer totalXp;
    private Integer rank;
}
