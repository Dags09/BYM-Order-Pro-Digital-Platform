import Feedback from "../models/feedback.model.js";
import Order from "../models/order.model.js";

// Create feedback
export const createFeedback = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        // check if order exists and belongs to the customer
        const order = await Order.findOne({
            _id: orderId,
            customer: req.user._id
        });

        if (!order) return res.status(404).json({ message: "Order not found" });

        // only delivered orders can be reviewed
        if (order.status !== "delivered") {
            return res.status(400).json({ message: "You can only give feedback on delivered orders" });
        }

        // check if feedback already exists for this order
        const existing = await Feedback.findOne({ order: orderId });
        if (existing) {
            return res.status(400).json({ message: "You have already submitted feedback for this order" });
        }

        const feedback = new Feedback({
            order: orderId,
            customer: req.user._id,
            rating,
            comment
        });

        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all feedbacks (admin)
export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate("customer", "firstName lastName email")
            .populate("order", "totalAmount status createdAt");
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get feedback by order (customer)
export const getFeedbackByOrder = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ order: req.params.orderId })
            .populate("customer", "firstName lastName")
            .populate("order", "totalAmount status createdAt");
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get my feedbacks (customer)
export const getMyFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ customer: req.user._id })
            .populate("order", "totalAmount status createdAt");
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update feedback (customer)
export const updateFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const feedback = await Feedback.findOne({
            _id: req.params.id,
            customer: req.user._id  // ensure only owner can update
        });

        if (!feedback) return res.status(404).json({ message: "Feedback not found" });

        feedback.rating = rating ?? feedback.rating;
        feedback.comment = comment ?? feedback.comment;
        await feedback.save();

        res.status(200).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete feedback (admin)
export const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};