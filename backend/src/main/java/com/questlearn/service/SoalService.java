package com.questlearn.service;
import com.questlearn.dto.request.SoalRequest;
import com.questlearn.dto.response.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
public interface SoalService {
    PaginatedResponse<SoalResponse> getAll(Long levelId, String search, String tingkat, Pageable pageable);
    SoalResponse getById(Long id);
    SoalResponse create(SoalRequest request, MultipartFile file);
    SoalResponse update(Long id, SoalRequest request, MultipartFile file);
    void delete(Long id);
    List<SoalResponse> getSoalByLevelForQuest(Long levelId);
}
