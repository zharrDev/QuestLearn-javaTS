package com.questlearn.repository;
import com.questlearn.entity.Dunia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DuniaRepository extends JpaRepository<Dunia, Long> {
    Optional<Dunia> findBySlug(String slug);
    // countQuery is required: Quarkus spring-data-jpa otherwise derives it as
    // "SELECT COUNT(*) SELECT d FROM ...", which is invalid JPQL.
    @Query(value = "SELECT d FROM Dunia d WHERE " +
           "(:search IS NULL OR LOWER(d.nama) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isActive IS NULL OR d.isActive = :isActive)",
           countQuery = "SELECT COUNT(d) FROM Dunia d WHERE " +
           "(:search IS NULL OR LOWER(d.nama) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isActive IS NULL OR d.isActive = :isActive)")
    Page<Dunia> findWithFilter(String search, Boolean isActive, Pageable pageable);
}
