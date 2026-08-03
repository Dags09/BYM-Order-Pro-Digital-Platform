import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addStock
} from "../controllers/product.controller.js";
import {
    verifyToken,
    requireRole
} from '../middleware/auth.middleware.js';
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Wrapper to catch multer/Cloudinary errors
const uploadSingle = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Upload error:", err);
            return res.status(500).json({ message: `Upload failed: ${err.message}` });
        }
        next();
    });
};

// Public routes
router.get("/get-all-products", getProducts);
router.get("/get-product/:id", getProductById);

// Protected routes (Admin only)
router.post("/create-product", verifyToken, requireRole('admin'), uploadSingle, createProduct);
router.put("/update-product/:id", verifyToken, requireRole('admin'), uploadSingle, updateProduct);
router.delete("/delete-product/:id", verifyToken, requireRole('admin'), deleteProduct);
router.post("/add-stock/:id", verifyToken, requireRole('admin'), addStock);

export default router;