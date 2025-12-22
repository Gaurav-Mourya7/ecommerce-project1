package com.halo.ecommerce.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String code;

    private double discountPercentage;

    private LocalDate validateStartDate;

    private LocalDate validateEndDate;

    private double minimumOrderValue;

    private final boolean isActive=true;

    @ManyToMany(mappedBy = "usedCoupons")
    private final Set<User> usedByUsers = new HashSet<>();

}
