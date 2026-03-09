export interface Category {
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
}

export interface NewProduct {
    name: string;
    price: number;
    category: Pick<Category, "id">;
}