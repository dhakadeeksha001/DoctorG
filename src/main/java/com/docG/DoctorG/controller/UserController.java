package com.docG.DoctorG.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.repository.UserRepository;

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

}