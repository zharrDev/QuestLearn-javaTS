package com.questlearn.service;
import com.questlearn.dto.request.LevelRequest;
import com.questlearn.dto.response.*;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface LevelService {
    PaginatedResponse<LevelResponse> getAll(Long duniaId, String search, Pageable pageable);
    LevelResponse getById(Long id);
    LevelResponse create(LevelRequest request);
    LevelResponse update(Long id, LevelRequest request);
    void delete(Long id);
    List<LevelResponse> getLevelsByDunia(Long duniaId, Long userId);
}
