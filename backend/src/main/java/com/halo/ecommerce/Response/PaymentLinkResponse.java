package com.halo.ecommerce.Response;

import lombok.Data;

@Data
public class PaymentLinkResponse {

    private String payment_link_url;

    private String getPayment_link_id;
}


