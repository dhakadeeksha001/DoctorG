package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.*;
import com.docG.DoctorG.dto.response.*;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.entity.Role;
import com.docG.DoctorG.entity.RefreshToken;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.repository.RefreshTokenRepository;
import com.docG.DoctorG.security.jwt.JwtService;
import com.docG.DoctorG.mapper.userMapper;
import com.docG.DoctorG.exception.ApiException;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already exists", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(Role.PATIENT)
                .build();

        repository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        User user = repository.findByEmail(
                        request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid Credentials", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new ApiException("Invalid Credentials", HttpStatus.UNAUTHORIZED);
        }

        String token =
                jwtService.generateToken(user.getEmail(), user.getRole().name());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .creationDate(Instant.now())
                .expiryDate(Instant.now().plusSeconds(2592000)) // 30 days
                .build();
        
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toUserResponse(user))
                .build();
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException("Refresh token was expired. Please sign in again", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        String accessToken = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .build();
    }
    
}
