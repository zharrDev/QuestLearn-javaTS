package com.questlearn.dto.response;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ProgressResponse {
    private Long id;
    private Long levelId;
    private String levelNama;
    private String duniaNama;
    private Integer skor;
    private Integer totalSoal;
    private Integer jawabanBenar;
    private Boolean isLulus;
    private Integer percobaanKe;
    private Integer xpDidapat;
    private LocalDateTime waktuMulai;
    private LocalDateTime waktuSelesai;
    private List<JawabanDetailResponse> jawabanDetails;
    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class JawabanDetailResponse {
        private Long soalId;
        private String pertanyaan;
        private String jawabanUser;
        private String jawabanBenar;
        private Boolean isBenar;
        private String pembahasan;
    }
}
