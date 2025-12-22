package com.halo.ecommerce.Service;

import com.halo.ecommerce.Domain.USER_ROLE;
import com.halo.ecommerce.Request.LoginRequest;
import com.halo.ecommerce.Response.AuthResponse;
import com.halo.ecommerce.Response.SignupRequest;

public interface AuthService {

    String sentLoginOtp(String email, USER_ROLE role) throws Exception;

    String createUser(SignupRequest signupRequest) throws Exception;

    AuthResponse signing(LoginRequest loginRequest) throws Exception;
}
