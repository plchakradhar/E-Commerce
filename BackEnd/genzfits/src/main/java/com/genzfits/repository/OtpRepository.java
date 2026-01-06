package com.genzfits.repository;

import com.genzfits.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    Optional<Otp> findByEmailAndOtpAndUsedFalse(String email, String otp);
    
    Optional<Otp> findByEmailAndUsedFalse(String email);
    
    @Transactional
    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiryTime < :currentTime")
    void deleteExpiredOtps(@Param("currentTime") LocalDateTime currentTime);
    
    @Transactional
    @Modifying
    @Query("UPDATE Otp o SET o.used = true WHERE o.email = :email AND o.otp = :otp")
    void markOtpAsUsed(@Param("email") String email, @Param("otp") String otp);
}