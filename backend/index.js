import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import feedbackRoutes from "./src/routes/feedback.routes.js";
import qrcodeRoutes from "./src/routes/qrcode.routes.js";
import driverRoutes from "./src/routes/driver.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";

// Config
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
    cors: {
        origin: ENV.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST"],
    },
});

// Attach io to every request so controllers can use req.io
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket connection
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

// Middleware
app.use(
    cors({
        origin: ENV.FRONTEND_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/qrcode", qrcodeRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/order", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Use server.listen instead of app.listen
server.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});

connectDB();

export default app;
