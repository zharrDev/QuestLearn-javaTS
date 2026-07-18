package com.questlearn.entity;

import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import javax.persistence.*;

@Entity
@Table(name = "typing_words")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE typing_words SET deleted_at = NOW() WHERE id=?")
@Where(clause = "deleted_at IS NULL")
public class TypingWord extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dunia_id", nullable = false)
    private Dunia dunia;

    @Column(nullable = false, length = 500)
    private String teks;

    @Enumerated(EnumType.STRING)
    @Column(name = "level_kesulitan", nullable = false, length = 20)
    @Builder.Default
    private LevelKesulitan levelKesulitan = LevelKesulitan.EASY;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private java.time.LocalDateTime deletedAt;

    public enum LevelKesulitan {
        EASY, MEDIUM, HARD
    }
}
