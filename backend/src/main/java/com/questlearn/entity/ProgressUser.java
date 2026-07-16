package com.questlearn.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "progress_user", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "level_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProgressUser extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column(name = "skor")
    @Builder.Default
    private Integer skor = 0;

    @Column(name = "total_soal")
    private Integer totalSoal;

    @Column(name = "jawaban_benar")
    @Builder.Default
    private Integer jawabanBenar = 0;

    @Column(name = "is_lulus")
    @Builder.Default
    private Boolean isLulus = false;

    @Column(name = "percobaan_ke")
    @Builder.Default
    private Integer percobaanKe = 1;

    @Column(name = "xp_didapat")
    @Builder.Default
    private Integer xpDidapat = 0;

    @Column(name = "waktu_mulai")
    private LocalDateTime waktuMulai;

    @Column(name = "waktu_selesai")
    private LocalDateTime waktuSelesai;

    @OneToMany(mappedBy = "progress", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JawabanDetail> jawabanDetails = new ArrayList<>();
}
