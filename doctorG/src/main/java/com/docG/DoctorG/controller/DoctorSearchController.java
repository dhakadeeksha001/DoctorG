package com.docG.DoctorG.controller;

import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorSearchController {

    private final DoctorService doctorService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DoctorProfileResponse>>> searchDoctors(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization) {

        List<DoctorProfileResponse> response = doctorService.searchDoctors(city, specialization);

        return ResponseEntity.ok(ApiResponse.<List<DoctorProfileResponse>>builder()
                .success(true)
                .message("Doctors searched successfully")
                .data(response)
                .build());
    }
}
