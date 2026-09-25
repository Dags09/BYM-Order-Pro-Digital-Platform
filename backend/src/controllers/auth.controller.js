import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";
import {
    sendPasswordResetEmail,
    sendAccountEmail,
    sendAccountStatusEmail,
} from "../service/emailStaff.service.js";

const generateRandomHexColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
    return `#${hex}`;
};

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: ENV.JWT_EXPIRES_IN || "15m",
    });

    const refreshToken = jwt.sign({ userId }, ENV.JWT_REFRESH_SECRET, {
        expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    return { accessToken, refreshToken };
};

const authCookieOptions = () => {
    const isProduction =
        process.env.NODE_ENV === "production" ||
        ENV.FRONTEND_URL?.startsWith("https://");
    return {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        ...authCookieOptions(),
        httpOnly: false,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...authCookieOptions(),
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", authCookieOptions());
    res.clearCookie("refreshToken", authCookieOptions());
};

const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

// Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required.",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required.",
            });
        }

        const user = await User.findOne({
            $or: [{ username }, { email: username.toLowerCase() }],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is disabled. Please contact administrator.",
            });
        }

        // if (
        //     user.role !== "admin" &&
        //     user.role !== "customer" &&
        //      user.role !== "manager" &&
        //     !user.emailVerified
        // ) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "Please verify your email before logging in.",
        //     });
        // }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
        }

        user.loginHistory.push({
            ipAddress: req.ip || req.connection.remoteAddress,
            device: req.headers["user-agent"] || "Unknown",
        });

        if (user.loginHistory.length > 10) {
            user.loginHistory = user.loginHistory.slice(-10);
        }

        user.lastLogin = new Date();
        if (!user.badgeColor) {
            user.badgeColor = generateRandomHexColor();
        }
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user._id);

        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName,
                passwordChanged: user.passwordChanged,
                location: user.location,
                phoneNumber: user.phoneNumber,
                badgeColor: user.badgeColor,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Register (Admin only)
