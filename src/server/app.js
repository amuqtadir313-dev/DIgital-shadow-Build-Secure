require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderVendorRoutes = require("./routes/orderVendorRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { authenticate } = require("./middleware/auth");
const { authorize } = require("./middleware/authorize");

const app = express();

const clientPath = path.join(__dirname, "../client");

// ======================================================
// SECURITY HEADERS
// ======================================================

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// ======================================================
// REQUEST BODY LIMIT
// ======================================================

app.use(express.json({ limit: "10kb" }));

// ======================================================
// CORS
// ======================================================

app.use(
    cors({
        origin:
            process.env.CLIENT_ORIGIN ||
            "http://localhost:5173",
        credentials: true
    })
);

// ======================================================
// GLOBAL API RATE LIMIT
// ======================================================

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

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MarketHub API is running",
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// TEST ROUTES
// ======================================================

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

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/vendor/orders", orderVendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// ======================================================
// FRONTEND
// ======================================================

// Serve CSS, JavaScript and HTML files
app.use(express.static(clientPath));

// Explicitly serve homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

module.exports = app;