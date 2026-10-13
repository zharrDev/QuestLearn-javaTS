package com.questlearn.controller;

import com.questlearn.dto.request.DuniaRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.User;
import com.questlearn.service.AuthService;
import com.questlearn.service.DuniaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DuniaController {

    @Autowired DuniaService duniaService;
    @Autowired AuthService authService;

    @GetMapping("/public/dunia")
    public ResponseEntity<ApiResponse<List<DuniaResponse>>> getPublicDunia() {
        try {
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.success(duniaService.getAllForUser(user.getId())));
        } catch (Exception e) {
            PaginatedResponse<DuniaResponse> page = duniaService.getAll(null, true, PageRequest.of(0,100));
            return ResponseEntity.ok(ApiResponse.success(page.getContent()));
        }
    }

    @GetMapping("/dunia")
    public ResponseEntity<ApiResponse<?>> getDunia(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "urutan") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort s = direction.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        PaginatedResponse<DuniaResponse> result = duniaService.getAll(search, isActive, PageRequest.of(page, size, s));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/dunia/user")
    public ResponseEntity<ApiResponse<List<DuniaResponse>>> getUserDunia() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(duniaService.getAllForUser(user.getId())));
    }

    @GetMapping("/dunia/{id}")
    public ResponseEntity<ApiResponse<DuniaResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(duniaService.getById(id)));
    }

    @PostMapping("/admin/dunia")
    public ResponseEntity<ApiResponse<DuniaResponse>> create(@Valid @RequestBody DuniaRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Dunia dibuat", duniaService.create(req)));
    }

    @PutMapping("/admin/dunia/{id}")
    public ResponseEntity<ApiResponse<DuniaResponse>> update(@PathVariable Long id, @Valid @RequestBody DuniaRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Dunia diupdate", duniaService.update(id, req)));
    }

    @DeleteMapping("/admin/dunia/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        duniaService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Dunia dihapus", null));
    }
}
