package com.halo.ecommerce.Service;

import com.halo.ecommerce.Entity.User;

public interface UserService {

    User findUserByJwtToken(String jwt) throws Exception;
    User findUserByEmail(String email) throws Exception;
}
