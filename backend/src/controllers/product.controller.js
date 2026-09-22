import Product from "../models/product.model.js";
import History from "../models/history.model.js";

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
            imageUrl: req.file ? req.file.path : null,
            addedBy: req.user?._id,
        });

        await product.save();

        await History.create({
            entityType: "product",
            entity: product._id,
            entityModel: "Product",
            entityName: product.name,
            action: "created",
            performedBy: req.user?._id,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Full error:", JSON.stringify(error, null, 2));
        res.status(400).json({ message: error.message });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .populate("addedBy", "firstName lastName email");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("addedBy", "firstName lastName email");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product
const TRACKED_FIELDS = ["name", "description", "price", "category", "stock", "imageUrl"];

export const updateProduct = async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing)
            return res.status(404).json({ message: "Product not found" });

        const updateData = { ...req.body };
        if (req.file) updateData.imageUrl = req.file.path; // update image if new one uploaded

        const changes = {};
        for (const field of TRACKED_FIELDS) {
            if (updateData[field] === undefined) continue;
            const oldValue = existing[field]?.toString?.() ?? existing[field];
            const newValue = updateData[field]?.toString?.() ?? updateData[field];
            if (oldValue !== newValue) {
                changes[field] = { from: existing[field], to: updateData[field] };
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (Object.keys(changes).length > 0) {
            await History.create({
                entityType: "product",
                entity: product._id,
                entityModel: "Product",
                entityName: product.name,
                action: "updated",
                performedBy: req.user?._id,
                changes,
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await History.create({
            entityType: "product",
            entity: product._id,
            entityModel: "Product",
            entityName: product.name,
            action: "deleted",
            performedBy: req.user?._id,
        });

        await Product.findByIdAndDelete(req.params.id);
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

        const existing = await Product.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Product not found" });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: quantity } },  // was missing this
            { new: true }
        );

        if (!product) return res.status(404).json({ message: "Product not found" });

        await History.create({
            entityType: "product",
            entity: product._id,
            entityModel: "Product",
            entityName: product.name,
            action: "stock_added",
            performedBy: req.user?._id,
            changes: {
                stock: { from: existing.stock, to: product.stock },
                quantityAdded: quantity,
            },
        });

        res.status(200).json({ message: "Stock added successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product change history (admin only)
export const getProductHistory = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = productId
            ? { entityType: "product", entity: productId }
            : { entityType: "product" };

        const history = await History.find(filter)
            .populate("performedBy", "firstName lastName email role")
            .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};