package org.example.productcategory.config;

import org.example.productcategory.entity.AppUser;
import org.example.productcategory.entity.Role;
import org.example.productcategory.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminInitializer(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.existsByRole(Role.SUPERADMIN)) {
            return;
        }

        AppUser superAdmin = new AppUser();
        superAdmin.setUsername("superadmin");
        superAdmin.setPassword(passwordEncoder.encode("superadmin123"));
        superAdmin.setRole(Role.SUPERADMIN);

        appUserRepository.save(superAdmin);
        System.out.println("Created default superadmin user: superadmin / superadmin123");
    }
}
