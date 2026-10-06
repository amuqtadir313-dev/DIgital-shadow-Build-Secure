const { z } = require("zod");

// =========================
// Registration Validation
// =========================

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters.")
        .max(100, "Name is too long."),

    email: z
        .string()
        .trim()
        .email("Invalid email address.")
        .max(255, "Email is too long."),

    password: z
        .string()
        .min(12, "Password must contain at least 12 characters.")
        .max(128, "Password is too long.")
});

// =========================
// Login Validation
// =========================

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address.")
        .max(255, "Email is too long."),

    password: z
        .string()
        .min(1, "Password is required.")
        .max(128, "Password is too long.")
});

// =========================
// Product Validation
// =========================

const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Product name must contain at least 2 characters.")
        .max(150, "Product name is too long."),

    description: z
        .string()
        .trim()
        .max(2000, "Product description is too long.")
        .optional()
        .nullable(),

    price: z
        .number()
        .finite()
        .min(0, "Price cannot be negative.")
        .max(999999999.99, "Price is too large."),

    stock: z
        .number()
        .int()
        .min(0, "Stock cannot be negative.")
        .max(1000000, "Stock is too large.")
});

// =========================
// Registration Middleware
// =========================

function validateRegister(req, res, next) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid registration data.",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    req.body = result.data;
    next();
}

// =========================
// Login Middleware
// =========================

function validateLogin(req, res, next) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid login data.",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    req.body = result.data;
    next();
}

// =========================
// Product Middleware
// =========================

function validateProduct(req, res, next) {
    const result = productSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid product data.",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    req.body = result.data;
    next();
}

// =========================
// Exports
// =========================

module.exports = {
    validateRegister,
    validateLogin,
    validateProduct
};