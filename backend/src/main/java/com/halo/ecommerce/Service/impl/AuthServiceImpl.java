package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Config.JwtProvider;
import com.halo.ecommerce.Domain.USER_ROLE;
import com.halo.ecommerce.Entity.*;
import com.halo.ecommerce.Repository.CartRepository;
import com.halo.ecommerce.Repository.SellerRepository;
import com.halo.ecommerce.Repository.UserRepository;
import com.halo.ecommerce.Repository.VerificationCodeRepository;
import com.halo.ecommerce.Request.LoginRequest;
import com.halo.ecommerce.Response.AuthResponse;
import com.halo.ecommerce.Response.SignupRequest;
import com.halo.ecommerce.Service.AuthService;
import com.halo.ecommerce.Service.EmailService;
import com.halo.ecommerce.Utils.OtpUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;



@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final JwtProvider jwtProvider;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final AuthResponse authResponse;
    private final CustomUserServiceImpl customUserService;
    private final SellerRepository sellerRepository;


    @Override
    public String sentLoginOtp(String email,USER_ROLE role) throws Exception {

        // Prefix-free: accept raw email; legacy support if prefixed
        String SIGNING_PREFIX = "signing_";
        if (email.startsWith(SIGNING_PREFIX)) {
            email = email.substring(SIGNING_PREFIX.length());
        }
        if (role.equals(USER_ROLE.ROLE_SELLER)) {
            Seller seller = sellerRepository.findByEmail(email);
            if(seller==null){
                throw new Exception("seller not found");
            }
        } else {
            // For customer flow, allow sending OTP even if the user doesn't exist yet (signup case)
            // If the user exists, it's a login flow; either way, proceed to send OTP.
            // No existence check/exception for customers here to support signup.
        }

        VerificationCode isExist = verificationCodeRepository.findByEmail(email);
        if (isExist!=null){
            verificationCodeRepository.delete(isExist);
        }
        String otp = OtpUtil.generateOtp();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(email);
        verificationCodeRepository.save(verificationCode);

        String subject = "Gaurav market login/signup otp";
        String text = "Your login/signup otp is:"+otp;

        try {
            emailService.sendVerificationOtpEmail(email,otp,subject,text);
        } catch (Exception ignore) {
            // In dev, we still return OTP even if email sending fails
        }
        return otp;
    }

    public String createUser(SignupRequest signupRequest) throws Exception {

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(signupRequest.getEmail());
        if(verificationCode==null || !verificationCode.getOtp().equals(signupRequest.getOtp())){
            throw new Exception("wrong otp...");
        }
        User user = userRepository.findByEmail(signupRequest.getEmail());

        if (user==null) {
            User createdUser = new User();
            createdUser.setFullName(signupRequest.getFullName());
            createdUser.setEmail(signupRequest.getEmail());
            createdUser.setRole(USER_ROLE.ROLE_CUSTOMER);
            createdUser.setMobile("8964765423");
            createdUser.setPassword(passwordEncoder.encode(signupRequest.getOtp()));

            user = userRepository.save(createdUser);

            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_CUSTOMER.toString()));

        Authentication authentication = new UsernamePasswordAuthenticationToken(signupRequest.getEmail(),null,authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtProvider.generateToken(authentication);
    }

    @Override
    public AuthResponse signing(LoginRequest loginRequest) throws Exception {

        String username = loginRequest.getEmail();
        String otp = loginRequest.getOtp();
        Authentication authentication = authenticate(username,otp);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);
        authResponse.setJwt(token);
        authResponse.setMessage("Login success");

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roleName = authorities.isEmpty()?null:authorities.iterator().next().getAuthority();

        authResponse.setRole(USER_ROLE.valueOf(roleName));
        return authResponse;
    }

    private Authentication authenticate(String username, String otp) throws Exception {
        UserDetails userDetails = customUserService.loadUserByUsername(username);

        String SELLER_PREFIX="seller_";
        if (username.startsWith(SELLER_PREFIX)){
            username = username.substring(SELLER_PREFIX.length());
        }
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username");
        }

        VerificationCode code = verificationCodeRepository.findByEmail(username);
        if (code == null || !code.getOtp().equals(otp)) {
            throw new Exception("Invalid OTP");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }


}