package com.docG.DoctorG.dto.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String specialization;
    private Integer age;
    private String gender;
    private String city;
    private Integer experienceYears;
    private String qualification;
    private String bio;
    private String clinicAddress;
    private Double consultationFee;
}
