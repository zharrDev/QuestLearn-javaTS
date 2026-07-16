package com.questlearn.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DuniaResponse {
    private Long id;
    private String nama;
    private String slug;
    private String deskripsi;
    private String iconUrl;
    private String backgroundColor;
    private Integer urutan;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer totalLevel;
    private Integer completedLevel;
}
