package com.questlearn.service;

import com.questlearn.dto.request.DuniaRequest;
import com.questlearn.dto.response.*;
import org.springframework.data.domain.Pageable;

public interface DuniaService {
    PaginatedResponse<DuniaResponse> getAll(String search, Boolean isActive, Pageable pageable);
    DuniaResponse getById(Long id);
    DuniaResponse create(DuniaRequest request);
    DuniaResponse update(Long id, DuniaRequest request);
    void delete(Long id);
    java.util.List<DuniaResponse> getAllForUser(Long userId);
}
