const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../services/productService");

// Create product
async function create(req, res, next) {
    try {
        const {
            name,
            description,
            price,
            stock
        } = req.body;

        const product = await createProduct({
            vendorId: req.user.id,
            name,
            description,
            price,
            stock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product
        });
    } catch (error) {
        next(error);
    }
}

// Get all products
async function getAll(req, res, next) {
    try {
        const {
            search,
            minPrice,
            maxPrice
        } = req.query;

        const parsedMinPrice =
            minPrice !== undefined
                ? Number(minPrice)
                : undefined;

        const parsedMaxPrice =
            maxPrice !== undefined
                ? Number(maxPrice)
                : undefined;

        if (
            (minPrice !== undefined && !Number.isFinite(parsedMinPrice)) ||
            (maxPrice !== undefined && !Number.isFinite(parsedMaxPrice))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price filter."
            });
        }

        if (
            parsedMinPrice !== undefined &&
            parsedMaxPrice !== undefined &&
            parsedMinPrice > parsedMaxPrice
        ) {
            return res.status(400).json({
                success: false,
                message: "Minimum price cannot exceed maximum price."
            });
        }

        const products = await getProducts({
            search,
            minPrice: parsedMinPrice,
            maxPrice: parsedMaxPrice
        });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
}

// Get product by ID
async function getOne(req, res, next) {
    try {
        const { productId } = req.params;

        const product = await getProductById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
}

// Update product
async function update(req, res, next) {
    try {
        const { productId } = req.params;

        const product = await updateProduct(
            productId,
            req.body
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product
        });
    } catch (error) {
        next(error);
    }
}

// Delete product
async function remove(req, res, next) {
    try {
        const { productId } = req.params;

        const product = await deleteProduct(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove
};