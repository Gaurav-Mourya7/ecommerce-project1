package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.Order;
import com.halo.ecommerce.Entity.PaymentOrder;
import com.halo.ecommerce.Entity.User;
import com.razorpay.PaymentLink;
import com.razorpay.RazorpayException;

import java.util.Set;

public interface PaymentService {

    PaymentOrder createOrder(User user, Set<Order> orders);
    PaymentOrder getPaymentOrderById(Long orderId) throws Exception;
    PaymentOrder getPaymentOrderByPaymentId(String orderId) throws Exception;
    Boolean proceedPaymentOrder(PaymentOrder paymentOrder, String paymentId, String paymentLinkId) throws RazorpayException;
    PaymentLink createRazorpayPaymentLink(User user, Long amount, Long orderId) throws Exception;
    String createStripePaymentLink(User user, Long amount, Long orderId);

}
