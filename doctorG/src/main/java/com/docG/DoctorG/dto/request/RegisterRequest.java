package com.docG.DoctorG.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
public class RegisterRequest{
    
    private String name;
    private String email;
    private String password;
}