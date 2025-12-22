package com.halo.ecommerce.Response;

import com.halo.ecommerce.Domain.USER_ROLE;
import lombok.Data;
import org.springframework.stereotype.Component;

@Component
@Data
public class AuthResponse {

    private String jwt;
    private String message;
    private USER_ROLE role;
}
