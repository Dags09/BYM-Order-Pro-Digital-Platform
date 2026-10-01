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

function manilaDayKey(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value]),
    );
    return `${values.year}-${values.month}-${values.day}`;
}

// Get revenue + top products for an arbitrary date range — kept separate
// from getDashboardStats so switching the dashboard's date filter doesn't
// have to re-run the heavier all-time aggregates on every click.
export const getRevenueSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const interval = req.query.interval === "hour" ? "hour" : "day";
        const dateMatch = {};
        if (from) dateMatch.$gte = new Date(from);
        if (to) dateMatch.$lte = new Date(to);
        const hasRange = Object.keys(dateMatch).length > 0;

        const [
            revenueAgg,
            topProductsAgg,
            ordersByStatusAgg,
            trendAgg,
            productSalesAgg,
        ] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        status: REVENUE_STATUS,
                        ...(hasRange && { createdAt: dateMatch }),
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" },
                        totalOrders: { $sum: 1 },
                    },
                },
            ]),
            Order.aggregate([
                ...(hasRange ? [{ $match: { createdAt: dateMatch } }] : []),
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
            Order.aggregate([
                ...(hasRange ? [{ $match: { createdAt: dateMatch } }] : []),
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        status: REVENUE_STATUS,
                        ...(hasRange && { createdAt: dateMatch }),
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format:
                                    interval === "hour"
                                        ? "%Y-%m-%dT%H"
                                        : "%Y-%m-%d",
                                date: "$createdAt",
                                timezone: "Asia/Manila",
                            },
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        status: REVENUE_STATUS,
                        ...(hasRange && { createdAt: dateMatch }),
                    },
                },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        unitsSold: { $sum: "$items.quantity" },
                    },
                },
                {
                    $group: {
                        _id: null,
                        distinctProducts: { $sum: 1 },
                        unitsSold: { $sum: "$unitsSold" },
                    },
                },
            ]),
        ]);

        const topProducts = topProductsAgg
            .filter((p) => p.product)
            .map((p) => ({
                productId: p._id,
                name: p.product.name,
                unitsSold: p.unitsSold,
                revenue: p.revenue,
            }));

        // Zero-fill every status so the frontend never has to guess at a
        // missing key just because nothing happened to fall in that bucket
        // for the selected range.
        const countByStatus = Object.fromEntries(
            ordersByStatusAgg.map((s) => [s._id, s.count]),
        );
        const ordersByStatus = ORDER_STATUSES.map((status) => ({
            status,
            count: countByStatus[status] ?? 0,
        }));

        let revenueTrend = trendAgg.map((point) => ({
            date: point._id,
            revenue: point.revenue,
            orders: point.orders,
        }));
        if (interval === "hour" && from) {
            const revenueByHour = Object.fromEntries(
                revenueTrend.map((point) => [point.date.slice(-2), point]),
            );
            const date = manilaDayKey(new Date(from));
            revenueTrend = Array.from({ length: 24 }, (_, hour) => {
                const hourKey = String(hour).padStart(2, "0");
                const point = revenueByHour[hourKey];
                return {
                    date: `${date}T${hourKey}`,
                    revenue: point?.revenue ?? 0,
                    orders: point?.orders ?? 0,
                };
            });
        } else if (interval === "day" && from && to) {
            const revenueByDay = Object.fromEntries(
                revenueTrend.map((point) => [point.date, point]),
            );
            const firstDay = manilaDayKey(new Date(from));
            const lastDay = manilaDayKey(new Date(to));
            const cursor = new Date(`${firstDay}T00:00:00.000Z`);
            const end = new Date(`${lastDay}T00:00:00.000Z`);
            revenueTrend = [];

            while (cursor <= end) {
                const date = dayKey(cursor);
                const point = revenueByDay[date];
                revenueTrend.push({
                    date,
                    revenue: point?.revenue ?? 0,
                    orders: point?.orders ?? 0,
                });
                cursor.setUTCDate(cursor.getUTCDate() + 1);
            }
        }

        if (revenueTrend.length === 0) {
            revenueTrend = [
                {
                    date: manilaDayKey(new Date()),
                    revenue: 0,
                    orders: 0,
                },
            ];
        }

        res.status(200).json({
            revenue: {
                total: revenueAgg[0]?.total ?? 0,
                totalOrders: revenueAgg[0]?.totalOrders ?? 0,
            },
            products: {
                distinctProducts: productSalesAgg[0]?.distinctProducts ?? 0,
                unitsSold: productSalesAgg[0]?.unitsSold ?? 0,
            },
            revenueTrend,
            topProducts,
            ordersByStatus,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
