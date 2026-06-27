package com.docG.DoctorG.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "doctor_profiles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String specialization;

    private Integer experienceYears;

    private String qualification;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String clinicAddress;

    private Double consultationFee;
}
