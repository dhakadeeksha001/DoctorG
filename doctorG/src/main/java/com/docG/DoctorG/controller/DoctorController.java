package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.ChangePasswordRequest;
import com.docG.DoctorG.dto.request.UpdateDoctorProfileRequest;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        DoctorProfileResponse response = doctorService.getProfile(email);

        return ResponseEntity.ok(ApiResponse.<DoctorProfileResponse>builder()
                .success(true)
                .message("Profile fetched successfully")
                .data(response)
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<DoctorProfileResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateDoctorProfileRequest request) {
        String email = authentication.getName();
        DoctorProfileResponse response = doctorService.updateProfile(email, request);

        return ResponseEntity.ok(ApiResponse.<DoctorProfileResponse>builder()
                .success(true)
                .message("Profile completed/updated successfully")
                .data(response)
                .build());
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        doctorService.changePassword(email, request);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Password updated successfully")
                .build());
    }
}
