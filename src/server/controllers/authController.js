const {
    registerUser,
    loginUser
} = require("../services/authService");

const {
    generateAccessToken
} = require("../utils/jwt");

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        const user = await registerUser({
            name,
            email,
            password,
            role: "customer"
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user
        });
    } catch (error) {
        if (error.message === "An account with this email already exists.") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await loginUser({
            email,
            password
        });

        const accessToken = generateAccessToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            accessToken,
            user
        });
    } catch (error) {
        if (error.message === "Invalid email or password.") {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
}

module.exports = {
    register,
    login
};