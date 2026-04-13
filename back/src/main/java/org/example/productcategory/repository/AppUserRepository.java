package org.example.productcategory.repository;

import org.example.productcategory.entity.AppUser;
import org.example.productcategory.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByRole(Role role);
}
