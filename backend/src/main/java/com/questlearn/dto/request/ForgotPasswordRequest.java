package com.questlearn.dto.request;
import lombok.Data;
import jakarta.validation.constraints.*;
@Data
public class ForgotPasswordRequest {
    @NotBlank @Email
    private String email;
}
