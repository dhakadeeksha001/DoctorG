package com.docG.DoctorG.serviceimpl;

import com.docG.DoctorG.dto.request.ChangePasswordRequest;
import com.docG.DoctorG.dto.request.UpdateDoctorProfileRequest;
import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.User;
import com.docG.DoctorG.exception.ApiException;
import com.docG.DoctorG.mapper.DoctorProfileMapper;
import com.docG.DoctorG.repository.DoctorProfileRepository;
import com.docG.DoctorG.repository.UserRepository;
import com.docG.DoctorG.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        DoctorProfile profile = doctorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND));

        return DoctorProfileMapper.toResponse(user, profile);
    }

    @Override
    @Transactional
    public DoctorProfileResponse updateProfile(String email, UpdateDoctorProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        DoctorProfile profile = doctorProfileRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND));

        // Update User info
        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        userRepository.save(user);

        // Update Doctor Profile info
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getQualification() != null) {
            profile.setQualification(request.getQualification());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getClinicAddress() != null) {
            profile.setClinicAddress(request.getClinicAddress());
        }
        if (request.getConsultationFee() != null) {
            profile.setConsultationFee(request.getConsultationFee());
        }
        doctorProfileRepository.save(profile);

        return DoctorProfileMapper.toResponse(user, profile);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException("Current password does not match", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorProfileResponse> searchDoctors(String city, String specialization) {
        return doctorProfileRepository.searchDoctors(city, specialization)
                .stream()
                .map(profile -> DoctorProfileMapper.toResponse(profile.getUser(), profile))
                .toList();
    }
}
