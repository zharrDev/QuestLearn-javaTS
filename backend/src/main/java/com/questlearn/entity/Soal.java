package com.questlearn.entity;

import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soal")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE soal SET deleted_at = NOW() WHERE id=?")
@Where(clause = "deleted_at IS NULL")
public class Soal extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String pertanyaan;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipe_soal", length = 30)
    @Builder.Default
    private TipeSoal tipeSoal = TipeSoal.PILIHAN_GANDA;

    @Column(name = "opsi_a", length = 500)
    private String opsiA;

    @Column(name = "opsi_b", length = 500)
    private String opsiB;

    @Column(name = "opsi_c", length = 500)
    private String opsiC;

    @Column(name = "opsi_d", length = 500)
    private String opsiD;

    @Column(name = "jawaban_benar", nullable = false, length = 10)
    private String jawabanBenar; // A/B/C/D atau text

    @Column(columnDefinition = "TEXT")
    private String pembahasan;

    @Column(name = "gambar_url", length = 255)
    private String gambarUrl;

    @Column(name = "xp_point")
    @Builder.Default
    private Integer xpPoint = 10;

    @Column(name = "tingkat_kesulitan", length = 20)
    @Builder.Default
    private String tingkatKesulitan = "SEDANG";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum TipeSoal {
        PILIHAN_GANDA, ISIAN_SINGKAT, BENAR_SALAH
    }
}
