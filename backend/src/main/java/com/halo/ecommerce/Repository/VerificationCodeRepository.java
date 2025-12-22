package com.halo.ecommerce.Repository;

import com.halo.ecommerce.Entity.LoginOtpRequest;
import com.halo.ecommerce.Entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode,Long> {

    VerificationCode findByEmail(String email);

    VerificationCode findByOtp(String otp);
}
