const pool = require("../config/database");

async function createProduct({
    vendorId,
    name,
    description,
    price,
    stock
}) {
    const result = await pool.query(
        `INSERT INTO products
            (vendor_id, name, description, price, stock)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING
            id,
            vendor_id,
            name,
            description,
            price,
            stock,
            is_active,
            created_at`,
        [
            vendorId,
            name.trim(),
            description ? description.trim() : null,
            price,
            stock
        ]
    );

    return result.rows[0];
}

async function getProducts({
    search,
    minPrice,
    maxPrice
}) {
    const conditions = ["is_active = TRUE"];
    const values = [];

    if (search) {
        values.push(`%${search.trim()}%`);
        conditions.push(
            `(name ILIKE $${values.length}
              OR description ILIKE $${values.length})`
        );
    }

    if (minPrice !== undefined) {
        values.push(minPrice);
        conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice !== undefined) {
        values.push(maxPrice);
        conditions.push(`price <= $${values.length}`);
    }

    const result = await pool.query(
        `SELECT
            id,
            vendor_id,
            name,
            description,
            price,
            stock,
            is_active,
            created_at
         FROM products
         WHERE ${conditions.join(" AND ")}
         ORDER BY created_at DESC`,
        values
    );

    return result.rows;
}

async function getProductById(productId) {
    const result = await pool.query(
        `SELECT
            id,
            vendor_id,
            name,
            description,
            price,
            stock,
            is_active,
            created_at
         FROM products
         WHERE id = $1
           AND is_active = TRUE`,
        [productId]
    );

    return result.rows[0] || null;
}

async function updateProduct(
    productId,
    {
        name,
        description,
        price,
        stock
    }
) {
    const result = await pool.query(
        `UPDATE products
         SET
            name = $1,
            description = $2,
            price = $3,
            stock = $4,
            updated_at = NOW()
         WHERE id = $5
         RETURNING
            id,
            vendor_id,
            name,
            description,
            price,
            stock,
            is_active,
            updated_at`,
        [
            name.trim(),
            description ? description.trim() : null,
            price,
            stock,
            productId
        ]
    );

    return result.rows[0] || null;
}

async function deleteProduct(productId) {
    const result = await pool.query(
        `UPDATE products
         SET
            is_active = FALSE,
            updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [productId]
    );

    return result.rows[0] || null;
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};