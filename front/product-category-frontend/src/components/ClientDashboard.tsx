import { useEffect, useMemo, useState } from "react";
import { addProductToMyPanier, getMyPanier, getProducts, removeProductFromMyPanier } from "../services/api";
import type { Panier, Product } from "../types";

export default function ClientDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [panier, setPanier] = useState<Panier | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function toUserMessage(error: unknown, fallback: string): string {
    if (!(error instanceof Error)) {
      return fallback;
    }

    const message = error.message.toLowerCase();

    if (message.includes("401") || message.includes("unauthorized")) {
      return "Session expired or account no longer exists. Please log in again.";
    }

    if (message.includes("failed to fetch") || message.includes("network") || message.includes("connect")) {
      return "Backend is unreachable. Make sure Spring Boot is running on port 8080.";
    }

    return error.message || fallback;
  }

  useEffect(() => {
    Promise.all([getProducts(), getMyPanier()])
      .then(([productList, myPanier]) => {
        setProducts(Array.isArray(productList) ? productList : []);
        setPanier(myPanier);
      })
      .catch((error) => setErrorMessage(toUserMessage(error, "Unable to load shop data.")));
  }, []);

  const panierProductIds = useMemo(() => {
    return new Set((panier?.products ?? []).map((product) => product.id));
  }, [panier]);

  async function handleAdd(productId: number) {
    try {
      const updated = await addProductToMyPanier(productId);
      setPanier(updated);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(toUserMessage(error, "Unable to add product to your panier."));
    }
  }

  async function handleRemove(productId: number) {
    try {
      const updated = await removeProductFromMyPanier(productId);
      setPanier(updated);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(toUserMessage(error, "Unable to remove product from your panier."));
    }
  }

  function formatPrice(value: unknown): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  }

  return (
    <>
      <div className="section">
        <h2 className="section-title">Shop Products</h2>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <p className="product-card-name">{product.name}</p>
              <p className="product-card-price">${formatPrice(product.price)}</p>
              <span className="product-card-badge">{product.category?.name ?? "No category"}</span>
              <span className="product-card-supplier">Supplier: {product.supplier?.name ?? "Unknown"}</span>
              <button
                type="button"
                onClick={() => handleAdd(product.id)}
                disabled={panierProductIds.has(product.id)}
              >
                {panierProductIds.has(product.id) ? "In Cart" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">My Panier</h2>
        <div className="product-grid">
          {(panier?.products ?? []).map((product) => (
            <div key={product.id} className="product-card">
              <p className="product-card-name">{product.name}</p>
              <p className="product-card-price">${formatPrice(product.price)}</p>
              <button type="button" onClick={() => handleRemove(product.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        {(panier?.products?.length ?? 0) === 0 && <p className="empty-products">Your panier is empty.</p>}
      </div>

      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </>
  );
}
