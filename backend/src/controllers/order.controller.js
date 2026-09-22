import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import History from "../models/history.model.js";
import {
    sendOrderReceipt,
    sendOrderStatusEmail,
} from "../service/emailCustomer.service.js";

// Create order
export const createOrder = async (req, res) => {
    try {
        if (req.user.role === "customer" && !req.user.emailVerified) {
            return res.status(403).json({
                message: "Please verify your email before placing an order.",
            });
        }

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
                return res.status(400).json({
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
            .populate("paymentProofUploadedBy", "firstName lastName email")
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
            .populate("paymentProofUploadedBy", "firstName lastName email")
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

        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder)
            return res.status(404).json({ message: "Order not found" });

        // Orders can only move to processing/shipped/delivered once a
        // driver has been assigned (see assignDriver, which sets both
        // together). Cancelling or reverting to pending is always allowed.
        const requiresDriver = ["processing", "shipped", "delivered"];
        if (requiresDriver.includes(status) && !existingOrder.driver) {
            return res.status(400).json({
                message:
                    "Assign a driver before moving this order past pending.",
            });
        }

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

// Get driver-assignment history for an order, or across all orders (admin only)
export const getOrderHistory = async (req, res) => {
    try {
        const { orderId } = req.query;
        const filter = orderId
            ? { entityType: "order", entity: orderId }
            : { entityType: "order" };

        const history = await History.find(filter)
            .populate("performedBy", "firstName lastName email role")
            .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
