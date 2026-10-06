const express = require("express");

const {
    getAllUsers,
    updateStatus
} = require("../controllers/adminController");

const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

// Admin: view all users
router.get(
    "/users",
    authenticate,
    authorize("admin"),
    getAllUsers
);

// Admin: activate/deactivate user
router.put(
    "/users/:userId/status",
    authenticate,
    authorize("admin"),
    updateStatus
);

module.exports = router;