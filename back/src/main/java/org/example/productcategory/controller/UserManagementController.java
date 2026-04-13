package org.example.productcategory.controller;

import org.example.productcategory.entity.AppUser;
import org.example.productcategory.entity.Role;
import org.example.productcategory.repository.AppUserRepository;
import org.example.productcategory.repository.CategoryRepository;
import org.example.productcategory.repository.PanierRepository;
import org.example.productcategory.repository.ProductRepository;
import org.example.productcategory.repository.SupplierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserManagementController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PanierRepository panierRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    public UserManagementController(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            PanierRepository panierRepository,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            SupplierRepository supplierRepository
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.panierRepository = panierRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return appUserRepository.findAll().stream()
                .map(user -> new UserResponse(user.getId(), user.getUsername(), user.getRole().name()))
                .toList();
    }

    @PostMapping("/admins")
    public UserResponse createAdmin(@RequestBody CredentialsRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String password = request.password() == null ? "" : request.password().trim();

        if (username.isEmpty() || password.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required");
        }

        if (appUserRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.ADMIN);

        AppUser saved = appUserRepository.save(user);
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getRole().name());
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Role targetRole;
        try {
            targetRole = Role.valueOf(request.role());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }

        if (targetRole == Role.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign SUPERADMIN role");
        }

        if (user.getRole() == Role.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify superadmin role");
        }

        user.setRole(targetRole);
        AppUser saved = appUserRepository.save(user);

        return new UserResponse(saved.getId(), saved.getUsername(), saved.getRole().name());
    }

    @DeleteMapping("/clear-system")
    @Transactional
    public ClearSystemResponse clearSystem() {
        long paniersCount = panierRepository.count();
        long productsCount = productRepository.count();
        long categoriesCount = categoryRepository.count();
        long suppliersCount = supplierRepository.count();

        List<AppUser> usersToDelete = appUserRepository.findAll().stream()
                .filter(user -> user.getRole() != Role.SUPERADMIN)
                .toList();

        List<org.example.productcategory.entity.Panier> paniers = panierRepository.findAll();
        for (org.example.productcategory.entity.Panier panier : paniers) {
            panier.getProducts().clear();
        }
        panierRepository.saveAll(paniers);
        panierRepository.deleteAll();

        productRepository.deleteAll();
        categoryRepository.deleteAll();
        supplierRepository.deleteAll();

        if (!usersToDelete.isEmpty()) {
            appUserRepository.deleteAll(usersToDelete);
        }

        return new ClearSystemResponse(
                usersToDelete.size(),
                paniersCount,
                productsCount,
                categoriesCount,
                suppliersCount
        );
    }

    public record CredentialsRequest(String username, String password) {}
    public record RoleRequest(String role) {}
    public record UserResponse(Long id, String username, String role) {}
    public record ClearSystemResponse(
            long deletedUsers,
            long deletedPaniers,
            long deletedProducts,
            long deletedCategories,
            long deletedSuppliers
    ) {}
}
