require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const { authenticate } = require("./middleware/auth");
const { authorize } = require("./middleware/authorize");

const app = express();

// Security headers
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// Limit request body size
app.use(express.json({ limit: "10kb" }));

// Controlled cross-origin access
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
        credentials: true
    })
);

// Global API rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MarketHub API is running",
        timestamp: new Date().toISOString()
    });
});

// Protected customer test route
app.get(
    "/api/test/customer",
    authenticate,
    authorize("customer"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Customer access granted.",
            user: req.user
        });
    }
);

// Protected vendor test route
app.get(
    "/api/test/vendor",
    authenticate,
    authorize("vendor"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Vendor access granted.",
            user: req.user
        });
    }
);

// Protected admin test route
app.get(
    "/api/test/admin",
    authenticate,
    authorize("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted.",
            user: req.user
        });
    }
);

// Product routes
app.use("/api/products", productRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

module.exports = app;