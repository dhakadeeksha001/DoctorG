package com.docG.DoctorG.repository;

import com.docG.DoctorG.entity.RefreshToken;
import com.docG.DoctorG.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}
