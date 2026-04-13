package org.example.productcategory.repository;

import org.example.productcategory.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PanierRepository extends JpaRepository<Panier, Long> {
	Optional<Panier> findByOwnerId(Long ownerId);
}
