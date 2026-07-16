package com.questlearn.repository;
import com.questlearn.entity.ProgressUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface ProgressUserRepository extends JpaRepository<ProgressUser, Long> {
    Optional<ProgressUser> findByUserIdAndLevelId(Long userId, Long levelId);
    List<ProgressUser> findByUserId(Long userId);
    Page<ProgressUser> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM ProgressUser p WHERE p.user.id = :userId AND p.isLulus = true")
    List<ProgressUser> findLulusByUserId(Long userId);
    
    @Query("SELECT p.user.id, SUM(p.xpDidapat) as totalXp FROM ProgressUser p GROUP BY p.user.id ORDER BY totalXp DESC")
    List<Object[]> findLeaderboard();
}
