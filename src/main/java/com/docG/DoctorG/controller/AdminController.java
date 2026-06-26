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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
