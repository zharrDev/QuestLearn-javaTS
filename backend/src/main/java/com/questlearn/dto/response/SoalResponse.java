package com.questlearn.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class SoalResponse {
    private Long id;
    private Long levelId;
    private String levelNama;
    private String pertanyaan;
    private String tipeSoal;
    private String opsiA;
    private String opsiB;
    private String opsiC;
    private String opsiD;
    private String jawabanBenar;
    private String pembahasan;
    private String gambarUrl;
    private Integer xpPoint;
    private String tingkatKesulitan;
    private LocalDateTime createdAt;
}
