// models/qrcode.model.js
import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["gcash", "maya"],
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("QRCode", qrCodeSchema);