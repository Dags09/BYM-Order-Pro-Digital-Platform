import api from "../lib/axios";

export const getDashboardStats = async () => {
    const [orders, products, users] = await Promise.all([
        api.get("/order"),
        api.get("/product/get-all-products"),
        api.get("/v1/staff"),
    ]);
    return {
        orders: orders.data,
        products: products.data,
        users: users.data,
    };
};