package com.questlearn.controller;

import com.questlearn.dto.request.SubmitQuestRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.User;
import com.questlearn.service.AuthService;
import com.questlearn.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressController {

    @Autowired ProgressService progressService;
    @Autowired AuthService authService;

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<?>> getProgress(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size) {
        User user = authService.getCurrentUser();
        PaginatedResponse<ProgressResponse> res = progressService.getUserProgress(user.getId(), PageRequest.of(page,size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/quest/submit")
    public ResponseEntity<ApiResponse<ProgressResponse>> submit(@RequestBody SubmitQuestRequest req) {
        User user = authService.getCurrentUser();
        ProgressResponse r = progressService.submitQuest(user.getId(), req);
        String msg = r.getIsLulus() ? "Selamat! Level lulus! +" + r.getXpDidapat() + " XP" : "Terus semangat! Skor " + r.getSkor() + "%";
        return ResponseEntity.ok(ApiResponse.success(msg, r));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(progressService.getDashboard(user.getId())));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> leaderboard(
            @RequestParam(defaultValue="weekly") String period) {
        return ResponseEntity.ok(ApiResponse.success(progressService.getLeaderboard(period)));
    }

    @GetMapping("/public/leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> publicLeaderboard(
            @RequestParam(defaultValue="weekly") String period) {
        return ResponseEntity.ok(ApiResponse.success(progressService.getLeaderboard(period)));
    }
}
