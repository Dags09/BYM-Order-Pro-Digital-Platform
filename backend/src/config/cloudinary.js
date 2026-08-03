import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


console.log("Cloudinary config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "set" : "missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "set" : "missing",
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        eager: [
            {
                width: 800,
                height: 800,
                crop: "fill",
                gravity: "auto",
                quality: "auto",
                fetch_format: "auto"
            }
        ]
    },
});

export const upload = multer({ storage });