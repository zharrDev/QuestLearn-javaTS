package com.questlearn.dto.request;
import lombok.Data;
import javax.validation.constraints.*;
@Data
public class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
}
