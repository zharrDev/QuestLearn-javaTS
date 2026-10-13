
package com.questlearn.service.impl;

import com.questlearn.dto.request.SoalRequest;
import com.questlearn.dto.response.*;
import com.questlearn.entity.Level;
import com.questlearn.entity.Soal;
import com.questlearn.exception.ResourceNotFoundException;
import com.questlearn.repository.LevelRepository;
import com.questlearn.repository.SoalRepository;
import com.questlearn.service.FileStorageService;
import com.questlearn.service.SoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SoalServiceImpl implements SoalService {

    @Autowired SoalRepository soalRepository;
    @Autowired LevelRepository levelRepository;
    @Autowired FileStorageService fileStorageService;

    @Override
    public PaginatedResponse<SoalResponse> getAll(Long levelId, String search, String tingkat, Pageable pageable) {
        Page<Soal> page = soalRepository.findWithFilter(levelId, search, tingkat, pageable);
        List<SoalResponse> content = page.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return PaginatedResponse.<SoalResponse>builder()
                .content(content).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }

    @Override
    public SoalResponse getById(Long id) {
        Soal s = soalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Soal tidak ditemukan"));
        return toResponse(s);
    }

    @Override
    public SoalResponse create(SoalRequest req, byte[] fileData, String fileOriginalName) {
        Level level = levelRepository.findById(req.getLevelId()).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));
        Soal soal = Soal.builder()
                .level(level).pertanyaan(req.getPertanyaan())
                .tipeSoal(req.getTipeSoal()!=null? Soal.TipeSoal.valueOf(req.getTipeSoal()): Soal.TipeSoal.PILIHAN_GANDA)
                .opsiA(req.getOpsiA()).opsiB(req.getOpsiB()).opsiC(req.getOpsiC()).opsiD(req.getOpsiD())
                .jawabanBenar(req.getJawabanBenar()).pembahasan(req.getPembahasan())
                .tingkatKesulitan(req.getTingkatKesulitan()!=null?req.getTingkatKesulitan():"SEDANG")
                .xpPoint(req.getXpPoint()!=null?req.getXpPoint():10)
                .build();
        if (fileData != null && fileData.length > 0) {
            String url = fileStorageService.storeFile(fileData, fileOriginalName);
            soal.setGambarUrl(url);
        }
        return toResponse(soalRepository.save(soal));
    }

    @Override
    public SoalResponse update(Long id, SoalRequest req, byte[] fileData, String fileOriginalName) {
        Soal soal = soalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Soal tidak ditemukan"));
        if (req.getLevelId()!=null) {
            Level level = levelRepository.findById(req.getLevelId()).orElseThrow(() -> new ResourceNotFoundException("Level tidak ditemukan"));
            soal.setLevel(level);
        }
        soal.setPertanyaan(req.getPertanyaan());
        if (req.getTipeSoal()!=null) soal.setTipeSoal(Soal.TipeSoal.valueOf(req.getTipeSoal()));
        soal.setOpsiA(req.getOpsiA()); soal.setOpsiB(req.getOpsiB()); soal.setOpsiC(req.getOpsiC()); soal.setOpsiD(req.getOpsiD());
        soal.setJawabanBenar(req.getJawabanBenar());
        soal.setPembahasan(req.getPembahasan());
        if (req.getTingkatKesulitan()!=null) soal.setTingkatKesulitan(req.getTingkatKesulitan());
        if (req.getXpPoint()!=null) soal.setXpPoint(req.getXpPoint());
        if (fileData != null && fileData.length > 0) {
            String url = fileStorageService.storeFile(fileData, fileOriginalName);
            soal.setGambarUrl(url);
        }
        return toResponse(soalRepository.save(soal));
    }

    @Override
    public void delete(Long id) {
        Soal soal = soalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Soal tidak ditemukan"));
        soalRepository.delete(soal);
    }

    @Override
    public List<SoalResponse> getSoalByLevelForQuest(Long levelId) {
        List<Soal> list = soalRepository.findByLevelId(levelId);
        // hide jawabanBenar for student? For gamified learning we keep explanation after answering, so return without jawabanBenar optionally
        return list.stream().map(s -> {
            SoalResponse r = toResponse(s);
            // For quest mode, we still send jawabanBenar but frontend will hide until answered
            return r;
        }).collect(Collectors.toList());
    }

    private SoalResponse toResponse(Soal s) {
        return SoalResponse.builder()
                .id(s.getId()).levelId(s.getLevel()!=null? s.getLevel().getId():null)
                .levelNama(s.getLevel()!=null? s.getLevel().getNama():null)
                .pertanyaan(s.getPertanyaan()).tipeSoal(s.getTipeSoal()!=null? s.getTipeSoal().name():null)
                .opsiA(s.getOpsiA()).opsiB(s.getOpsiB()).opsiC(s.getOpsiC()).opsiD(s.getOpsiD())
                .jawabanBenar(s.getJawabanBenar()).pembahasan(s.getPembahasan())
                .gambarUrl(s.getGambarUrl()).xpPoint(s.getXpPoint())
                .tingkatKesulitan(s.getTingkatKesulitan()).createdAt(s.getCreatedAt())
                .build();
    }
}
