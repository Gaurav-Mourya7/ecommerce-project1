package com.halo.ecommerce.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.halo.ecommerce.Domain.AccountStatus;
import com.halo.ecommerce.Domain.USER_ROLE;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity

public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String sellerName;


    private String mobile;

    @Column(unique = true,nullable = false)
    private String email;

    private String password;

    @Embedded
    private  BusinessDetails businessDetails = new BusinessDetails();

    @Embedded
    private  BankDetails bankDetails = new BankDetails();

    @OneToOne(cascade = CascadeType.ALL)
    private  Address pickupAddress = new Address();

    private String GSTIN;

    private  USER_ROLE role = USER_ROLE.ROLE_SELLER;

    private boolean isEmailVerified = false;

    private  AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;


}
