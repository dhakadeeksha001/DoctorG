package com.docG.DoctorG.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotBlank(message = "Appointment date is required")
    private String appointmentDate; // format: YYYY-MM-DD

    @NotBlank(message = "Appointment time is required")
    private String appointmentTime; // format: HH:MM AM/PM or similar

    private String reason;
}
