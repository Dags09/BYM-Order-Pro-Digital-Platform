import Category from "../models/category.model.js";
import History from "../models/history.model.js";

// Create category
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const category = new Category({
            name,
            description,
            slug,
            addedBy: req.user?._id,
        });
        await category.save();

        await History.create({
            entityType: "category",
            entity: category._id,
            entityModel: "Category",
            entityName: category.name,
            action: "created",
            performedBy: req.user?._id,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate(
            "addedBy",
            "firstName lastName email",
        );
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single category
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate(
            "addedBy",
            "firstName lastName email",
        );
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update category
const TRACKED_FIELDS = ["name", "description", "slug"];

export const updateCategory = async (req, res) => {
    try {
        const existing = await Category.findById(req.params.id);
        if (!existing)
            return res.status(404).json({ message: "Category not found" });

        const changes = {};
        for (const field of TRACKED_FIELDS) {
            if (
                req.body[field] !== undefined &&
                req.body[field] !== existing[field]
            ) {
                changes[field] = { from: existing[field], to: req.body[field] };
            }
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );

        if (Object.keys(changes).length > 0) {
            await History.create({
                entityType: "category",
                entity: category._id,
                entityModel: "Category",
                entityName: category.name,
                action: "updated",
                performedBy: req.user?._id,
                changes,
            });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        await History.create({
            entityType: "category",
            entity: category._id,
            entityModel: "Category",
            entityName: category.name,
            action: "deleted",
            performedBy: req.user?._id,
        });

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get category change history (admin only)
export const getCategoryHistory = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const filter = categoryId
            ? { entityType: "category", entity: categoryId }
            : { entityType: "category" };

        const history = await History.find(filter)
            .populate("performedBy", "firstName lastName email role")
            .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};