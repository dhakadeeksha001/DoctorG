package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.ChangePasswordRequest;
import com.docG.DoctorG.dto.request.UpdateDoctorProfileRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;

import java.util.List;

public interface DoctorService {
    DoctorProfileResponse getProfile(String email);
    DoctorProfileResponse updateProfile(String email, UpdateDoctorProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    List<DoctorProfileResponse> searchDoctors(String city, String specialization);
}
