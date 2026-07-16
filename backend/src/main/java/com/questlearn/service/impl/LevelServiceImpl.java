
package com.questlearn.service.impl;

import com.questlearn.dto.request.LevelRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.Dunia;
import com.questlearn.entity.Level;
import com.questlearn.entity.ProgressUser;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.DuniaRepository;
import com.questlearn.repository.LevelRepository;
import com.questlearn.repository.ProgressUserRepository;
import com.questlearn.repository.SoalRepository;
import com.questlearn.service.LevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LevelServiceImpl implements LevelService {

    @Autowired LevelRepository levelRepository;
    @Autowired DuniaRepository duniaRepository;
    @Autowired SoalRepository soalRepository;
    @Autowired ProgressUserRepository progressRepository;

    @Override
    public PaginatedResponse<LevelResponse> getAll(Long duniaId, String search, Pageable pageable) {
        Page<Level> page = levelRepository.findWithFilter(duniaId, search, pageable);
        List<LevelResponse> content = page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return PaginatedResponse.<LevelResponse>builder()
                .content(content).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    @Override
    public LevelResponse getById(Long id) {
        Level l = levelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));
        return toResponse(l);
    }

    @Override
    public LevelResponse create(LevelRequest req) {
        Dunia dunia = duniaRepository.findById(req.getDuniaId()).orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));
        Level level = Level.builder()
                .dunia(dunia).nama(req.getNama()).deskripsi(req.getDeskripsi())
                .urutan(req.getUrutan()).xpReward(req.getXpReward()!=null?req.getXpReward():50)
                .minScoreLulus(req.getMinScoreLulus()!=null?req.getMinScoreLulus():70)
                .isBossLevel(req.getIsBossLevel()!=null?req.getIsBossLevel():false)
                .isActive(req.getIsActive()!=null?req.getIsActive():true)
                .build();
        return toResponse(levelRepository.save(level));
    }

    @Override
    public LevelResponse update(Long id, LevelRequest req) {
        Level level = levelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));
        if (req.getDuniaId()!=null) {
            Dunia dunia = duniaRepository.findById(req.getDuniaId()).orElseThrow(() -> new ResourceNotFoundException("Dunia tidak ditemukan"));
            level.setDunia(dunia);
        }
        level.setNama(req.getNama());
        level.setDeskripsi(req.getDeskripsi());
        level.setUrutan(req.getUrutan());
        if (req.getXpReward()!=null) level.setXpReward(req.getXpReward());
        if (req.getMinScoreLulus()!=null) level.setMinScoreLulus(req.getMinScoreLulus());
        if (req.getIsBossLevel()!=null) level.setIsBossLevel(req.getIsBossLevel());
        if (req.getIsActive()!=null) level.setIsActive(req.getIsActive());
        return toResponse(levelRepository.save(level));
    }

    @Override
    public void delete(Long id) {
        Level level = levelRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));
        levelRepository.delete(level);
    }

    @Override
    public List<LevelResponse> getLevelsByDunia(Long duniaId, Long userId) {
        List<Level> levels = levelRepository.findByDuniaIdOrderByUrutanAsc(duniaId);
        Set<Long> completedIds = progressRepository.findLulusByUserId(userId).stream()
                .map(p -> p.getLevel().getId()).collect(Collectors.toSet());
        List<LevelResponse> result = new ArrayList<>();
        for (int i=0;i<levels.size();i++) {
            Level l = levels.get(i);
            LevelResponse r = toResponse(l);
            boolean first = i==0;
            boolean prevCompleted = i>0 && completedIds.contains(levels.get(i-1).getId());
            boolean selfCompleted = completedIds.contains(l.getId());
            if (selfCompleted) r.setStatus("COMPLETED");
            else if (first || prevCompleted) r.setStatus("OPEN");
            else r.setStatus("LOCKED");
            result.add(r);
        }
        return result;
    }

    private LevelResponse toResponse(Level l) {
        return LevelResponse.builder()
                .id(l.getId())
                .duniaId(l.getDunia()!=null?l.getDunia().getId():null)
                .duniaNama(l.getDunia()!=null?l.getDunia().getNama():null)
                .nama(l.getNama()).deskripsi(l.getDeskripsi())
                .urutan(l.getUrutan()).xpReward(l.getXpReward())
                .minScoreLulus(l.getMinScoreLulus()).isBossLevel(l.getIsBossLevel())
                .isActive(l.getIsActive())
                .totalSoal(l.getSoals()!=null?l.getSoals().size(): (int)soalRepository.countByLevelId(l.getId()))
                .createdAt(l.getCreatedAt())
                .build();
    }
}
