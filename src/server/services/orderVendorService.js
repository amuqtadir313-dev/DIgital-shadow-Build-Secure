const pool = require("../config/database");

async function getVendorOrders(vendorId) {
    const result = await pool.query(
        `SELECT DISTINCT
            o.id,
            o.customer_id,
            o.total_amount,
            o.status,
            o.created_at,
            o.updated_at
         FROM orders o
         INNER JOIN order_items oi
            ON oi.order_id = o.id
         INNER JOIN products p
            ON p.id = oi.product_id
         WHERE p.vendor_id = $1
         ORDER BY o.created_at DESC`,
        [vendorId]
    );

    return result.rows;
}

async function updateVendorOrderStatus(
    vendorId,
    orderId,
    status
) {
    const allowedStatuses = [
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid order status.");
    }

    const ownershipCheck = await pool.query(
        `SELECT o.id
         FROM orders o
         INNER JOIN order_items oi
            ON oi.order_id = o.id
         INNER JOIN products p
            ON p.id = oi.product_id
         WHERE o.id = $1
           AND p.vendor_id = $2
         LIMIT 1`,
        [orderId, vendorId]
    );

    if (ownershipCheck.rows.length === 0) {
        throw new Error(
            "You do not have permission to manage this order."
        );
    }

    const result = await pool.query(
        `UPDATE orders
         SET
            status = $1,
            updated_at = NOW()
         WHERE id = $2
         RETURNING
            id,
            customer_id,
            total_amount,
            status,
            created_at,
            updated_at`,
        [status, orderId]
    );

    return result.rows[0];
}

module.exports = {
    getVendorOrders,
    updateVendorOrderStatus
};