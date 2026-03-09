import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createProduct, getCategories, getProducts } from "../services/api";
import type { Category, Product } from "../types";

interface ProductListProps {
  refreshKey: number;
  onDataChanged: () => void;
}

export default function ProductList({ refreshKey, onDataChanged }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([productList, categoryList]) => {
      setProducts(productList);
      setCategories(categoryList);

      setNewProductCategoryId((prev) => prev || (categoryList[0] ? String(categoryList[0].id) : ""));
    });
  }, [refreshKey]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products;
    }

    const categoryId = Number(selectedCategoryId);
    return products.filter((product) => product.category.id === categoryId);
  }, [products, selectedCategoryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Price must be a positive number.");
      return;
    }

    if (!newProductCategoryId) {
      setErrorMessage("Select a category for the product.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createProduct({
        name: trimmedName,
        price: parsedPrice,
        category: { id: Number(newProductCategoryId) },
      });
      setName("");
      setPrice("");
      onDataChanged();
    } catch {
      setErrorMessage("Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form className="create-form" onSubmit={handleSubmit}>
        <label htmlFor="product-name">Add product</label>
        <div className="create-form-grid">
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Product name"
          />
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
          />
          <select
            id="product-category"
            value={newProductCategoryId}
            onChange={(event) => setNewProductCategoryId(event.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={isSubmitting || categories.length === 0}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
      </form>

      <div className="products-toolbar">
        <h2 className="section-title">Products</h2>
        <label className="filter-label" htmlFor="category-filter">
          Category
        </label>
        <select
          id="category-filter"
          className="filter-select"
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <p className="product-card-name">{product.name}</p>
            <p className="product-card-price">${product.price.toFixed(2)}</p>
            <span className="product-card-badge">{product.category.name}</span>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="empty-products">No products found for this category.</p>
      )}
    </div>
  );
}