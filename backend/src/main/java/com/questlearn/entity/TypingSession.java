package com.questlearn.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "typing_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TypingSession extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dunia_id", nullable = false)
    private Dunia dunia;

    @Column(length = 20)
    private String level; // EASY, MEDIUM, HARD

    @Column(name = "skor")
    @Builder.Default
    private Integer skor = 0;

    @Column(name = "wpm")
    @Builder.Default
    private Double wpm = 0.0;

    @Column(name = "akurasi")
    @Builder.Default
    private Double akurasi = 0.0;

    @Column(name = "combo_terpanjang")
    @Builder.Default
    private Integer comboTerpanjang = 0;

    @Column(name = "total_musuh_kalah")
    @Builder.Default
    private Integer totalMusuhKalah = 0;

    @Column(name = "total_musuh_lolos")
    @Builder.Default
    private Integer totalMusuhLolos = 0;

    @Column(name = "xp_didapat")
    @Builder.Default
    private Integer xpDidapat = 0;

    @Column(name = "waktu_mulai")
    private LocalDateTime waktuMulai;

    @Column(name = "waktu_selesai")
    private LocalDateTime waktuSelesai;
}
