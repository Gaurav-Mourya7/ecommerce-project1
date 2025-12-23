package com.halo.ecommerce.Config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class AppConfig implements WebMvcConfigurer {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                .sessionManagement(management ->
                        management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/actuator/**").permitAll()
                        // Public endpoints
                        .requestMatchers(HttpMethod.GET, "/home/categories").permitAll() // homepage display
                        .requestMatchers(HttpMethod.PATCH, "/sellers/verify/otp/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/sellers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/user/products/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*/reviews").permitAll() // <-- Added for public reviews
                        .requestMatchers("/api/static/**").permitAll() // Static image endpoints

                        // Role-based endpoints
                        .requestMatchers(HttpMethod.POST, "/home/categories").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/sellers/**").hasRole("SELLER")
                        .requestMatchers("/users/**").hasRole("CUSTOMER")

                        // API endpoints that require authentication (any role)
                        .requestMatchers("/api/**").authenticated()

                        // Everything else
                        .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtTokenValidator(), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return httpSecurity.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration config = new CorsConfiguration();

//            // ✅ Explicitly list frontend URLs
            config.setAllowedOrigins(Arrays.asList(
                    "https://ashion-sage.vercel.app"
//                    "http://localhost:3000",
//                    "http://127.0.0.1:3000",
//                    "http://localhost:5501",
//                    "http://127.0.0.1:5501"
//
            ));

            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
            config.setExposedHeaders(Arrays.asList("Authorization"));
            config.setAllowCredentials(true); // now works correctly
            config.setMaxAge(3600L);

            return config;
        };
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handle uploaded images separately
        registry.addResourceHandler("/uploaded/**")
                .addResourceLocations("file:src/main/resources/static/images/");
        
        // Ensure default static resources still work (including /images/)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(false);
    }
}