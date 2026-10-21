package com.questlearn.repository;
import com.questlearn.entity.Badge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByKode(String kode);
    @Query(value = "SELECT b FROM Badge b WHERE " +
           "(:search IS NULL OR LOWER(b.nama) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(b) FROM Badge b WHERE " +
           "(:search IS NULL OR LOWER(b.nama) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Badge> findWithFilter(String search, Pageable pageable);
}
