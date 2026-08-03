import connectDB from "../src/config/db.js";
import User from "../src/models/user.model.js";
import mongoose from "mongoose";

const run = async () => {
    await connectDB();
    try {
        const user = await User.findOne().sort({ createdAt: -1 }).lean();
        console.log(
            "Latest user:",
            user ? JSON.stringify(user, null, 2) : "No users",
        );
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
