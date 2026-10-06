const pool = require("../config/database");

async function authorizeProductOwner(req, res, next) {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required."
            });
        }

        const result = await pool.query(
            `SELECT id, vendor_id
             FROM products
             WHERE id = $1
               AND is_active = TRUE`,
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const product = result.rows[0];

        if (req.user.role !== "admin" && product.vendor_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to modify this product."
            });
        }

        req.product = product;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    authorizeProductOwner
};