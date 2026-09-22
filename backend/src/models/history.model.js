import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
    {
        // Which kind of thing this entry is about
        entityType: {
            type: String,
            enum: ["category", "product", "order"],
            required: true,
        },
        // Polymorphic reference — points at a Category, Product, or Order doc
        // depending on entityModel (see Mongoose refPath)
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "entityModel",
        },
        entityModel: {
            type: String,
            enum: ["Category", "Product", "Order"],
            required: true,
        },
        // Snapshot of the name at the time of the change, so history still
        // reads clearly even if the category/product/order is later renamed or deleted.
        entityName: { type: String, required: true },
        action: {
            type: String,
            enum: [
                "created",
                "updated",
                "stock_added",
                "deleted",
                "driver_assigned",
                "payment_status_updated",
            ],
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // For "updated"/"stock_added" entries: { fieldName: { from, to } }
        changes: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    { timestamps: true },
);

export default mongoose.model("History", historySchema);
