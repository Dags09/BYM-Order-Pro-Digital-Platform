import express from "express";
import {
    getQRCodes,
    upsertQRCode,
    toggleQRCode,
} from "../controllers/qrcode.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/admin/all", verifyToken, requireRole("admin"), getQRCodes);
router.post(
    "/upsert",
    verifyToken,
    requireRole("admin"),
    upload.single("image"),
    upsertQRCode,
);
router.patch("/toggle/:id", verifyToken, requireRole("admin"), toggleQRCode);

export default router;
