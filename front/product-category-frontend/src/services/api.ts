import type {
    AppUser,
    Category,
    NewCategory,
    NewPanier,
    NewProduct,
    NewSupplier,
    Panier,
    Product,
    Supplier,
    UserRole,
} from "../types";

const API_BASE = "http://localhost:8080/api";
const AUTH_STORAGE_KEY = "pc_auth_token";

let authToken: string | null = null;

export function initializeAuthFromStorage(): void {
    if (typeof window === "undefined") {
        return;
    }

    authToken = localStorage.getItem(AUTH_STORAGE_KEY);
}

export function clearAuthCredentials(): void {
    authToken = null;

    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
}

function persistAuthToken(token: string): void {
    authToken = token;

    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, token);
    }
}

function buildHeaders(includeJson: boolean): HeadersInit {
    const headers: Record<string, string> = {};

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    if (authToken) {
        headers.Authorization = authToken;
    }

    return headers;
}

async function readJsonResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;

        try {
            const payload = await res.json() as { message?: string; error?: string };
            message = payload.message ?? payload.error ?? message;
        } catch {
            // Ignore JSON parse errors and keep fallback status-based message.
        }

        throw new Error(message);
    }

    if (res.status === 204) {
        return null as T;
    }

    return res.json() as Promise<T>;
}

function ensureArray<T>(payload: unknown): T[] {
    return Array.isArray(payload) ? (payload as T[]) : [];
}

export async function login(username: string, password: string): Promise<AppUser> {
    const token = `Basic ${btoa(`${username}:${password}`)}`;
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "GET",
        headers: {
            Authorization: token,
        },
    });

    const user = await readJsonResponse<AppUser>(res);
    persistAuthToken(token);
    return user;
}

export async function getCurrentUser(): Promise<AppUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "GET",
        headers: buildHeaders(false),
    });

    return readJsonResponse<AppUser>(res);
}

export async function registerClient(username: string, password: string): Promise<AppUser> {
    const res = await fetch(`${API_BASE}/auth/register-client`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    return readJsonResponse<AppUser>(res);
}

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`, {
        headers: buildHeaders(false),
    });
    const payload = await readJsonResponse<unknown>(res);
    return ensureArray<Category>(payload);
}

export async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`, {
        headers: buildHeaders(false),
    });
    const payload = await readJsonResponse<unknown>(res);
    return ensureArray<Product>(payload);
}

export async function getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE}/suppliers`, {
        headers: buildHeaders(false),
    });
    const payload = await readJsonResponse<unknown>(res);
    return ensureArray<Supplier>(payload);
}

export async function getPaniers(): Promise<Panier[]> {
    const res = await fetch(`${API_BASE}/paniers`, {
        headers: buildHeaders(false),
    });
    const payload = await readJsonResponse<unknown>(res);
    return ensureArray<Panier>(payload);
}

export async function getMyPanier(): Promise<Panier> {
    const res = await fetch(`${API_BASE}/shop/panier`, {
        headers: buildHeaders(false),
    });

    return readJsonResponse<Panier>(res);
}

export async function createCategory(category: NewCategory): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify(category),
    });

    return readJsonResponse<Category>(res);
}

export async function deleteCategory(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    await readJsonResponse<null>(res);
}

export async function createProduct(product: NewProduct): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify(product),
    });

    return readJsonResponse<Product>(res);
}

export async function deleteProduct(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    await readJsonResponse<null>(res);
}

export async function createSupplier(supplier: NewSupplier): Promise<Supplier> {
    const res = await fetch(`${API_BASE}/suppliers`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify(supplier),
    });

    return readJsonResponse<Supplier>(res);
}

export async function deleteSupplier(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    await readJsonResponse<null>(res);
}

export async function createPanier(panier: NewPanier): Promise<Panier> {
    const res = await fetch(`${API_BASE}/paniers`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify(panier),
    });

    return readJsonResponse<Panier>(res);
}

export async function addProductToPanier(panierId: number, productId: number): Promise<Panier> {
    const res = await fetch(`${API_BASE}/paniers/${panierId}/products/${productId}`, {
        method: "POST",
        headers: buildHeaders(false),
    });

    return readJsonResponse<Panier>(res);
}

export async function removeProductFromPanier(panierId: number, productId: number): Promise<Panier> {
    const res = await fetch(`${API_BASE}/paniers/${panierId}/products/${productId}`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    return readJsonResponse<Panier>(res);
}

export async function addProductToMyPanier(productId: number): Promise<Panier> {
    const res = await fetch(`${API_BASE}/shop/panier/products/${productId}`, {
        method: "POST",
        headers: buildHeaders(false),
    });

    return readJsonResponse<Panier>(res);
}

export async function removeProductFromMyPanier(productId: number): Promise<Panier> {
    const res = await fetch(`${API_BASE}/shop/panier/products/${productId}`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    return readJsonResponse<Panier>(res);
}

export async function getUsers(): Promise<AppUser[]> {
    const res = await fetch(`${API_BASE}/users`, {
        headers: buildHeaders(false),
    });

    const payload = await readJsonResponse<unknown>(res);
    return ensureArray<AppUser>(payload);
}

export async function createAdmin(username: string, password: string): Promise<AppUser> {
    const res = await fetch(`${API_BASE}/users/admins`, {
        method: "POST",
        headers: buildHeaders(true),
        body: JSON.stringify({ username, password }),
    });

    return readJsonResponse<AppUser>(res);
}

export async function updateUserRole(userId: number, role: UserRole): Promise<AppUser> {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: "PATCH",
        headers: buildHeaders(true),
        body: JSON.stringify({ role }),
    });

    return readJsonResponse<AppUser>(res);
}

export async function clearSystemData(): Promise<{
    deletedUsers: number;
    deletedPaniers: number;
    deletedProducts: number;
    deletedCategories: number;
    deletedSuppliers: number;
}> {
    const res = await fetch(`${API_BASE}/users/clear-system`, {
        method: "DELETE",
        headers: buildHeaders(false),
    });

    return readJsonResponse<{
        deletedUsers: number;
        deletedPaniers: number;
        deletedProducts: number;
        deletedCategories: number;
        deletedSuppliers: number;
    }>(res);
}