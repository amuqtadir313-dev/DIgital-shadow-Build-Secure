const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const {
    validateRegister,
    validateLogin
} = require("../middleware/validation");

const { loginLimiter } = require("../middleware/authRateLimit");

const router = express.Router();

router.post("/register", validateRegister, register);

router.post("/login", loginLimiter, validateLogin, login);

module.exports = router;