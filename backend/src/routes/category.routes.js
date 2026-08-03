import express from "express";
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/get-all-categories", getCategories);
router.get("/get-categories/:id", getCategoryById);
router.post("/create-category", verifyToken, createCategory);
router.put("/update-category/:id", verifyToken, updateCategory);
router.delete("/delete-category/:id", verifyToken, deleteCategory);

export default router;