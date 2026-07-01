package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.BookAppointmentRequest;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.AppointmentResponse;
import com.docG.DoctorG.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/appointments")
@RequiredArgsConstructor
public class PatientAppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            Authentication authentication,
            @Valid @RequestBody BookAppointmentRequest request) {
        
        AppointmentResponse response = appointmentService.bookAppointment(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment booked successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(Authentication authentication) {
        List<AppointmentResponse> response = appointmentService.getPatientAppointments(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .message("Appointments fetched successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            Authentication authentication,
            @PathVariable Long id) {
        
        AppointmentResponse response = appointmentService.cancelAppointment(id, authentication.getName(), false);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment cancelled successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam String time) {
        
        AppointmentResponse response = appointmentService.rescheduleAppointment(id, authentication.getName(), date, time);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment rescheduled successfully")
                .data(response)
                .build());
    }
}
