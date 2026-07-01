package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.AppointmentResponse;
import com.docG.DoctorG.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/appointments")
@RequiredArgsConstructor
public class DoctorAppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(Authentication authentication) {
        List<AppointmentResponse> response = appointmentService.getDoctorAppointments(authentication.getName());
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .message("Doctor appointments fetched successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String status) {
        
        AppointmentResponse response = appointmentService.updateAppointmentStatus(id, authentication.getName(), status);
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment status updated successfully")
                .data(response)
                .build());
    }
}
