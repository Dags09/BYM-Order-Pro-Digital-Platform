import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { sendDriverAssignmentEmail } from "../service/emailStaff.service.js";
import {
    sendOrderReceipt,
    sendOrderStatusEmail,
} from "../service/emailCustomer.service.js";

// Create order
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            note,
            paymentMethod,
            paymentReference,
        } = req.body;

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product)
                return res
                    .status(404)
                    .json({ message: `Product ${item.productId} not found` });
            if (product.stock < item.quantity)
                return res
                    .status(400)
                    .json({
                        message: `Insufficient stock for ${product.name}`,
                    });

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            });

            totalAmount += product.price * item.quantity;
        }

        // deduct stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        const order = new Order({
            customer: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            note,
            paymentMethod: paymentMethod ?? "cod",
            paymentStatus: "pending",
            paymentReference: paymentReference ?? null,
        });

        await order.save();

        // populate items with product details for receipt
        await order.populate("items.product", "name price imageUrl");

        // send email receipt to customer
        await sendOrderReceipt({
            to: req.user.email,
            customerName: `${req.user.firstName} ${req.user.lastName}`,
            orderId: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
        });

        // return receipt in response
        res.status(201).json({
            message: "Order placed successfully!",
            order,
            receipt: {
                orderId: order._id,
                customerName: `${req.user.firstName} ${req.user.lastName}`,
                items: order.items.map((item) => ({
                    product: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity,
                })),
                totalAmount: order.totalAmount,
                status: order.status,
                note: order.note,
            },
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("customer", "firstName lastName email phoneNumber")
            .populate("driver", "firstName lastName email phoneNumber")
            .populate("items.product", "name price imageUrl");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get logged in customer's orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate("driver", "firstName lastName phoneNumber")
            .populate("items.product", "name price imageUrl");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single order
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer", "firstName lastName email phoneNumber")
            .populate("driver", "firstName lastName email phoneNumber")
            .populate("items.product", "name price imageUrl");
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true },
        ).populate("customer", "firstName lastName email");

        if (!order) return res.status(404).json({ message: "Order not found" });

        // send email only for processing, shipped, delivered
        if (["processing", "shipped", "delivered"].includes(status)) {
            await sendOrderStatusEmail({
                to: order.customer.email,
                customerName: `${order.customer.firstName} ${order.customer.lastName}`,
                orderId: order._id,
                status,
                driverLocation: order.driverLocation ?? null,
                scheduledDeliveryDate: order.scheduledDeliveryDate ?? null,
            });
        }

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

// Cancel order (customer)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status !== "pending")
            return res
                .status(400)
                .json({ message: "Only pending orders can be cancelled" });

        // restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }

        order.status = "cancelled";
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign driver to order (admin)
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
            return res
                .status(400)
                .json({
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

// Customer uploads payment proof for digital payments
export const uploadPaymentProof = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (!req.file)
            return res.status(400).json({ message: "No image uploaded." });
        if (order.paymentMethod === "cod")
            return res
                .status(400)
                .json({ message: "COD orders don't require payment proof." });

        order.paymentProof = req.file.path;
        await order.save();

        res.status(200).json({
            success: true,
            paymentProof: order.paymentProof,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};
