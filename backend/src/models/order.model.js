import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
});

const orderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must have at least one item",
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        // add this inside orderSchema, below shippingAddress
        note: {
            type: String,
            trim: true,
            maxlength: 300,
            default: null,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        shippingAddress: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            province: { type: String, required: true, trim: true },
            zipCode: { type: String, required: true, trim: true },
        },
        scheduledDeliveryDate: {
            type: Date,
            default: null,
        },

        // --- Delivery fields ---
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        driverLocation: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            updatedAt: { type: Date, default: null },
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "gcash", "maya"],
            required: true,
            default: "cod",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentReference: {
            type: String, // customer enters their GCash/Maya reference number
            default: null,
        },
        paymentProof: {
            type: String, // Cloudinary URL
            default: null,
        },
        paymentProofUploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        paymentProofUploadedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("Order", orderSchema);
