package com.questlearn.controller;

import com.questlearn.dto.request.LevelRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.User;
import com.questlearn.service.AuthService;
import com.questlearn.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class LevelController {

    @Autowired LevelService levelService;
    @Autowired AuthService authService;

    @GetMapping("/levels")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) Long duniaId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "urutan") String sort,
            @RequestParam(defaultValue = "asc") String dir) {
        Sort s = dir.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        PaginatedResponse<LevelResponse> res = levelService.getAll(duniaId, search, PageRequest.of(page, size, s));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/dunia/{duniaId}/levels")
    public ResponseEntity<ApiResponse<List<LevelResponse>>> getByDunia(@PathVariable Long duniaId) {
        try {
            User user = authService.getCurrentUser();
            return ResponseEntity.ok(ApiResponse.success(levelService.getLevelsByDunia(duniaId, user.getId())));
        } catch (Exception e) {
            PaginatedResponse<LevelResponse> p = levelService.getAll(duniaId, null, PageRequest.of(0,100));
            return ResponseEntity.ok(ApiResponse.success(p.getContent()));
        }
    }

    @GetMapping("/levels/{id}")
    public ResponseEntity<ApiResponse<LevelResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(levelService.getById(id)));
    }

    @PostMapping("/admin/levels")
    public ResponseEntity<ApiResponse<LevelResponse>> create(@Valid @RequestBody LevelRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Level dibuat", levelService.create(req)));
    }

    @PutMapping("/admin/levels/{id}")
    public ResponseEntity<ApiResponse<LevelResponse>> update(@PathVariable Long id, @Valid @RequestBody LevelRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Level diupdate", levelService.update(id, req)));
    }

    @DeleteMapping("/admin/levels/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        levelService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Level dihapus", null));
    }
}
