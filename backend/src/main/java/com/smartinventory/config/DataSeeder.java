package com.smartinventory.config;

import com.smartinventory.entity.AppUser;
import com.smartinventory.entity.Role;
import com.smartinventory.entity.RoleName;
import com.smartinventory.repository.RoleRepository;
import com.smartinventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {
    private final RoleRepository roles;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        for (RoleName n : RoleName.values()) {
            if (roles.findByName(n).isEmpty()) { Role r = new Role(); r.setName(n); roles.save(r); }
        }
        if (users.count() > 0) return;
        if (adminEmail.isBlank() || adminPassword.length() < 8) {
            throw new IllegalStateException("No users exist yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) to create the first admin.");
        }
        AppUser u = new AppUser();
        u.setFullName("Administrator");
        u.setEmail(adminEmail.trim().toLowerCase());
        u.setPasswordHash(encoder.encode(adminPassword));
        u.getRoles().add(roles.findByName(RoleName.ADMIN).orElseThrow());
        users.save(u);
    }
}
