package org.example.productcategory.controller;

import org.example.productcategory.entity.Panier;
import org.example.productcategory.entity.Product;
import org.example.productcategory.repository.PanierRepository;
import org.example.productcategory.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/paniers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PanierController {

    private final PanierRepository panierRepository;
    private final ProductRepository productRepository;

    public PanierController(PanierRepository panierRepository, ProductRepository productRepository) {
        this.panierRepository = panierRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Panier> getAll() {
        return panierRepository.findAll();
    }

    @PostMapping
    public Panier create(@RequestBody Panier panier) {
        return panierRepository.save(panier);
    }

    @PostMapping("/{panierId}/products/{productId}")
    public Panier addProduct(
            @PathVariable Long panierId,
            @PathVariable Long productId
    ) {
        Panier panier = panierRepository.findById(panierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Panier not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        panier.getProducts().add(product);
        return panierRepository.save(panier);
    }

    @DeleteMapping("/{panierId}/products/{productId}")
    public Panier removeProduct(
            @PathVariable Long panierId,
            @PathVariable Long productId
    ) {
        Panier panier = panierRepository.findById(panierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Panier not found"));

        boolean removed = panier.getProducts().removeIf(product -> product.getId().equals(productId));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not in panier");
        }

        return panierRepository.save(panier);
    }
}
