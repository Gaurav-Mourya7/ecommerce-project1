package com.halo.ecommerce.Response;

import lombok.Data;

@Data
public class SignupRequest {

    private String email;

    private String fullName;

    private String otp;
}
