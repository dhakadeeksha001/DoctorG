package com.docG.DoctorG.service;

import com.docG.DoctorG.dto.request.ChangePasswordRequest;
import com.docG.DoctorG.dto.request.UpdateDoctorProfileRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.Role;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.exception.ApiException;
import com.docG.DoctorG.repository.DoctorProfileRepository;
import com.docG.DoctorG.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.docG.DoctorG.serviceimpl.DoctorServiceImpl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    private User user;
    private DoctorProfile profile;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Dr. John")
                .email("john@example.com")
                .password("encodedPassword")
                .role(Role.DOCTOR)
                .build();

        profile = DoctorProfile.builder()
                .id(10L)
                .user(user)
                .specialization("Cardiology")
                .build();
    }

    @Test
    void getProfile_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(doctorProfileRepository.findByUser(user)).thenReturn(Optional.of(profile));

        DoctorProfileResponse response = doctorService.getProfile("john@example.com");

        assertNotNull(response);
        assertEquals("Dr. John", response.getName());
        assertEquals("Cardiology", response.getSpecialization());
    }

    @Test
    void updateProfile_Success() {
        UpdateDoctorProfileRequest updateReq = new UpdateDoctorProfileRequest();
        updateReq.setAge(40);
        updateReq.setGender("Male");
        updateReq.setCity("Boston");
        updateReq.setExperienceYears(15);
        updateReq.setQualification("MD, DM");
        updateReq.setBio("Cardiologist expert");
        updateReq.setClinicAddress("Boston Heart Center");
        updateReq.setConsultationFee(200.0);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(doctorProfileRepository.findByUser(user)).thenReturn(Optional.of(profile));

        DoctorProfileResponse response = doctorService.updateProfile("john@example.com", updateReq);

        assertNotNull(response);
        assertEquals(40, response.getAge());
        assertEquals("Male", response.getGender());
        assertEquals("Boston", response.getCity());
        assertEquals(15, response.getExperienceYears());
        assertEquals("MD, DM", response.getQualification());
        assertEquals("Cardiologist expert", response.getBio());
        assertEquals("Boston Heart Center", response.getClinicAddress());
        assertEquals(200.0, response.getConsultationFee());

        verify(userRepository).save(user);
        verify(doctorProfileRepository).save(profile);
    }

    @Test
    void changePassword_Success() {
        ChangePasswordRequest passwordReq = new ChangePasswordRequest();
        passwordReq.setCurrentPassword("Doctor@123");
        passwordReq.setNewPassword("NewSecret@456");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Doctor@123", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewSecret@456")).thenReturn("newEncodedPassword");

        doctorService.changePassword("john@example.com", passwordReq);

        assertEquals("newEncodedPassword", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_WrongCurrentPassword_ThrowsException() {
        ChangePasswordRequest passwordReq = new ChangePasswordRequest();
        passwordReq.setCurrentPassword("WrongPassword");
        passwordReq.setNewPassword("NewSecret@456");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(ApiException.class, () -> doctorService.changePassword("john@example.com", passwordReq));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void searchDoctors_Success() {
        java.util.List<DoctorProfile> mockProfiles = java.util.List.of(profile);
        when(doctorProfileRepository.searchDoctors("Boston", "Cardiology")).thenReturn(mockProfiles);

        java.util.List<DoctorProfileResponse> results = doctorService.searchDoctors("Boston", "Cardiology");

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Dr. John", results.get(0).getName());
        assertEquals("Cardiology", results.get(0).getSpecialization());

        verify(doctorProfileRepository).searchDoctors("Boston", "Cardiology");
    }
}
