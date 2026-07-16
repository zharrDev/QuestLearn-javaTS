package com.questlearn.dto.request;
import lombok.Data;
import javax.validation.constraints.*;
@Data
public class BadgeRequest {
    @NotBlank
    private String nama;
    @NotBlank
    private String kode;
    private String deskripsi;
    private String warna;
    private String syaratType;
    private Integer syaratValue;
    private Integer xpBonus;
}
