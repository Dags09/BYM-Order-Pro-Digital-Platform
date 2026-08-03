export interface Category {
    _id: string;
    name: string;
    description?: string;
    createdAt?: string;
}

export interface ProductCategory {
    _id: string;
    name: string;
}

export interface CategoryForm {
    name: string;
    description: string;
}
