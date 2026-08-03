import express from "express";
import {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    assignDriver,
    updateDriverLocation,
    uploadPaymentProof,
} from "../controllers/order.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const uploadSingle = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err)
            return res
                .status(500)
                .json({ message: `Upload failed: ${err.message}` });
        next();
    });
};

const router = express.Router();

// Public routes
router.get("/get-order-by-id/:id", verifyToken, getOrderById);

// Protected routes
router.post("/create-order", verifyToken, requireRole("customer"), createOrder);
router.get("/my-orders", verifyToken, requireRole("customer"), getMyOrders);
router.get("/get-all-orders", verifyToken, requireRole("admin"), getAllOrders);
router.put(
    "/update-order-status/:id",
    verifyToken,
    requireRole("admin"),
    updateOrderStatus,
);
router.put(
    "/cancel-order/:id",
    verifyToken,
    requireRole("customer"),
    cancelOrder,
);
router.put(
    "/assign-driver/:id",
    verifyToken,
    requireRole("admin"),
    assignDriver,
);
router.put(
    "/update-driver-location/:id",
    verifyToken,
    requireRole("staff"),
    updateDriverLocation,
);
router.patch(
    "/upload-proof/:id",
    verifyToken,
    requireRole("customer"),
    uploadSingle,
    uploadPaymentProof,
);

export default router;
