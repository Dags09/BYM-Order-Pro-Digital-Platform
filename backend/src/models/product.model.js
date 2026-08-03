import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        default: null,
        trim: true,
        match: [/^https?:\/\/.+/, "Please provide a valid URL"]
    }
}, {
    timestamps: true
}); 

export default mongoose.model('Product', productSchema);