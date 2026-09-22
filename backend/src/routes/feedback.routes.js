import express from "express";
import {
    createFeedback,
    getAllFeedbacks,
    getFeedbackByOrder,
    getMyFeedbacks,
    updateFeedback,
    deleteFeedback,
} from "../controllers/feedback.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/create-feedback",
    verifyToken,
    requireRole("customer"),
    createFeedback,
);
router.get(
    "/get-all-feedback",
    verifyToken,
    requireRole("admin", "manager"),
    getAllFeedbacks,
);
router.get(
    "/my-feedbacks",
    verifyToken,
    requireRole("customer"),
    getMyFeedbacks,
);
router.get("/order/:orderId", verifyToken, getFeedbackByOrder);
router.put(
    "/update-feedback/:id",
    verifyToken,
    requireRole("customer"),
    updateFeedback,
);
router.delete(
    "/delete-feedback/:id",
    verifyToken,
    requireRole("admin", "manager"),
    deleteFeedback,
);

export default router;
