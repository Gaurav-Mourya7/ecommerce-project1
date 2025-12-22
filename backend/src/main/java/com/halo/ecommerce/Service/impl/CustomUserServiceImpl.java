package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Domain.USER_ROLE;
import com.halo.ecommerce.Entity.Seller;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.SellerRepository;
import com.halo.ecommerce.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CustomUserServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private static final String  SELLER_PREFIX="seller_";

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.startsWith(SELLER_PREFIX)){
            String actualUsername = username.substring(SELLER_PREFIX.length());
            Seller seller = sellerRepository.findByEmail(actualUsername);

            if(seller!=null){
                return builderUserDetails(seller.getEmail(),seller.getPassword(),seller.getRole());
            }
        }
        // Prefix-free: first try seller by plain email, then fallback to customer
        Seller seller = sellerRepository.findByEmail(username);
        if (seller != null) {
            return builderUserDetails(seller.getEmail(), seller.getPassword(), seller.getRole());
        }
        User user = userRepository.findByEmail(username);
        if(user!=null){
            return builderUserDetails(user.getEmail(),user.getPassword(),user.getRole());
        }
        throw new UsernameNotFoundException("user or seller not found with email"+username);
    }

    private UserDetails builderUserDetails(String email, String password, USER_ROLE role) {
        if(role==null){
            role = USER_ROLE.ROLE_CUSTOMER;
        }
        List<GrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority(role.toString()));

        return new org.springframework.security.core.userdetails.User(email,password,authorityList);
    }
}
