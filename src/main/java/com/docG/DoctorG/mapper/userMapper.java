package com.docG.DoctorG.mapper;

import com.docG.DoctorG.dto.response.UserResponse;
import com.docG.DoctorG.entity.User;

public class userMapper {

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .city(user.getCity())
                .age(user.getAge())
                .gender(user.getGender())
                .build();
    }
}