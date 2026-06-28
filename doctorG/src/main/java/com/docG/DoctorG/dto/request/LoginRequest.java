package com.docG.DoctorG.dto.request;

import lombok.*;

@Data
public class LoginRequest {
    
    private String email;
    private String password;
}