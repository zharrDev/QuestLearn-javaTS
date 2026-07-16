package com.questlearn.controller;

import com.questlearn.dto.request.SoalRequest;
import com.questlearn.dto.response.*;
import com.questlearn.service.SoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SoalController {

    @Autowired SoalService soalService;

    @GetMapping("/soal")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) Long levelId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tingkatKesulitan,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String dir) {
        Sort s = dir.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        PaginatedResponse<SoalResponse> res = soalService.getAll(levelId, search, tingkatKesulitan, PageRequest.of(page, size, s));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/levels/{levelId}/soal")
    public ResponseEntity<ApiResponse<List<SoalResponse>>> getByLevel(@PathVariable Long levelId) {
        return ResponseEntity.ok(ApiResponse.success(soalService.getSoalByLevelForQuest(levelId)));
    }

    @GetMapping("/soal/{id}")
    public ResponseEntity<ApiResponse<SoalResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(soalService.getById(id)));
    }

    @PostMapping(value = "/admin/soal", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<SoalResponse>> create(
            @RequestPart("data") SoalRequest req,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Soal dibuat", soalService.create(req, file)));
    }

    @PostMapping(value = "/admin/soal/json")
    public ResponseEntity<ApiResponse<SoalResponse>> createJson(@RequestBody SoalRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Soal dibuat", soalService.create(req, null)));
    }

    @PutMapping(value = "/admin/soal/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<SoalResponse>> updateForm(
            @PathVariable Long id,
            @RequestPart("data") SoalRequest req,
            @RequestPart(value="file", required=false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Soal diupdate", soalService.update(id, req, file)));
    }

    @PutMapping("/admin/soal/{id}/json")
    public ResponseEntity<ApiResponse<SoalResponse>> updateJson(@PathVariable Long id, @RequestBody SoalRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Soal diupdate", soalService.update(id, req, null)));
    }

    @DeleteMapping("/admin/soal/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        soalService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Soal dihapus", null));
    }
}
