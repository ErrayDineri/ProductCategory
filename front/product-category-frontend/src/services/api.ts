import type { Category, NewCategory, NewProduct, Product } from "../types";

const API_BASE = "http://localhost:8080/api";

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
}

export async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
}

export async function createCategory(category: NewCategory): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
    });

    if (!res.ok) {
        throw new Error("Failed to create category");
    }

    return res.json();
}

export async function createProduct(product: NewProduct): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
    });

    if (!res.ok) {
        throw new Error("Failed to create product");
    }

    return res.json();
}