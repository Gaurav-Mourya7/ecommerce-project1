package com.halo.ecommerce.Entity;

import com.halo.ecommerce.Domain.PaymentMethod;
import com.halo.ecommerce.Domain.PaymentOrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long amount;

    private PaymentOrderStatus status = PaymentOrderStatus.PENDING;

    private PaymentMethod paymentMethod;

    private String paymentLinkId;

    @ManyToOne
    private User user;

    @OneToMany
    private  Set<Order> orders = new HashSet<>();
}
