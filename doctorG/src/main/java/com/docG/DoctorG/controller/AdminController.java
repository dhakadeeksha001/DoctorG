package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.AddDoctorRequest;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.GetMapping;
import com.docG.DoctorG.dto.response.AdminStatsResponse;

import com.docG.DoctorG.dto.response.UserResponse;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        AdminStatsResponse response = adminService.getStats();
        return ResponseEntity.ok(ApiResponse.<AdminStatsResponse>builder()
                .success(true)
                .message("Admin stats fetched successfully")
                .data(response)
                .build());
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getPatients() {
        java.util.List<UserResponse> response = adminService.getPatients();
        return ResponseEntity.ok(ApiResponse.<java.util.List<UserResponse>>builder()
                .success(true)
                .message("Patients fetched successfully")
                .data(response)
                .build());
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> addDoctor(
            @Valid @RequestBody AddDoctorRequest request) {

        DoctorProfileResponse response = adminService.addDoctor(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DoctorProfileResponse>builder()
                        .success(true)
                        .message("Doctor registered successfully")
                        .data(response)
                        .build());
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        adminService.deleteDoctor(id);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Doctor deleted successfully")
                .build());
    }
}
