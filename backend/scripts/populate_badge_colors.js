import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";

const generateRandomHexColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
    return `#${hex}`;
};

const run = async () => {
    await connectDB();

    try {
        const users = await User.find({ badgeColor: { $in: [null, ""] } });
        console.log(`Found ${users.length} users without badgeColor.`);

        let updated = 0;
        for (const u of users) {
            u.badgeColor = generateRandomHexColor();
            await u.save();
            updated++;
        }

        console.log(`Updated ${updated} users.`);
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