export const registerStaff = async (req, res) => {
    try {
        const {
            username,
            email,
            phoneNumber,
            password,
            firstName,
            lastName,
            role,
        } = req.body;

        // Validate required fields
        if (
            !username ||
            !email ||
            !phoneNumber ||
            !password ||
            !firstName ||
            !lastName ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }

        // Validate password complexity (at least 3 numbers)
        if (!(password.match(/\d/g)?.length >= 3)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 3 numbers.",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }
        const validRoles = ["staff", "manager"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
        }

        const normalizedPhone = phoneNumber.startsWith("09")
            ? "+63" + phoneNumber.slice(1)
            : phoneNumber;

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (
            existingUser &&
            email.toLowerCase() === existingUser.email.toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Email already exists.",
            });
        }

        if (
            existingUser &&
            username.toLowerCase() === existingUser.username.toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Username already exists.",
            });
        }

        const existingNumber = await User.findOne({
            phoneNumber: normalizedPhone,
        });
        if (existingNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists.",
            });
        }

        // Generate token first
        const verificationToken = generatePasswordResetToken();

        // Try sending email BEFORE saving user, using req.body values directly
        const emailSent = await sendAccountEmail(
            {
                firstName,
                lastName,
                email,
                phoneNumber: normalizedPhone,
                role,
                username,
                password,
            },
            verificationToken,
        );

        // Only create and save user if email succeeded
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again.",
            });
        }

        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            phoneNumber: normalizedPhone,
            role,
            badgeColor: generateRandomHexColor(),
            emailVerified: role === "admin" ? true : false,
            passwordChanged: role === "admin" ? true : false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
            ),
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                fullName: user.fullName,
                badgeColor: user.badgeColor,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Registeration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const registerCustomer = async (req, res) => {
    try {
        const {
            username,
            email,
            phoneNumber,
            password,
            firstName,
            lastName,
            location,
        } = req.body;

        // Validate required fields
        if (
            !username ||
            !email ||
            !phoneNumber ||
            !password ||
            !firstName ||
            !lastName ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters.",
            });
        }

        // Validate password complexity (at least 3 numbers)
        if (!(password.match(/\d/g)?.length >= 3)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 3 numbers.",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        // Validate Philippine phone number format
        const phoneRegex = /^(\+63|0)9\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone number must be a valid Philippine number (e.g. 09XXXXXXXXX or +639XXXXXXXXX).",
            });
        }

        // Normalize phone number before checking duplicates
        const normalizedPhone = phoneNumber.startsWith("09")
            ? "+63" + phoneNumber.slice(1)
            : phoneNumber;

        // Check if username, email, or phone already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber: normalizedPhone }],
        });

        if (
            existingUser &&
            email.toLowerCase() === existingUser.email.toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Email already exists.",
            });
        }

        if (
            existingUser &&
            username.toLowerCase() === existingUser.username.toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Username already exists.",
            });
        }

        if (existingUser && normalizedPhone === existingUser.phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists.",
            });
        }

        // Generate token first
        const verificationToken = generatePasswordResetToken();

        // Try sending email BEFORE saving user, using req.body values directly
        const emailSent = await sendAccountEmail(
            {
                firstName,
                lastName,
                email,
                phoneNumber: normalizedPhone,
                role: "customer",
                username,
                password,
            },
            verificationToken,
        );

        // Only create and save user if email succeeded
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again.",
            });
        }

        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            phoneNumber: normalizedPhone,
            role: "customer",
            badgeColor: generateRandomHexColor(),
            emailVerified: false,
            passwordChanged: false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
            ),
            location: location || null,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                fullName: user.fullName,
                badgeColor: user.badgeColor,
                emailVerified: user.emailVerified,
                location: user.location,
            },
        });
    } catch (error) {
        console.error("Registeration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Verify email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required.",
            });
        }

        // Find user with this verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token.",
            });
        }

        user.emailVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Email verified successfully. You can now log in to your account.",
        });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified.",
            });
        }

        // Generate new verification token
        const verificationToken = generatePasswordResetToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationTokenExpires = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
        );
        await user.save();

        // Send new verification email
        const emailSent = await sendAccountEmail(
            {
                username: user.username,
                password: "Use your existing password",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            verificationToken,
        );

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Verification email sent successfully.",
        });
    } catch (error) {
        console.error("Resend verification email error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Refresh token
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided.",
            });
        }

        // Verify it
        const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user._id,
        );
        setAuthCookies(res, accessToken, newRefreshToken);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            accessToken,
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token.",
        });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        // Logout only needs to clear cookies — it must succeed even when
        // the access token has already expired (the most common case, since
        // it only lives 15 minutes), so this intentionally does not require
        // or depend on a currently-valid access token / req.user.
        clearAuthCookies(res);

        res.status(200).json({
            success: true,
            message: `User logged out successfully.`,
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } }).select(
            "-password -passwordResetToken -emailVerificationToken",
        );
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Forgot password - request reset link
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // Return success even if user not found to avoid email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message:
                    "If that email is registered, a reset link has been sent.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled. Please contact administrator.",
            });
        }

        const resetToken = generatePasswordResetToken();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpires;
        await user.save();

        const emailSent = await sendPasswordResetEmail(user, resetToken);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send reset email. Please try again.",
            });
        }

        res.status(200).json({
            success: true,
            message:
                "Password reset instructions have been sent to your email.",
        });
    } catch (error) {
        console.error("Request password reset error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long.",
            });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token.",
            });
        }

        user.password = newPassword;
        user.passwordChanged = true;
        user.passwordChangedAt = new Date();
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Verify current password
        const isCurrentPasswordValid =
            await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // Update password and mark as changed
        user.password = newPassword;
        user.passwordChanged = true;
        user.passwordChangedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName,
                passwordChanged: user.passwordChanged,
                badgeColor: user.badgeColor,
            },
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, username, phoneNumber } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!firstName || !lastName || !username || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, username, and phone number are required.",
            });
        }

        // Validate username length
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username must be at least 3 characters long.",
            });
        }

        // Check if username is already taken by another user
        const existingUser = await User.findOne({
            username: username,
            _id: { $ne: userId }, // Exclude current user
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username is already taken.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Update user profile
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();
        user.username = username.trim();
        user.phoneNumber = phoneNumber.trim();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName,
                passwordChanged: user.passwordChanged,
                badgeColor: user.badgeColor,
                location: user.location,
                phoneNumber: user.phoneNumber,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Toggle user status (enable/disable account) - Admin only
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found." });

        user.isActive = !user.isActive;
        await user.save();

        // Send email notification
        await sendAccountStatusEmail(user, user.isActive);

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "enabled" : "disabled"} successfully.`,
            isActive: user.isActive,
        });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Update location (for customers)
export const updateLocation = async (req, res) => {
    try {
        const { location } = req.body;
        const userId = req.user._id;

        // Validate location is an object, not a string
        if (
            !location ||
            typeof location !== "object" ||
            Array.isArray(location)
        ) {
            return res.status(400).json({
                success: false,
                message: "Location must be an object with address fields.",
            });
        }

        // Validate at least one meaningful field is provided
        const { address, city, province, zipCode, country, coordinates } =
            location;
        if (!address && !city && !province) {
            return res.status(400).json({
                success: false,
                message: "At least address, city, or province is required.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found." });
        }

        user.location = location;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Location updated successfully.",
            location: user.location,
        });
    } catch (error) {
        console.error("Update location error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
