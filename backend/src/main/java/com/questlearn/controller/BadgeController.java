package com.questlearn.controller;

import com.questlearn.dto.request.BadgeRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.User;
import com.questlearn.service.AuthService;
import com.questlearn.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BadgeController {

    @Autowired BadgeService badgeService;
    @Autowired AuthService authService;

    @GetMapping("/badges")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required=false) String search,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size) {
        PaginatedResponse<BadgeResponse> res = badgeService.getAll(search, PageRequest.of(page,size));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/badges/user")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getUserBadges() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(badgeService.getUserBadges(user.getId())));
    }

    @GetMapping("/badges/{id}")
    public ResponseEntity<ApiResponse<BadgeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(badgeService.getById(id)));
    }

    @PostMapping("/admin/badges")
    public ResponseEntity<ApiResponse<BadgeResponse>> create(@Valid @RequestBody BadgeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Badge dibuat", badgeService.create(req)));
    }

    @PutMapping("/admin/badges/{id}")
    public ResponseEntity<ApiResponse<BadgeResponse>> update(@PathVariable Long id, @Valid @RequestBody BadgeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Badge diupdate", badgeService.update(id, req)));
    }

    @DeleteMapping("/admin/badges/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        badgeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Badge dihapus", null));
    }
}
