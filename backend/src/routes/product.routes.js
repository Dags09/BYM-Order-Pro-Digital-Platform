import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addStock,
    getProductHistory,
} from "../controllers/product.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { uploadSingle } from "../utils/uploadSingle.js";

const router = express.Router();

// Public routes
router.get("/get-all-products", getProducts);
router.get("/get-product/:id", getProductById);

// Protected routes (Admin only)
router.get(
    "/get-history",
    verifyToken,
    requireRole("admin"),
    getProductHistory,
);
router.post(
    "/create-product",
    verifyToken,
    requireRole("manager"),
    uploadSingle,
    createProduct,
);
router.put(
    "/update-product/:id",
    verifyToken,
    requireRole("manager"),
    uploadSingle,
    updateProduct,
);
router.delete(
    "/delete-product/:id",
    verifyToken,
    requireRole("manager"),
    deleteProduct,
);
router.post("/add-stock/:id", verifyToken, requireRole("manager"), addStock);

export default router;
