package com.questlearn.entity;

import lombok.*;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "badges")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Badge extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nama;

    @Column(length = 20, unique = true)
    private String kode;

    @Column(length = 500)
    private String deskripsi;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(name = "warna", length = 20)
    @Builder.Default
    private String warna = "#E8A93B";

    @Column(name = "syarat_type", length = 50)
    private String syaratType; // XP, STREAK, LEVEL_COMPLETE, etc

    @Column(name = "syarat_value")
    private Integer syaratValue;

    @Column(name = "xp_bonus")
    @Builder.Default
    private Integer xpBonus = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "badge", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<UserBadge> userBadges = new HashSet<>();
}
