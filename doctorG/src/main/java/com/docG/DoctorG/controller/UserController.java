package com.docG.DoctorG.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.dto.request.UpdateProfileRequest;

import lombok.RequiredArgsConstructor;
import com.docG.DoctorG.dto.response.ApiResponse;
import com.docG.DoctorG.dto.response.UserResponse;
import com.docG.DoctorG.mapper.userMapper;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository repository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication){
        User user = repository.findByEmail(
                            authentication.getName()
                        )
                        .orElseThrow();

        UserResponse response =
                userMapper.toUserResponse(user);
        
        return ResponseEntity.ok(
            ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("User fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        User user = repository.findByEmail(
                            authentication.getName()
                        )
                        .orElseThrow();

        user.setName(request.getName());
        user.setAge(request.getAge());
        user.setCity(request.getCity());
        user.setGender(request.getGender());

        User updatedUser = repository.save(user);

        UserResponse response = userMapper.toUserResponse(updatedUser);

        return ResponseEntity.ok(
            ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("User profile updated successfully")
                        .data(response)
                        .build()
        );
    }

}