package com.questlearn.repository;
import com.questlearn.entity.Level;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findByDuniaIdOrderByUrutanAsc(Long duniaId);
    @Query(value = "SELECT l FROM Level l WHERE " +
           "(:duniaId IS NULL OR l.dunia.id = :duniaId) AND " +
           "(:search IS NULL OR LOWER(l.nama) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(l) FROM Level l WHERE " +
           "(:duniaId IS NULL OR l.dunia.id = :duniaId) AND " +
           "(:search IS NULL OR LOWER(l.nama) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Level> findWithFilter(Long duniaId, String search, Pageable pageable);
}
