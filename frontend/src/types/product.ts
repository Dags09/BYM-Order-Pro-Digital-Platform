export type Product = {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    createdAt?: string;
    category?: { _id?: string; name?: string } | null;
    [key: string]: any;
};
