package com.questlearn.repository;
import com.questlearn.entity.JawabanDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JawabanDetailRepository extends JpaRepository<JawabanDetail, Long> {
    List<JawabanDetail> findByProgressId(Long progressId);
}
