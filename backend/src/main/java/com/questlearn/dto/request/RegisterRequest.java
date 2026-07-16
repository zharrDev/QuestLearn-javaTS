package com.questlearn.dto.request;

import lombok.Data;
import javax.validation.constraints.*;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=2, max=100)
    private String nama;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min=6, max=100)
    private String password;
    @NotBlank
    private String confirmPassword;
}
