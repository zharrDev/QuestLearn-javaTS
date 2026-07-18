package com.questlearn.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class TypingSessionResponse {
    private Long id;
    private Long duniaId;
    private String duniaNama;
    private String level;
    private Integer skor;
    private Double wpm;
    private Double akurasi;
    private Integer comboTerpanjang;
    private Integer totalMusuhKalah;
    private Integer totalMusuhLolos;
    private Integer xpDidapat;
    private LocalDateTime waktuMulai;
    private LocalDateTime waktuSelesai;
}
