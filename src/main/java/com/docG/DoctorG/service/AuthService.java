package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.*;
import com.docG.DoctorG.dto.response.*;
import com.docG.DoctorG.entity.user;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.security.jwt.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        user user = com.docG.DoctorG.entity.user.builder()
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .city(request.getCity())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .build();

        repository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        user user = repository.findByEmail(
                        request.getEmail())
                .orElseThrow();

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid Credentials");
        }

        String token =
                jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }
    
}