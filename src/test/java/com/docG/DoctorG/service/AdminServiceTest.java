package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.AddDoctorRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.Role;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.exception.ApiException;
import com.docG.DoctorG.repository.DoctorProfileRepository;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private AddDoctorRequest request;

    @BeforeEach
    void setUp() {
        request = new AddDoctorRequest();
        request.setName("Dr. John");
        request.setEmail("john@example.com");
        request.setSpecialization("Cardiology");
    }

    @Test
    void addDoctor_Success() {
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        User user = User.builder()
                .id(1L)
                .name(request.getName())
                .email(request.getEmail())
                .password("encodedPassword")
                .role(Role.DOCTOR)
                .build();

        DoctorProfile profile = DoctorProfile.builder()
                .id(10L)
                .user(user)
                .specialization(request.getSpecialization())
                .build();

        when(userRepository.save(any(User.class))).thenReturn(user);
        when(doctorProfileRepository.save(any(DoctorProfile.class))).thenReturn(profile);

        DoctorProfileResponse response = adminService.addDoctor(request);

        assertNotNull(response);
        assertEquals("Dr. John", response.getName());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("Cardiology", response.getSpecialization());
        assertEquals("DOCTOR", response.getRole());

        verify(userRepository).save(any(User.class));
        verify(doctorProfileRepository).save(any(DoctorProfile.class));
    }

    @Test
    void addDoctor_EmailExists_ThrowsException() {
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(ApiException.class, () -> adminService.addDoctor(request));

        verify(userRepository, never()).save(any(User.class));
        verify(doctorProfileRepository, never()).save(any(DoctorProfile.class));
    }

    @Test
    void deleteDoctor_Success() {
        User user = User.builder()
                .id(1L)
                .name("Dr. John")
                .email("john@example.com")
                .role(Role.DOCTOR)
                .build();
        DoctorProfile profile = DoctorProfile.builder()
                .id(10L)
                .user(user)
                .specialization("Cardiology")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(doctorProfileRepository.findByUser(user)).thenReturn(Optional.of(profile));

        adminService.deleteDoctor(1L);

        verify(doctorProfileRepository).delete(profile);
        verify(refreshTokenRepository).deleteByUser(user);
        verify(userRepository).delete(user);
    }

    @Test
    void deleteDoctor_UserNotDoctor_ThrowsException() {
        User user = User.builder()
                .id(1L)
                .name("Patient User")
                .email("patient@example.com")
                .role(Role.PATIENT)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(ApiException.class, () -> adminService.deleteDoctor(1L));

        verify(doctorProfileRepository, never()).delete(any(DoctorProfile.class));
        verify(refreshTokenRepository, never()).deleteByUser(any(User.class));
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void deleteDoctor_NotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ApiException.class, () -> adminService.deleteDoctor(99L));
    }
}
