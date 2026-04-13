package org.example.productcategory.controller;

import org.example.productcategory.entity.AppUser;
import org.example.productcategory.entity.Panier;
import org.example.productcategory.entity.Product;
import org.example.productcategory.repository.AppUserRepository;
import org.example.productcategory.repository.PanierRepository;
import org.example.productcategory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ShopController {

    private final PanierRepository panierRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository appUserRepository;

    public ShopController(
            PanierRepository panierRepository,
            ProductRepository productRepository,
            AppUserRepository appUserRepository
    ) {
        this.panierRepository = panierRepository;
        this.productRepository = productRepository;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping("/panier")
    public Panier getMyPanier(Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        return getOrCreatePanier(user);
    }

    @PostMapping("/panier/products/{productId}")
    public Panier addProductToMyPanier(@PathVariable Long productId, Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        Panier panier = getOrCreatePanier(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        boolean alreadyInPanier = panier.getProducts().stream()
                .anyMatch(existing -> existing.getId().equals(productId));

        if (!alreadyInPanier) {
            panier.getProducts().add(product);
        }

        return panierRepository.save(panier);
    }

    @DeleteMapping("/panier/products/{productId}")
    public Panier removeProductFromMyPanier(@PathVariable Long productId, Authentication authentication) {
        AppUser user = getAuthenticatedUser(authentication);
        Panier panier = getOrCreatePanier(user);

        panier.getProducts().removeIf(product -> product.getId().equals(productId));
        return panierRepository.save(panier);
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {
        return appUserRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user"));
    }

    private Panier getOrCreatePanier(AppUser user) {
        return panierRepository.findByOwnerId(user.getId())
                .orElseGet(() -> {
                    Panier panier = new Panier();
                    panier.setName(user.getUsername() + "-cart");
                    panier.setOwner(user);
                    return panierRepository.save(panier);
                });
    }
}
