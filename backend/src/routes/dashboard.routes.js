import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", verifyToken, requireRole("admin"), getDashboardStats);

export default router;
