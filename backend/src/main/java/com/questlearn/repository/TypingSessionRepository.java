package com.questlearn.repository;

import com.questlearn.entity.TypingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypingSessionRepository extends JpaRepository<TypingSession, Long> {
    List<TypingSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT MAX(t.wpm) FROM TypingSession t WHERE t.user.id = :userId")
    Optional<Double> findBestWpmByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(t.wpm) FROM TypingSession t WHERE t.user.id = :userId AND t.dunia.id = :duniaId")
    Optional<Double> findBestWpmByUserIdAndDuniaId(@Param("userId") Long userId, @Param("duniaId") Long duniaId);

    @Query("SELECT MAX(t.akurasi) FROM TypingSession t WHERE t.user.id = :userId")
    Optional<Double> findBestAkurasiByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(t.akurasi) FROM TypingSession t WHERE t.user.id = :userId AND t.dunia.id = :duniaId")
    Optional<Double> findBestAkurasiByUserIdAndDuniaId(@Param("userId") Long userId, @Param("duniaId") Long duniaId);

    List<TypingSession> findTop20ByOrderByWpmDesc();
}
