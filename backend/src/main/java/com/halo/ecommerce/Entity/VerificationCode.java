package com.halo.ecommerce.Entity;

import com.halo.ecommerce.Request.LoginRequest;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class VerificationCode extends LoginRequest{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String otp;

    private String email;

    @OneToOne
    private User user;

    @OneToOne
    private Seller seller;
}
