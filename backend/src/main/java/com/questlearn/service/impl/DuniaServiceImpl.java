
package com.questlearn.service.impl;

import com.questlearn.dto.request.DuniaRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.Dunia;
import com.questlearn.entity.ProgressUser;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.DuniaRepository;
import com.questlearn.repository.LevelRepository;
import com.questlearn.repository.ProgressUserRepository;
import com.questlearn.service.DuniaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DuniaServiceImpl implements DuniaService {

    @Autowired DuniaRepository duniaRepository;
    @Autowired LevelRepository levelRepository;
    @Autowired ProgressUserRepository progressRepository;

    @Override
    public PaginatedResponse<DuniaResponse> getAll(String search, Boolean isActive, Pageable pageable) {
        Page<Dunia> page = duniaRepository.findWithFilter(search, isActive, pageable);
        List<DuniaResponse> content = page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return PaginatedResponse.<DuniaResponse>builder()
                .content(content).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    @Override
    public DuniaResponse getById(Long id) {
        Dunia d = duniaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));
        return toResponse(d);
    }

    @Override
    public DuniaResponse create(DuniaRequest req) {
        Dunia d = Dunia.builder()
                .nama(req.getNama())
                .deskripsi(req.getDeskripsi())
                .backgroundColor(req.getBackgroundColor() != null ? req.getBackgroundColor() : "#D97757")
                .urutan(req.getUrutan() != null ? req.getUrutan() : 0)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .slug(req.getNama().toLowerCase().replaceAll("[^a-z0-9]+","-"))
                .build();
        return toResponse(duniaRepository.save(d));
    }

    @Override
    public DuniaResponse update(Long id, DuniaRequest req) {
        Dunia d = duniaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));
        d.setNama(req.getNama());
        d.setDeskripsi(req.getDeskripsi());
        if (req.getBackgroundColor() != null) d.setBackgroundColor(req.getBackgroundColor());
        if (req.getUrutan() != null) d.setUrutan(req.getUrutan());
        if (req.getIsActive() != null) d.setIsActive(req.getIsActive());
        d.setSlug(req.getNama().toLowerCase().replaceAll("[^a-z0-9]+","-"));
        return toResponse(duniaRepository.save(d));
    }

    @Override
    public void delete(Long id) {
        Dunia d = duniaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));
        duniaRepository.delete(d);
    }

    @Override
    public List<DuniaResponse> getAllForUser(Long userId) {
        List<Dunia> all = duniaRepository.findAll();
        return all.stream().map(d -> {
            DuniaResponse r = toResponse(d);
            int totalLevel = levelRepository.findByDuniaIdOrderByUrutanAsc(d.getId()).size();
            long completed = progressRepository.findLulusByUserId(userId).stream()
                    .filter(p -> p.getLevel().getDunia().getId().equals(d.getId())).count();
            r.setTotalLevel(totalLevel);
            r.setCompletedLevel((int)completed);
            return r;
        }).collect(Collectors.toList());
    }

    private DuniaResponse toResponse(Dunia d) {
        return DuniaResponse.builder()
                .id(d.getId()).nama(d.getNama()).slug(d.getSlug())
                .deskripsi(d.getDeskripsi()).backgroundColor(d.getBackgroundColor())
                .urutan(d.getUrutan()).isActive(d.getIsActive())
                .iconUrl(d.getIconUrl()).createdAt(d.getCreatedAt())
                .totalLevel(d.getLevels() != null ? d.getLevels().size() : 0)
                .build();
    }
}
