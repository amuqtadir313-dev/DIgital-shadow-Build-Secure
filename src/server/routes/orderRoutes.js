const express = require("express");

const {
    create,
    getMyOrders
} = require("../controllers/orderController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Customer: create order / checkout
router.post(
    "/",
    authenticate,
    create
);

// Customer: view own orders
router.get(
    "/my",
    authenticate,
    getMyOrders
);

module.exports = router;