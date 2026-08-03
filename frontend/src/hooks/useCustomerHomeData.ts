import { useEffect, useState } from "react";
import api from "../lib/axios";
import type { Order } from "../types/orders";
import type { Product } from "../types/products";

type CategoryItem = {
    _id: string;
    name: string;
};

export default function useCustomerHomeData() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [pRes, cRes, oRes] = await Promise.all([
                api.get("/product/get-all-products"),
                api.get("/category/get-all-categories"),
                api.get("/order/my-orders"),
            ]);

            setProducts((pRes.data as Product[]) ?? []);
            setCategories((cRes.data as CategoryItem[]) ?? []);
            setOrders((oRes.data as Order[]) ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        products,
        categories,
        orders,
        loading,
        setOrders,
        loadData,
    };
}

export { useCustomerHomeData };
