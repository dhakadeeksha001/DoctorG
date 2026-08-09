package com.docG.DoctorG.serviceimpl;

import com.docG.DoctorG.dto.request.AddDoctorRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.Role;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.exception.ApiException;
import com.docG.DoctorG.mapper.DoctorProfileMapper;
import com.docG.DoctorG.repository.DoctorProfileRepository;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.repository.RefreshTokenRepository;
import com.docG.DoctorG.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.docG.DoctorG.dto.response.AdminStatsResponse;
import com.docG.DoctorG.dto.response.UserResponse;
import com.docG.DoctorG.mapper.userMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public DoctorProfileResponse addDoctor(AddDoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already exists", HttpStatus.CONFLICT);
        }

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "Doctor@123";
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.DOCTOR)
                .build();

        User savedUser = userRepository.save(user);

        DoctorProfile profile = DoctorProfile.builder()
                .user(savedUser)
                .specialization(request.getSpecialization())
                .build();

        DoctorProfile savedProfile = doctorProfileRepository.save(profile);

        return DoctorProfileMapper.toResponse(savedUser, savedProfile);
    }

    @Override
    @Transactional
    public void deleteDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Doctor user not found", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.DOCTOR) {
            throw new ApiException("User is not a doctor", HttpStatus.BAD_REQUEST);
        }

        // Delete doctor profile if exists
        doctorProfileRepository.findByUser(user)
                .ifPresent(doctorProfileRepository::delete);

        // Delete refresh tokens
        refreshTokenRepository.deleteByUser(user);

        // Delete user
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalDoctors = userRepository.countByRole(Role.DOCTOR);
        
        Set<String> keys = redisTemplate.keys("chat:*");
        long activeSessions = keys != null ? keys.size() : 0;

        return AdminStatsResponse.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .activeSessions(activeSessions)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> getPatients() {
        return userRepository.findByRole(Role.PATIENT)
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }
}
