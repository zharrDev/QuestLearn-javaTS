package com.questlearn.repository;

import com.questlearn.entity.TypingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypingSessionRepository extends JpaRepository<TypingSession, Long> {
    List<TypingSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Best-session lookups use derived queries instead of `@Query` scalar projections:
    // Quarkus spring-data-jpa mis-compiles `@Query` methods returning Optional<Double>
    // (it casts the scalar result to TypingSession). Callers read the field from the entity.
    Optional<TypingSession> findFirstByUserIdOrderByWpmDesc(Long userId);

    Optional<TypingSession> findFirstByUserIdAndDuniaIdOrderByWpmDesc(Long userId, Long duniaId);

    Optional<TypingSession> findFirstByUserIdOrderByAkurasiDesc(Long userId);

    Optional<TypingSession> findFirstByUserIdAndDuniaIdOrderByAkurasiDesc(Long userId, Long duniaId);

    List<TypingSession> findTop20ByOrderByWpmDesc();
}
