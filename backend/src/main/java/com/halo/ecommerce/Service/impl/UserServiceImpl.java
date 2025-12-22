package com.halo.ecommerce.Service.impl;

import com.halo.ecommerce.Config.JwtProvider;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.UserRepository;
import com.halo.ecommerce.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    @Override
    public User findUserByJwtToken(String jwt) throws Exception {
        String email = jwtProvider.getEmailFromJwtToken(jwt);

        return this.findUserByEmail(email);
    }

    @Override
    public User findUserByEmail(String email) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user==null){
            throw new Exception("user not found with email:"+email);
        }
        return user;
    }
}
