import QRCode from "../models/qrcode.model.js";

// Get all QR codes (public)
export const getQRCodes = async (req, res) => {
    try {
        const qrcodes = await QRCode.find({ isActive: true });
        res.status(200).json({ success: true, qrcodes });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

// Upload / update QR code (admin)
export const upsertQRCode = async (req, res) => {
    try {
        const { type, accountName, accountNumber } = req.body;

        if (!type || !accountName || !accountNumber) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "QR code image is required." });
        }

        const qrcode = await QRCode.findOneAndUpdate(
            { type },
            {
                type,
                accountName,
                accountNumber,
                imageUrl: req.file.path,
                isActive: true
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, qrcode });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};

// Toggle active status (admin)
export const toggleQRCode = async (req, res) => {
    try {
        const qrcode = await QRCode.findById(req.params.id);
        if (!qrcode) return res.status(404).json({ message: "QR code not found." });

        qrcode.isActive = !qrcode.isActive;
        await qrcode.save();

        res.status(200).json({ success: true, qrcode });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};