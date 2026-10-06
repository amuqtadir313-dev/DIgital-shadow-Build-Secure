const pool = require("../config/database");

async function createOrder(customerId, items) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const result = await client.query(
                `SELECT id, price, stock, is_active
                 FROM products
                 WHERE id = $1
                 FOR UPDATE`,
                [item.productId]
            );

            if (result.rows.length === 0 || !result.rows[0].is_active) {
                throw new Error("Product not found.");
            }

            const product = result.rows[0];

            if (product.stock < item.quantity) {
                throw new Error("Insufficient product stock.");
            }

            const unitPrice = Number(product.price);
            const itemTotal = unitPrice * item.quantity;

            totalAmount += itemTotal;

            validatedItems.push({
                productId: product.id,
                quantity: item.quantity,
                unitPrice
            });
        }

        const orderResult = await client.query(
            `INSERT INTO orders
                (customer_id, total_amount, status)
             VALUES ($1, $2, 'pending')
             RETURNING id, customer_id, total_amount, status, created_at`,
            [customerId, totalAmount]
        );

        const order = orderResult.rows[0];

        for (const item of validatedItems) {
            await client.query(
                `INSERT INTO order_items
                    (order_id, product_id, quantity, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [
                    order.id,
                    item.productId,
                    item.quantity,
                    item.unitPrice
                ]
            );

            await client.query(
                `UPDATE products
                 SET stock = stock - $1,
                     updated_at = NOW()
                 WHERE id = $2`,
                [item.quantity, item.productId]
            );
        }

        await client.query("COMMIT");

        return order;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function getCustomerOrders(customerId) {
    const result = await pool.query(
        `SELECT id, total_amount, status, created_at, updated_at
         FROM orders
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
    );

    return result.rows;
}

module.exports = {
    createOrder,
    getCustomerOrders
};