const express = require("express");

const {
    getOrders,
    updateStatus
} = require("../controllers/orderVendorController");

const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

// Vendor: view orders containing their products
router.get(
    "/",
    authenticate,
    authorize("vendor"),
    getOrders
);

// Vendor: update order status
router.put(
    "/:orderId/status",
    authenticate,
    authorize("vendor"),
    updateStatus
);

module.exports = router;