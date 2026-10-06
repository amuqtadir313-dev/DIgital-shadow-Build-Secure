const express = require("express");

const {
    create,
    getAll,
    getOne,
    update,
    remove
} = require("../controllers/productController");

const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const {
    validateProduct
} = require("../middleware/validation");

const {
    authorizeProductOwner
} = require("../middleware/productAuthorization");

const router = express.Router();

// Public: browse/search products
router.get("/", getAll);

// Public: view one product
router.get("/:productId", getOne);

// Vendor/Admin: create product
router.post(
    "/",
    authenticate,
    authorize("vendor", "admin"),
    validateProduct,
    create
);

// Vendor/Admin: update own product
router.put(
    "/:productId",
    authenticate,
    authorize("vendor", "admin"),
    validateProduct,
    authorizeProductOwner,
    update
);

// Vendor/Admin: delete own product
router.delete(
    "/:productId",
    authenticate,
    authorize("vendor", "admin"),
    authorizeProductOwner,
    remove
);

module.exports = router;