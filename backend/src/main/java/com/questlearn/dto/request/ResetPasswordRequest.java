package com.questlearn.dto.request;
import lombok.Data;
import javax.validation.constraints.*;
@Data
public class ResetPasswordRequest {
    @NotBlank
    private String token;
    @NotBlank @Size(min=6)
    private String newPassword;
    @NotBlank
    private String confirmPassword;
}
