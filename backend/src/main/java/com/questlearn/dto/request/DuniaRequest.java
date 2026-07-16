package com.questlearn.dto.request;
import lombok.Data;
import javax.validation.constraints.*;
@Data
public class DuniaRequest {
    @NotBlank @Size(min=2, max=100)
    private String nama;
    @Size(max=500)
    private String deskripsi;
    private String backgroundColor;
    private Integer urutan;
    private Boolean isActive;
}
