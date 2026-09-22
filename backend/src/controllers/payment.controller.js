import Order from "../models/order.model.js";

import History from "../models/history.model.js";

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
        order.paymentProofUploadedBy = req.user._id;
        order.paymentProofUploadedAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            paymentProof: order.paymentProof,
            paymentProofUploadedAt: order.paymentProofUploadedAt,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

// updates payment (manager)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return res
                .status(400)
                .json({ message: "paymentStatus is required." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // For digital payments (GCash/Maya), don't allow marking as paid
        // unless the customer actually submitted proof of payment or a
        // reference number. COD doesn't need either — cash is collected
        // in person.
        if (
            paymentStatus === "paid" &&
            order.paymentMethod !== "cod" &&
            !order.paymentProof &&
            !order.paymentReference
        ) {
            return res.status(400).json({
                message:
                    "Cannot mark as paid — customer hasn't uploaded payment proof or a reference number yet.",
            });
        }

        const previousStatus = order.paymentStatus;

        order.paymentStatus = paymentStatus;
        await order.save();

        await order.populate("customer", "firstName lastName email");

        // log who changed it, and from/to what
        await History.create({
            entityType: "order",
            entity: order._id,
            entityModel: "Order",
            entityName: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
            action: "payment_status_updated",
            performedBy: req.user?._id,
            changes: {
                paymentStatus: {
                    from: previousStatus,
                    to: paymentStatus,
                },
            },
        });

        // notify customer via socket
        req.io.to(order.customer._id.toString()).emit("order:payment", {
            orderId: order._id,
            paymentStatus: order.paymentStatus,
        });

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
