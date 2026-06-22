package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.request.LoginRequest;
import com.docG.DoctorG.dto.request.RegisterRequest;
import com.docG.DoctorG.dto.response.AuthResponse;
import com.docG.DoctorG.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.RefreshTokenResponse;
import com.docG.DoctorG.dto.request.RefreshTokenRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok("User Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @RequestBody RefreshTokenRequest request) {
        
        RefreshTokenResponse response = authService.refreshToken(request);

        return ResponseEntity.ok(
                ApiResponse.<RefreshTokenResponse>builder()
                        .success(true)
                        .message("Token refreshed successfully")
                        .data(response)
                        .build());
    }
}
