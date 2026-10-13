package com.questlearn.dto.request;
import lombok.Data;
import jakarta.validation.constraints.*;
@Data
public class SoalRequest {
    @NotNull
    private Long levelId;
    @NotBlank
    private String pertanyaan;
    private String tipeSoal;
    private String opsiA;
    private String opsiB;
    private String opsiC;
    private String opsiD;
    @NotBlank
    private String jawabanBenar;
    private String pembahasan;
    private String tingkatKesulitan;
    private Integer xpPoint;
}
