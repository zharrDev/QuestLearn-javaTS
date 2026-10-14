package com.questlearn.controller;

import com.questlearn.dto.response.*;
import com.questlearn.service.AuthService;
import com.questlearn.entity.User;
import com.questlearn.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired UserRepository userRepository;
    @Autowired AuthService authService;

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<?>> getUsers(
            @RequestParam(required=false) String search,
            @RequestParam(required=false) String role,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size) {
        User.Role roleEnum = null;
        if (role!=null) try { roleEnum = User.Role.valueOf(role.toUpperCase()); } catch(Exception ignored){}
        Page<User> result = userRepository.findWithFilter(search, roleEnum, PageRequest.of(page,size, Sort.by("createdAt").descending()));
        List<Map<String,Object>> content = new ArrayList<>();
        for (User u: result.getContent()) {
            Map<String,Object> m = new HashMap<>();
            m.put("id", u.getId()); m.put("nama", u.getNama()); m.put("email", u.getEmail());
            m.put("role", u.getRole().name()); m.put("totalXp", u.getTotalXp());
            m.put("currentStreak", u.getCurrentStreak()); m.put("createdAt", u.getCreatedAt());
            content.add(m);
        }
        PaginatedResponse<Map<String,Object>> paged = PaginatedResponse.<Map<String,Object>>builder()
                .content(content).page(result.getNumber()).size(result.getSize())
                .totalElements(result.getTotalElements()).totalPages(result.getTotalPages())
                .last(result.isLast()).first(result.isFirst()).build();
        return ResponseEntity.ok(ApiResponse.success(paged));
    }

    @GetMapping("/admin/users/{id}")
    public ResponseEntity<ApiResponse<?>> getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new com.questlearn.exception.ResourceNotFoundException("User tidak ditemukan"));
        // Map to a DTO instead of returning the entity: its bidirectional relations
        // (User <-> UserProfile, progress, badges) recurse during serialization.
        Map<String,Object> m = new HashMap<>();
        m.put("id", u.getId()); m.put("nama", u.getNama()); m.put("email", u.getEmail());
        m.put("avatarUrl", u.getAvatarUrl());
        m.put("role", u.getRole().name()); m.put("totalXp", u.getTotalXp());
        m.put("currentStreak", u.getCurrentStreak()); m.put("longestStreak", u.getLongestStreak());
        m.put("createdAt", u.getCreatedAt());
        return ResponseEntity.ok(ApiResponse.success(m));
    }
}
