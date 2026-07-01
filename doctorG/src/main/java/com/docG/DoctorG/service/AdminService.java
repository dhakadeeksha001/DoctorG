package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.AddDoctorRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;

import com.docG.DoctorG.dto.response.AdminStatsResponse;

public interface AdminService {
    DoctorProfileResponse addDoctor(AddDoctorRequest request);
    void deleteDoctor(Long userId);
    AdminStatsResponse getStats();
    java.util.List<com.docG.DoctorG.dto.response.UserResponse> getPatients();
}
