package com.questlearn.dto.request;
import lombok.Data;
import jakarta.validation.constraints.*;
@Data
public class LevelRequest {
    @NotNull
    private Long duniaId;
    @NotBlank @Size(min=2, max=150)
    private String nama;
    private String deskripsi;
    @NotNull
    private Integer urutan;
    private Integer xpReward;
    private Integer minScoreLulus;
    private Boolean isBossLevel;
    private Boolean isActive;
}
