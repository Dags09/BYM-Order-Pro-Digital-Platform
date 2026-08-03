import api from "../lib/axios";
interface ProductFormData {
    name: string;
    description: string;
    price: number;
    stock: number;
}
export const getProducts = () => api.get("/product");
export const createProduct = (formData: ProductFormData) =>
    api.post("/product", formData);
export const updateProduct = (id: string, formData: ProductFormData) =>
    api.put(`/product/${id}`, formData);
export const deleteProduct = (id: string) => api.delete(`/product/${id}`);
export const addStock = (id: string, quantity: number) =>
    api.put(`/product/${id}/add-stock`, { quantity });
