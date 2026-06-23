package com.docG.DoctorG.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="patient_cases")
public class PatientCase {

    @Id
    @GeneratedValue
    private UUID id;

    private String sessionId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime createdAt;
}