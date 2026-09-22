import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import History from "../models/history.model.js";
import { sendDriverAssignmentEmail } from "../service/emailStaff.service.js";
import { sendOrderStatusEmail } from "../service/emailCustomer.service.js";

// Assign driver to order (manager)
export const assignDriver = async (req, res) => {
    try {
        const { driverId, scheduledDeliveryDate } = req.body;

        // validate scheduled date
        if (!scheduledDeliveryDate) {
            return res
                .status(400)
                .json({ message: "Scheduled delivery date is required" });
        }

        const scheduleDate = new Date(scheduledDeliveryDate);
        if (isNaN(scheduleDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (scheduleDate < new Date()) {
            return res.status(400).json({
                message: "Scheduled delivery date cannot be in the past",
            });
        }

        const driver = await User.findById(driverId);
        if (!driver)
            return res.status(404).json({ message: "Driver not found" });
        if (driver.role !== "staff")
            return res
                .status(400)
                .json({ message: "User is not a staff/driver" });
        if (!driver.isActive)
            return res
                .status(400)
                .json({ message: "This driver's account is disabled." });
        if (!driver.emailVerified)
            return res.status(400).json({
                message: "This driver hasn't verified their email yet.",
            });

        const previousOrder = await Order.findById(req.params.id);
        if (!previousOrder)
            return res.status(404).json({ message: "Order not found" });
        const previousDriverId = previousOrder.driver
            ? previousOrder.driver.toString()
            : null;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                driver: driverId,
                status: "processing",
                scheduledDeliveryDate: scheduleDate,
            },
            { new: true },
        )
            .populate("customer", "firstName lastName email phoneNumber")
            .populate("driver", "firstName lastName email phoneNumber")
            .populate("items.product", "name price imageUrl");

        if (!order) return res.status(404).json({ message: "Order not found" });

        await History.create({
            entityType: "order",
            entity: order._id,
            entityModel: "Order",
            entityName: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
            action: "driver_assigned",
            performedBy: req.user?._id,
            changes: {
                driver: {
                    from: previousDriverId,
                    to: driverId,
                },
                driverName: `${driver.firstName} ${driver.lastName}`,
                scheduledDeliveryDate: {
                    from: previousOrder.scheduledDeliveryDate ?? null,
                    to: scheduleDate,
                },
            },
        });

        // send email to driver
        await sendDriverAssignmentEmail({
            to: driver.email,
            driverName: `${driver.firstName} ${driver.lastName}`,
            orderId: order._id,
            customer: {
                name: `${order.customer.firstName} ${order.customer.lastName}`,
                phone: order.customer.phoneNumber,
                email: order.customer.email,
            },
            shippingAddress: order.shippingAddress,
            items: order.items,
            totalAmount: order.totalAmount,
            scheduledDeliveryDate: scheduleDate,
            note: order.note ?? null,
        });

        await sendOrderStatusEmail({
            to: order.customer.email,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            orderId: order._id,
            status: "processing",
            driverLocation: null,
            scheduledDeliveryDate: scheduleDate,
        });

        // notify driver via socket
        req.io.to(driverId.toString()).emit("order:assigned", order);

        // notify customer via socket
        req.io.to(order.customer._id.toString()).emit("order:status", {
            orderId: order._id,
            status: order.status,
            scheduledDeliveryDate: scheduleDate,
            driver: {
                name: `${order.driver.firstName} ${order.driver.lastName}`,
                phone: order.driver.phoneNumber,
            },
        });

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Driver updates their location
export const updateDriverLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            driver: req.user._id,
        });

        if (!order) return res.status(404).json({ message: "Order not found" });

        order.driverLocation = { latitude, longitude, updatedAt: new Date() };
        await order.save();

        // emit location to customer in real-time
        req.io.to(order.customer.toString()).emit("driver:location", {
            orderId: order._id,
            latitude,
            longitude,
            updatedAt: order.driverLocation.updatedAt,
        });

        res.status(200).json({
            message: "Location updated",
            driverLocation: order.driverLocation,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get deliveries assigned to the logged-in staff/driver
export const getMyDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({ driver: req.user._id })
            .populate("customer", "firstName lastName email phoneNumber")
            .populate("items.product", "name price imageUrl")
            .sort({ scheduledDeliveryDate: 1, createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Valid forward transitions a driver is allowed to make themselves
const DRIVER_STATUS_TRANSITIONS = {
    processing: ["shipped"],
    shipped: ["delivered"],
};

// Staff updates the status of a delivery assigned to them
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["shipped", "delivered"].includes(status)) {
            return res.status(400).json({
                message: "Staff can only mark orders as shipped or delivered.",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            driver: req.user._id,
        }).populate("customer", "firstName lastName email");

        if (!order)
            return res
                .status(404)
                .json({ message: "Order not found or not assigned to you." });

        const allowedNext = DRIVER_STATUS_TRANSITIONS[order.status] || [];
        if (!allowedNext.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from "${order.status}" to "${status}".`,
            });
        }

        order.status = status;
        await order.save();

        await sendOrderStatusEmail({
            to: order.customer.email,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
            orderId: order._id,
            status,
            driverLocation: order.driverLocation ?? null,
            scheduledDeliveryDate: order.scheduledDeliveryDate ?? null,
        });

        // notify customer via socket
        req.io.to(order.customer._id.toString()).emit("order:status", {
            orderId: order._id,
            status: order.status,
        });

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// List all drivers (staff role) with their current in-progress delivery
// count, so the manager can see who's free before assigning a new order.
export const listDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: "staff" })
            .select(
                "firstName lastName email phoneNumber isActive emailVerified createdAt",
            )
            .sort({ firstName: 1 });

        const activeCounts = await Order.aggregate([
            {
                $match: {
                    driver: { $ne: null },
                    status: { $in: ["processing", "shipped"] },
                },
            },
            { $group: { _id: "$driver", count: { $sum: 1 } } },
        ]);
        const countByDriver = Object.fromEntries(
            activeCounts.map((c) => [c._id.toString(), c.count]),
        );

        const result = drivers.map((driver) => ({
            ...driver.toObject(),
            activeDeliveries: countByDriver[driver._id.toString()] ?? 0,
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
