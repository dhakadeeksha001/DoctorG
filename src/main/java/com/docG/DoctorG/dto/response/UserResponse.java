package com.docG.DoctorG.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String city;
    private Integer age;
    private String gender;
}