package com.questlearn.repository;
import com.questlearn.entity.Soal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface SoalRepository extends JpaRepository<Soal, Long> {
    List<Soal> findByLevelId(Long levelId);
    long countByLevelId(Long levelId);
    
    @Query(value = "SELECT s FROM Soal s WHERE " +
           "(:levelId IS NULL OR s.level.id = :levelId) AND " +
           "(:search IS NULL OR LOWER(s.pertanyaan) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tingkat IS NULL OR s.tingkatKesulitan = :tingkat)",
           countQuery = "SELECT COUNT(s) FROM Soal s WHERE " +
           "(:levelId IS NULL OR s.level.id = :levelId) AND " +
           "(:search IS NULL OR LOWER(s.pertanyaan) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tingkat IS NULL OR s.tingkatKesulitan = :tingkat)")
    Page<Soal> findWithFilter(Long levelId, String search, String tingkat, Pageable pageable);
}
