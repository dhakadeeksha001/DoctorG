package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.AddDoctorRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;

public interface AdminService {
    DoctorProfileResponse addDoctor(AddDoctorRequest request);
    void deleteDoctor(Long userId);
}
