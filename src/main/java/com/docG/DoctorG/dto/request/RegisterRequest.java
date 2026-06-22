package com.docG.DoctorG.dto.request;

import lombok.*;

@Data
public class RegisterRequest{
    
    private String name;
    private Integer age;
    private String gender;
    private String city;
    private String email;
    private String password;
}