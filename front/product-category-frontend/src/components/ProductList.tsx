import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getCategories, getProducts, getSuppliers } from "../services/api";
import type { Category, Product, Supplier } from "../types";

interface ProductListProps {
  refreshKey: number;
  onDataChanged: () => void;
}

export default function ProductList({ refreshKey, onDataChanged }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState("");
  const [newProductSupplierId, setNewProductSupplierId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [productList, categoryList, supplierList] = await Promise.all([
          getProducts(),
          getCategories(),
          getSuppliers(),
        ]);

        if (!isMounted) {
          return;
        }

        const safeProducts = Array.isArray(productList) ? productList : [];
        const safeCategories = Array.isArray(categoryList) ? categoryList : [];
        const safeSuppliers = Array.isArray(supplierList) ? supplierList : [];

        setProducts(safeProducts);
        setCategories(safeCategories);
        setSuppliers(safeSuppliers);

        setNewProductCategoryId((prev) => prev || (safeCategories[0] ? String(safeCategories[0].id) : ""));
        setNewProductSupplierId((prev) => prev || (safeSuppliers[0] ? String(safeSuppliers[0].id) : ""));
      } catch {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
        setSuppliers([]);
        setErrorMessage("Unable to load products data.");
        setSuccessMessage("");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === "all") {
      return products;
    }

    const categoryId = Number(selectedCategoryId);
    return products.filter((product) => product.category.id === categoryId);
  }, [products, selectedCategoryId]);

  function formatPrice(value: unknown): string {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedPriceInput = price.replace(",", ".");
    const parsedPrice = Number(normalizedPriceInput);

    if (!trimmedName) {
      setErrorMessage("Product name is required.");
      setSuccessMessage("");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage("Price must be a positive number.");
      setSuccessMessage("");
      return;
    }

    if (!newProductCategoryId) {
      setErrorMessage("Select a category for the product.");
      setSuccessMessage("");
      return;
    }

    if (!newProductSupplierId) {
      setErrorMessage("Select a supplier for the product.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await createProduct({
        name: trimmedName,
        price: parsedPrice,
        category: { id: Number(newProductCategoryId) },
        supplier: { id: Number(newProductSupplierId) },
      });
      setName("");
      setPrice("");
      setSuccessMessage("Product created successfully.");
      onDataChanged();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create product.";
      setErrorMessage(message);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(productId: number) {
    try {
      setErrorMessage("");
      await deleteProduct(productId);
      setSuccessMessage("Product deleted.");
      onDataChanged();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete product.";
      setErrorMessage(message);
      setSuccessMessage("");
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
          <select
            id="product-supplier"
            value={newProductSupplierId}
            onChange={(event) => setNewProductSupplierId(event.target.value)}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={String(supplier.id)}>
                {supplier.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={isSubmitting || categories.length === 0 || suppliers.length === 0}>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
        {(categories.length === 0 || suppliers.length === 0) && (
          <p className="form-warning">
            Create at least one category and one supplier before adding a product.
          </p>
        )}
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}
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
            <p className="product-card-price">${formatPrice(product.price)}</p>
            <span className="product-card-badge">{product.category?.name ?? "No category"}</span>
            <span className="product-card-supplier">Supplier: {product.supplier?.name ?? "Unknown"}</span>
            <button type="button" onClick={() => handleDelete(product.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="empty-products">No products found for this category.</p>
      )}
    </div>
  );
}