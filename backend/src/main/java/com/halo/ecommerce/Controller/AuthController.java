package com.halo.ecommerce.Controller;

import com.halo.ecommerce.Domain.USER_ROLE;

import com.halo.ecommerce.Entity.LoginOtpRequest;
import com.halo.ecommerce.Repository.UserRepository;
import com.halo.ecommerce.Request.LoginRequest;
import com.halo.ecommerce.Response.ApiResponse;
import com.halo.ecommerce.Response.AuthResponse;
import com.halo.ecommerce.Response.SignupRequest;
import com.halo.ecommerce.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuthResponse authResponse;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody SignupRequest signupRequest) throws Exception {

        String jwt = authService.createUser(signupRequest);
        authResponse.setJwt(jwt);
        authResponse.setMessage("register success");
        authResponse.setRole(USER_ROLE.ROLE_CUSTOMER);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/sent/login-signup-otp")
    public ResponseEntity<ApiResponse> sentOtpHandler(@RequestBody LoginOtpRequest request) throws Exception {

        String otp = authService.sentLoginOtp(request.getEmail(),request.getRole());
        ApiResponse response = new ApiResponse();
        response.setMessage("otp sent successfully: " + otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signing")
    public ResponseEntity<AuthResponse> loginHandler(@RequestBody LoginRequest loginRequest) throws Exception {

        AuthResponse authResponse = authService.signing(loginRequest);
        return ResponseEntity.ok(authResponse);
    }
}


