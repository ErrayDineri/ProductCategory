export interface Category {
    id: number;
    name: string;
}

export interface Supplier {
    id: number;
    name: string;
}

export interface NewCategory {
    name: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    category: Category;
    supplier: Supplier;
}

export interface NewProduct {
    name: string;
    price: number;
    category: Pick<Category, "id">;
    supplier: Pick<Supplier, "id">;
}

export interface NewSupplier {
    name: string;
}

export interface Panier {
    id: number;
    name: string;
    products: Product[];
}

export interface NewPanier {
    name: string;
}

export type UserRole = "SUPERADMIN" | "ADMIN" | "CLIENT";

export interface AppUser {
    id: number;
    username: string;
    role: UserRole;
}