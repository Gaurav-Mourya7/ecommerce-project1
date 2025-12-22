package com.halo.ecommerce.Config;

import com.halo.ecommerce.Domain.USER_ROLE;
import com.halo.ecommerce.Entity.User;
import com.halo.ecommerce.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    @Value("${app.admin.create-if-missing:true}")
    private boolean createIfMissing;

    @Override
    public void run(String... args) throws Exception {
        if (adminEmail == null || adminEmail.isBlank()) {
            return; // disabled
        }

        User existing = userRepository.findByEmail(adminEmail);
        if (existing != null) {
            if (existing.getRole() != USER_ROLE.ROLE_ADMIN) {
                existing.setRole(USER_ROLE.ROLE_ADMIN);
                // keep existing password; login flow uses OTP anyway
                userRepository.save(existing);
                log.info("Promoted existing user {} to ROLE_ADMIN", adminEmail);
            }
            return;
        }

        if (!createIfMissing) {
            log.warn("Admin user not found and create-if-missing=false. Skipping admin creation for {}", adminEmail);
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setFullName(adminName);
        admin.setRole(USER_ROLE.ROLE_ADMIN);
        // Set a placeholder password; app uses OTP login for auth
        admin.setPassword(passwordEncoder.encode("admin_placeholder_password"));
        admin.setMobile("0000000000");
        userRepository.save(admin);
        log.info("Created admin user {} with ROLE_ADMIN", adminEmail);
    }
}


