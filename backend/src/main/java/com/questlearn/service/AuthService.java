package com.questlearn.service;

import com.questlearn.dto.request.*;
import com.questlearn.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse login(LoginRequest request);
    JwtResponse register(RegisterRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    com.questlearn.entity.User getCurrentUser();
}
