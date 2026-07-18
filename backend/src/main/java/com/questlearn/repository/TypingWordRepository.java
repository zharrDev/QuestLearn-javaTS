package com.questlearn.repository;

import com.questlearn.entity.TypingWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TypingWordRepository extends JpaRepository<TypingWord, Long> {
    List<TypingWord> findByDuniaIdAndLevelKesulitanAndIsActiveTrue(Long duniaId, TypingWord.LevelKesulitan level);
    long countByDuniaIdAndIsActiveTrue(Long duniaId);
}
