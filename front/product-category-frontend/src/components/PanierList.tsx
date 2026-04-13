import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  addProductToPanier,
  createPanier,
  getPaniers,
  getProducts,
  removeProductFromPanier,
} from "../services/api";
import type { Panier, Product } from "../types";

interface PanierListProps {
  refreshKey: number;
  onDataChanged: () => void;
}

export default function PanierList({ refreshKey, onDataChanged }: PanierListProps) {
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [selectedPanierId, setSelectedPanierId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([getPaniers(), getProducts()]).then(([panierList, productList]) => {
      setPaniers(panierList);
      setProducts(productList);
      setSelectedPanierId((prev) => prev || (panierList[0] ? String(panierList[0].id) : ""));
      setSelectedProductId((prev) => prev || (productList[0] ? String(productList[0].id) : ""));
    });
  }, [refreshKey]);

  const selectedPanier = useMemo(
    () => paniers.find((panier) => String(panier.id) === selectedPanierId),
    [paniers, selectedPanierId]
  );

  function formatPrice(value: unknown): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  }

  async function handleCreatePanier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setErrorMessage("Panier name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createPanier({ name: trimmed });
      setName("");
      onDataChanged();
    } catch {
      setErrorMessage("Unable to create panier.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddProduct() {
    if (!selectedPanierId || !selectedProductId) {
      setErrorMessage("Select both a panier and a product.");
      return;
    }

    try {
      setErrorMessage("");
      await addProductToPanier(Number(selectedPanierId), Number(selectedProductId));
      onDataChanged();
    } catch {
      setErrorMessage("Unable to add product to panier.");
    }
  }

  async function handleRemoveProduct(productId: number) {
    if (!selectedPanierId) {
      return;
    }

    try {
      setErrorMessage("");
      await removeProductFromPanier(Number(selectedPanierId), productId);
      onDataChanged();
    } catch {
      setErrorMessage("Unable to remove product from panier.");
    }
  }

  return (
    <div>
      <h2 className="section-title">Paniers</h2>

      <form className="create-form" onSubmit={handleCreatePanier}>
        <label htmlFor="panier-name">New panier</label>
        <div className="create-form-row">
          <input
            id="panier-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Main cart"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      <div className="create-form">
        <label htmlFor="panier-select">Select panier</label>
        <div className="create-form-grid panier-grid">
          <select
            id="panier-select"
            value={selectedPanierId}
            onChange={(event) => setSelectedPanierId(event.target.value)}
          >
            <option value="">Select panier</option>
            {paniers.map((panier) => (
              <option key={panier.id} value={String(panier.id)}>
                {panier.name}
              </option>
            ))}
          </select>

          <select
            id="product-select"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={String(product.id)}>
                {product.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleAddProduct} disabled={!selectedPanierId || !selectedProductId}>
            Add Product
          </button>
        </div>
      </div>

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      {selectedPanier && (
        <div className="product-grid">
          {(selectedPanier.products ?? []).map((product) => (
            <div key={`${selectedPanier.id}-${product.id}`} className="product-card">
              <p className="product-card-name">{product.name}</p>
              <p className="product-card-price">${formatPrice(product.price)}</p>
              <span className="product-card-badge">{product.category?.name ?? "No category"}</span>
              <span className="product-card-supplier">Supplier: {product.supplier?.name ?? "Unknown"}</span>
              <button type="button" onClick={() => handleRemoveProduct(product.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPanier && (selectedPanier.products?.length ?? 0) === 0 && (
        <p className="empty-products">No products in this panier.</p>
      )}
    </div>
  );
}
