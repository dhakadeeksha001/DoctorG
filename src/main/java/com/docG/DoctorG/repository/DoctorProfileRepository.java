package com.docG.DoctorG.repository;

import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(User user);
    Optional<DoctorProfile> findByUserEmail(String email);
}
