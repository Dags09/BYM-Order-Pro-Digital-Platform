import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\+?63\d{10}$/, "Please enter a valid phone number"],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["admin", "staff", "customer"],
            default: "staff",
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        location: {
            type: new mongoose.Schema(
                {
                    address: { type: String, trim: true },
                    city: { type: String, trim: true },
                    province: { type: String, trim: true },
                    zipCode: { type: String, trim: true },
                    country: {
                        type: String,
                        trim: true,
                        default: "Philippines",
                    },
                    coordinates: {
                        lat: { type: Number },
                        lng: { type: Number },
                    },
                },
                { _id: false },
            ),
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            default: null,
        },
        emailVerificationTokenExpires: {
            type: Date,
            default: null,
        },
        passwordResetToken: {
            type: String,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            default: null,
        },
        loginHistory: [
            {
                ipAddress: String,
                device: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        lastLogin: {
            type: Date,
            default: null,
        },
        passwordChanged: {
            type: Boolean,
            default: false,
        },
        passwordChangedAt: {
            type: Date,
            default: null,
        },
        // Hex color for profile badge (e.g. #a1b2c3). Assigned once at registration.
        badgeColor: {
            type: String,
            default: null,
            match: [/^#([0-9A-Fa-f]{6})$/, "Please provide a valid hex color"],
        },
    },
    {
        timestamps: true,
    },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);

        // Mark password as changed only if this is an update (not initial creation)
        // and the passwordChanged field is not explicitly set to false
        // This ensures new staff accounts start with passwordChanged: false
        if (this._id && this.passwordChanged !== false) {
            this.passwordChanged = true;
            this.passwordChangedAt = new Date();
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
    return this.getFullName();
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
    },
});

export default mongoose.model("User", userSchema);
