package com.questlearn.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class BadgeResponse {
    private Long id;
    private String nama;
    private String kode;
    private String deskripsi;
    private String iconUrl;
    private String warna;
    private String syaratType;
    private Integer syaratValue;
    private Boolean earned;
    private LocalDateTime earnedAt;
}
