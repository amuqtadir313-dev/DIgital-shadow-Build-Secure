const {
    createOrder,
    getCustomerOrders
} = require("../services/orderService");

async function create(req, res, next) {
    try {
        const { items } = req.body;

        const order = await createOrder(
            req.user.id,
            items
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            order
        });
    } catch (error) {
        if (
            error.message === "Product not found." ||
            error.message === "Insufficient product stock."
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

async function getMyOrders(req, res, next) {
    try {
        const orders = await getCustomerOrders(req.user.id);

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    getMyOrders
};