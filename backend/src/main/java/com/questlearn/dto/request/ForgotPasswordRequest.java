package com.questlearn.dto.request;
import lombok.Data;
import javax.validation.constraints.*;
@Data
public class ForgotPasswordRequest {
    @NotBlank @Email
    private String email;
}
