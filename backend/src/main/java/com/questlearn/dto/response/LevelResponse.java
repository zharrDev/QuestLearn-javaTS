package com.questlearn.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LevelResponse {
    private Long id;
    private Long duniaId;
    private String duniaNama;
    private String nama;
    private String deskripsi;
    private Integer urutan;
    private Integer xpReward;
    private Integer minScoreLulus;
    private Boolean isBossLevel;
    private Boolean isActive;
    private Integer totalSoal;
    private String status; // LOCKED, OPEN, COMPLETED
    private LocalDateTime createdAt;
}
