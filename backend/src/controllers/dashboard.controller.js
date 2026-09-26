import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js";
import Feedback from "../models/feedback.model.js";

const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const TREND_DAYS = 14;
const TOP_PRODUCTS_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 5;
const LOW_STOCK_THRESHOLD = 10;

// "Revenue" only counts orders that actually completed — pending/processing/
// shipped haven't been paid out yet, and cancelled never will be.
const REVENUE_STATUS = "delivered";

function dayKey(date) {
    return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Get aggregated stats for the admin dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const trendStart = new Date();
        trendStart.setHours(0, 0, 0, 0);
        trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));

        const [
            revenueAgg,
            ordersByStatusAgg,
            trendAgg,
            customerCount,
            staffCount,
            productAgg,
            totalCategories,
            feedbackAgg,
            topProductsAgg,
            recentOrders,
        ] = await Promise.all([
            Order.aggregate([
                { $match: { status: REVENUE_STATUS } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" },
                        totalOrders: { $sum: 1 },
                    },
                },
            ]),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        status: REVENUE_STATUS,
                        createdAt: { $gte: trendStart },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
            ]),
            User.countDocuments({ role: "customer" }),
            User.countDocuments({ role: "staff" }),
            Product.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        stockValue: {
                            $sum: { $multiply: ["$price", "$stock"] },
                        },
                        lowStock: {
                            $sum: {
                                $cond: [
                                    { $lt: ["$stock", LOW_STOCK_THRESHOLD] },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            Category.countDocuments(),
            Feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: "$rating" },
                        total: { $sum: 1 },
                    },
                },
            ]),
            Order.aggregate([
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        unitsSold: { $sum: "$items.quantity" },
                        revenue: {
                            $sum: {
                                $multiply: ["$items.quantity", "$items.price"],
                            },
                        },
                    },
                },
                { $sort: { revenue: -1 } },
                { $limit: TOP_PRODUCTS_LIMIT },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]),
            Order.find()
                .populate("customer", "firstName lastName")
                .sort({ createdAt: -1 })
                .limit(RECENT_ORDERS_LIMIT)
                .select("totalAmount status createdAt customer"),
        ]);

        // Fill in every status/day so the frontend never has to guess at
        // missing keys — zero counts are real data, not absence of data.
        const countByStatus = Object.fromEntries(
            ordersByStatusAgg.map((s) => [s._id, s.count]),
        );
        const ordersByStatus = ORDER_STATUSES.map((status) => ({
            status,
            count: countByStatus[status] ?? 0,
        }));

        const trendByDay = Object.fromEntries(trendAgg.map((t) => [t._id, t]));
        const revenueTrend = [];
        for (let i = 0; i < TREND_DAYS; i++) {
            const d = new Date(trendStart);
            d.setDate(trendStart.getDate() + i);
            const key = dayKey(d);
            const point = trendByDay[key];
            revenueTrend.push({
                date: key,
                revenue: point?.revenue ?? 0,
                orders: point?.orders ?? 0,
            });
        }

        const topProducts = topProductsAgg
            .filter((p) => p.product)
            .map((p) => ({
                productId: p._id,
                name: p.product.name,
                unitsSold: p.unitsSold,
                revenue: p.revenue,
            }));

        const stats = {
            revenue: {
                total: revenueAgg[0]?.total ?? 0,
                totalOrders: revenueAgg[0]?.totalOrders ?? 0,
            },
            ordersByStatus,
            revenueTrend,
            users: {
                customers: customerCount,
                staff: staffCount,
            },
            products: {
                total: productAgg[0]?.total ?? 0,
                stockValue: productAgg[0]?.stockValue ?? 0,
                lowStock: productAgg[0]?.lowStock ?? 0,
                totalCategories,
            },
            feedback: {
                avgRating: feedbackAgg[0]?.avgRating ?? 0,
                total: feedbackAgg[0]?.total ?? 0,
            },
            topProducts,
            recentOrders,
        };

        res.status(200).json({ stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
