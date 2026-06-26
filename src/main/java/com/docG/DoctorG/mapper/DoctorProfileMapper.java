package com.docG.DoctorG.mapper;

import com.docG.DoctorG.dto.response.DoctorProfileResponse;
import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.User;

public class DoctorProfileMapper {

    public static DoctorProfileResponse toResponse(User user, DoctorProfile profile) {
        DoctorProfileResponse.DoctorProfileResponseBuilder builder = DoctorProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .age(user.getAge())
                .gender(user.getGender())
                .city(user.getCity());

        if (profile != null) {
            builder.specialization(profile.getSpecialization())
                   .experienceYears(profile.getExperienceYears())
                   .qualification(profile.getQualification())
                   .bio(profile.getBio())
                   .clinicAddress(profile.getClinicAddress())
                   .consultationFee(profile.getConsultationFee());
        }

        return builder.build();
    }
}
