import express from "express";
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderHistory,
} from "../controllers/order.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/get-order-by-id/:id", verifyToken, getOrderById);

// Protected routes
router.post("/create-order", verifyToken, requireRole("customer"), createOrder);
router.get("/my-orders", verifyToken, requireRole("customer"), getMyOrders);
router.get(
    "/get-all-orders",
    verifyToken,
    requireRole(["admin", "manager"]),
    getAllOrders,
);
router.get("/get-history", verifyToken, requireRole("admin"), getOrderHistory);
router.put(
    "/update-order-status/:id",
    verifyToken,
    requireRole(["manager"]),
    updateOrderStatus,
);

router.put(
    "/cancel-order/:id",
    verifyToken,
    requireRole("customer"),
    cancelOrder,
);

export default router;
