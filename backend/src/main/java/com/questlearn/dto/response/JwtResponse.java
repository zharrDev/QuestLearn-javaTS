package com.questlearn.dto.response;
import lombok.*;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String nama;
    private String role;
    private Integer totalXp;
    private Integer currentStreak;
}
