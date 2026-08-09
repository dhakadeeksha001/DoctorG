package com.docG.DoctorG.repository;

import com.docG.DoctorG.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    long countByRole(com.docG.DoctorG.entity.Role role);

    java.util.List<User> findByRole(com.docG.DoctorG.entity.Role role);
}