export interface OrderStatusCount {
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    count: number;
}

export interface RevenueTrendPoint {
    date: string; // "YYYY-MM-DD"
    revenue: number;
    orders: number;
}

export interface TopProduct {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
}

export interface RecentOrder {
    _id: string;
    totalAmount: number;
    status: OrderStatusCount["status"];
    createdAt: string;
    customer?: {
        firstName: string;
        lastName: string;
    };
}

export interface DashboardStats {
    revenue: {
        total: number;
        totalOrders: number;
    };
    ordersByStatus: OrderStatusCount[];
    revenueTrend: RevenueTrendPoint[];
    users: {
        customers: number;
        staff: number;
    };
    products: {
        total: number;
        stockValue: number;
        lowStock: number;
        totalCategories: number;
    };
    feedback: {
        avgRating: number;
        total: number;
    };
    topProducts: TopProduct[];
    recentOrders: RecentOrder[];
}
