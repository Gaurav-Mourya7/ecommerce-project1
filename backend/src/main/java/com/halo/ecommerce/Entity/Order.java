package com.halo.ecommerce.Entity;

import com.halo.ecommerce.Domain.OrderStatus;
import com.halo.ecommerce.Domain.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private User user;

    private Long sellerId;

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL,orphanRemoval = true)
    private final List<OrderItem> orderItems =new ArrayList<>();

    @ManyToOne
    private Address shippingAddress;

    @Embedded
    private  PaymentDetails paymentDetails = new PaymentDetails();

    private double totalMrpPrice;

    private Integer totalSellingPrice;

    private Integer discount;

    private OrderStatus orderStatus;

    private int totalItem;

    private  PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private  LocalDateTime orderDate = LocalDateTime.now();

    private  LocalDateTime deliverDate = orderDate.plusDays(7);






}
