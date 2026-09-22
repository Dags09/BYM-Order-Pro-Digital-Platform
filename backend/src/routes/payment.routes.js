import express from "express";
import {
    uploadPaymentProof,
    updatePaymentStatus,
} from "../controllers/payment.controller.js";
import { uploadSingle } from "../utils/uploadSingle.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.patch(
    "/upload-proof/:id",
    verifyToken,
    requireRole("customer"),
    uploadSingle,
    uploadPaymentProof,
);
router.put(
    "/update-payment-status/:id",
    verifyToken,
    requireRole(["manager"]),
    updatePaymentStatus,
);

export default router;
