import express from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryHistory,
} from "../controllers/category.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-all-categories", getCategories);
router.get(
    "/get-history",
    verifyToken,
    requireRole("admin"),
    getCategoryHistory,
);
router.get("/get-categories/:id", getCategoryById);
router.post(
    "/create-category",
    verifyToken,
    requireRole(["manager"]),
    createCategory,
);
router.put(
    "/update-category/:id",
    verifyToken,
    requireRole(["manager"]),
    updateCategory,
);
router.delete(
    "/delete-category/:id",
    verifyToken,
    requireRole(["manager"]),
    deleteCategory,
);

export default router;
