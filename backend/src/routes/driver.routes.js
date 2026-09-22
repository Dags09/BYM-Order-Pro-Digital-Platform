import express from "express";
import {
    listDrivers,
    assignDriver,
    updateDriverLocation,
    getMyDeliveries,
    updateDeliveryStatus,
} from "../controllers/driver.controller.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
    "/list-drivers",
    verifyToken,
    requireRole(["admin", "manager"]),
    listDrivers,
);
router.put(
    "/assign-driver/:id",
    verifyToken,
    requireRole(["manager"]),
    assignDriver,
);
router.put(
    "/update-driver-location/:id",
    verifyToken,
    requireRole("staff"),
    updateDriverLocation,
);
router.get(
    "/my-deliveries",
    verifyToken,
    requireRole("staff"),
    getMyDeliveries,
);
router.put(
    "/update-delivery-status/:id",
    verifyToken,
    requireRole("staff"),
    updateDeliveryStatus,
);

export default router;
