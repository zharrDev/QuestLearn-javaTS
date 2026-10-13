
package com.questlearn.service.impl;

import com.questlearn.dto.request.*;
import com.questlearn.dto.response.JwtResponse;
import com.questlearn.entity.User;
import com.questlearn.entity.UserProfile;
import com.questlearn.exception.BadRequestException;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.UserProfileRepository;
import com.questlearn.repository.UserRepository;
import com.questlearn.security.JwtTokenProvider;
import com.questlearn.security.PasswordEncoder;
import com.questlearn.service.AuthService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.Map;

@RequestScoped
public class AuthServiceImpl implements AuthService {

    @Inject UserRepository userRepository;
    @Inject UserProfileRepository profileRepository;
    @Inject PasswordEncoder passwordEncoder;
    @Inject JwtTokenProvider tokenProvider;
    @Inject SecurityIdentity securityIdentity;

    // simple in-memory token store for forgot password demo
    private Map<String, String> resetTokens = new HashMap<>();

    @Override
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email atau password salah"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Email atau password salah");
        }
        String jwt = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), user.getRole().name());
        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .nama(user.getNama())
                .role(user.getRole().name())
                .totalXp(user.getTotalXp())
                .currentStreak(user.getCurrentStreak())
                .build();
    }

    @Override
    public JwtResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password confirmation tidak cocok");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email sudah terdaftar");
        }
        User user = User.builder()
                .nama(request.getNama())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.SISWA)
                .totalXp(0)
                .currentStreak(0)
                .longestStreak(0)
                .build();
        user = userRepository.save(user);
        UserProfile profile = UserProfile.builder().user(user).build();
        profileRepository.save(profile);

        String jwt = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), user.getRole().name());

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .email(user.getEmail())
                .nama(user.getNama())
                .role(user.getRole().name())
                .totalXp(0)
                .currentStreak(0)
                .build();
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email tidak ditemukan"));
        String token = java.util.UUID.randomUUID().toString();
        resetTokens.put(token, user.getEmail());
        System.out.println("RESET TOKEN for " + user.getEmail() + ": " + token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String email = resetTokens.get(request.getToken());
        if (email == null) throw new BadRequestException("Token tidak valid atau expired");
        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new BadRequestException("Password confirmation tidak cocok");
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetTokens.remove(request.getToken());
    }

    @Override
    public User getCurrentUser() {
        Long userId = securityIdentity.getAttribute("userId");
        if (userId == null) throw new BadRequestException("Unauthorized");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
