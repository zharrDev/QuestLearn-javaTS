package com.questlearn.entity;

import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dunia")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@SQLDelete(sql = "UPDATE dunia SET deleted_at = NOW() WHERE id=?")
@Where(clause = "deleted_at IS NULL")
public class Dunia extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nama;

    @Column(length = 100)
    @Builder.Default
    private String slug = "";

    @Column(length = 500)
    private String deskripsi;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(name = "background_color", length = 20)
    @Builder.Default
    private String backgroundColor = "#D97757";

    @Column(name = "urutan")
    @Builder.Default
    private Integer urutan = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "dunia", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("urutan ASC")
    @Builder.Default
    private List<Level> levels = new ArrayList<>();
}
