package com.questlearn.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "levels")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Level extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dunia_id", nullable = false)
    private Dunia dunia;

    @Column(nullable = false, length = 150)
    private String nama;

    @Column(length = 500)
    private String deskripsi;

    @Column(name = "urutan", nullable = false)
    private Integer urutan;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 50;

    @Column(name = "min_score_lulus")
    @Builder.Default
    private Integer minScoreLulus = 70;

    @Column(name = "is_boss_level")
    @Builder.Default
    private Boolean isBossLevel = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<Soal> soals = new ArrayList<>();

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ProgressUser> progresses = new ArrayList<>();
}
