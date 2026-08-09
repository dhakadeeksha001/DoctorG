package com.docG.DoctorG.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private Long patientId;
    private String patientName;
    private String appointmentDate;
    private String appointmentTime;
    private String status;
    private String reason;
    private Integer patientAge;
    private String patientGender;
}
