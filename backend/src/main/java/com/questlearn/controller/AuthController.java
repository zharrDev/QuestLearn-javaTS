package com.questlearn.controller;

import com.questlearn.dto.request.*;
import com.questlearn.dto.response.ApiResponse;
import com.questlearn.dto.response.JwtResponse;
import com.questlearn.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest req) {
        JwtResponse jwt = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login berhasil", jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponse>> register(@Valid @RequestBody RegisterRequest req) {
        JwtResponse jwt = authService.register(req);
        return ResponseEntity.ok(ApiResponse.success("Register berhasil", jwt));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ResponseEntity.ok(ApiResponse.success("Jika email terdaftar, link reset telah dikirim (cek console log)", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success("Password berhasil direset", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser()));
    }
}
