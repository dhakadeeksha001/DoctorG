package com.docG.DoctorG.dto.request;

import lombok.Data;

@Data
public class UpdateDoctorProfileRequest {
    private Integer age;
    private String gender;
    private String city;
    private Integer experienceYears;
    private String qualification;
    private String bio;
    private String clinicAddress;
    private Double consultationFee;
}
