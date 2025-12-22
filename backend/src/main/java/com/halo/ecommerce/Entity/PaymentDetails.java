package com.halo.ecommerce.Entity;

import com.halo.ecommerce.Domain.PaymentStatus;

import lombok.Data;

@Data
public class PaymentDetails {

   private String paymentId;

   private String razorpayPaymentLinkId;

   private String razorpayPaymentLinkReferenceId;

   private String razorpayPaymentLinkStatus;

   private String razorpayPaymentId;

   private PaymentStatus status;
}
