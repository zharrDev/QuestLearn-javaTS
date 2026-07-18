package com.questlearn.dto.request;

import lombok.Data;

@Data
public class SubmitTypingRequest {
    private Long duniaId;
    private String level; // EASY, MEDIUM, HARD
    private Integer skor;
    private Double wpm;
    private Double akurasi;
    private Integer comboTerpanjang;
    private Integer totalMusuhKalah;
    private Integer totalMusuhLolos;
    private Long waktuMillis; // duration in milliseconds
}
