import express from "express";
import {
    getDashboardStats,
    getRevenueSummary,
} from "../controllers/dashboard.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", verifyToken, requireRole("admin"), getDashboardStats);
router.get(
    "/revenue-summary",
    verifyToken,
    requireRole("admin"),
    getRevenueSummary,
);

export default router;
