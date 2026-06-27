package com.docG.DoctorG.repository;

import com.docG.DoctorG.entity.DoctorProfile;
import com.docG.DoctorG.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(User user);
    Optional<DoctorProfile> findByUserEmail(String email);

    @Query("SELECT d FROM DoctorProfile d JOIN d.user u WHERE " +
           "(:city IS NULL OR :city = '' OR LOWER(u.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:specialization IS NULL OR :specialization = '' OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')))")
    List<DoctorProfile> searchDoctors(@Param("city") String city, @Param("specialization") String specialization);
}
