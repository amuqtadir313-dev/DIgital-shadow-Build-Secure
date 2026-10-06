const { registerUser } = require("../services/authService");

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

module.exports = {
    register
};