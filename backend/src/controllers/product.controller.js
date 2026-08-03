import Product from "../models/product.model.js";

// Create product
export const createProduct = async (req, res) => {
    try {
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        const { name, description, price, category, stock } = req.body;

        // Validate category is not empty before casting
        if (!category) {
            return res.status(400).json({ message: "Category is required." });
        }

        const product = new Product({
            name,
            description,
            price: Number(price),       
            stock: Number(stock),       
            category,                   
            imageUrl: req.file ? req.file.path : null
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Full error:", JSON.stringify(error, null, 2));
        res.status(400).json({ message: error.message });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.imageUrl = req.file.path; // update image if new one uploaded

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Stock
export const addStock = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: quantity } },  // was missing this
            { new: true }
        );

        if (!product) return res.status(404).json({ message: "Product not found" });

        res.status(200).json({ message: "Stock added successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};