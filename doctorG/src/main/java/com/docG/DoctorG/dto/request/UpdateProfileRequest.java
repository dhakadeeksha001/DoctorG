package com.docG.DoctorG.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private Integer age;
    private String city;
    private String gender;
}
