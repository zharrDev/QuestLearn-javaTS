package com.questlearn.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "jawaban_detail")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class JawabanDetail extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "progress_id", nullable = false)
    private ProgressUser progress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soal_id", nullable = false)
    private Soal soal;

    @Column(name = "jawaban_user", length = 500)
    private String jawabanUser;

    @Column(name = "is_benar")
    private Boolean isBenar;

    @Column(name = "xp_didapat")
    @Builder.Default
    private Integer xpDidapat = 0;
}
