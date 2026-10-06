const {
    getVendorOrders,
    updateVendorOrderStatus
} = require("../services/orderVendorService");

async function getOrders(req, res, next) {
    try {
        const orders = await getVendorOrders(req.user.id);

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await updateVendorOrderStatus(
            req.user.id,
            orderId,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order
        });
    } catch (error) {
        if (
            error.message === "Invalid order status." ||
            error.message ===
                "You do not have permission to manage this order."
        ) {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

module.exports = {
    getOrders,
    updateStatus
};