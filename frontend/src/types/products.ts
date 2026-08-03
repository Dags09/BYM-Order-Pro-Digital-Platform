export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: { _id?: string; name?: string } | null;
    [key: string]: any;
}

export type ProductLite = Pick<Product, "_id" | "name" | "imageUrl" | "price">;
