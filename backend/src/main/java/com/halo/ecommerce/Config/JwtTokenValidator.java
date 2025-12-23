package com.halo.ecommerce.Config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;


import static io.jsonwebtoken.security.Keys.hmacShaKeyFor;

public class JwtTokenValidator extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // skip JWT parsing for OTP verification endpoint
        return path.startsWith("/sellers/verify/otp")
                || path.startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String jwt = request.getHeader("Authorization");

        if(jwt!=null && jwt.startsWith("Bearer")){
            jwt=jwt.substring(7);
            try{
                    SecretKey key = hmacShaKeyFor(JWT_CONSTANT.SECRET_KEY.getBytes());
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(jwt)
                            .getBody();

                    String email = String.valueOf(claims.get("email"));
                    String authorities = String.valueOf(claims.get("authorities"));

                    List<GrantedAuthority> authoritiesList = AuthorityUtils
                            .commaSeparatedStringToAuthorityList(authorities);
                    Authentication authentication = new UsernamePasswordAuthenticationToken(email,null,authoritiesList);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            catch (Exception e) {
                System.out.println("JWT token validation failed: " + e.getMessage());
                e.printStackTrace();
                throw new BadCredentialsException("Invalid JWT token...");
            }
        }
        filterChain.doFilter(request,response);
    }
}
