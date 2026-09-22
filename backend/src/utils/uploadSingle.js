import { upload } from "../config/cloudinary.js";

export const uploadSingle = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("Upload error:", err);
            return res
                .status(500)
                .json({ message: `Upload failed: ${err.message}` });
        }
        next();
    });
};
