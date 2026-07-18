package com.questlearn.controller;

import com.questlearn.dto.request.SubmitTypingRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.User;
import com.questlearn.service.AuthService;
import com.questlearn.service.TypingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/typing")
public class TypingController {

    @Autowired TypingService typingService;
    @Autowired AuthService authService;

    @GetMapping("/start")
    public ResponseEntity<ApiResponse<TypingStartResponse>> start(
            @RequestParam Long duniaId,
            @RequestParam(defaultValue = "EASY") String level) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(typingService.startSession(user.getId(), duniaId, level)));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<TypingSessionResponse>> submit(@RequestBody SubmitTypingRequest req) {
        User user = authService.getCurrentUser();
        TypingSessionResponse res = typingService.submitSession(user.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Sesi selesai! +" + res.getXpDidapat() + " XP", res));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<TypingSessionResponse>>> sessions() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(typingService.getUserSessions(user.getId())));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> leaderboard(
            @RequestParam(required = false) String level) {
        return ResponseEntity.ok(ApiResponse.success(typingService.getLeaderboard(level)));
    }
}
