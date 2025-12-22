package com.halo.ecommerce.Entity;

import com.halo.ecommerce.Domain.USER_ROLE;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class LoginOtpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String otp;

    private String email;

    @OneToOne
    private User user;

    @OneToOne
    private Seller seller;

    private USER_ROLE role;

}
