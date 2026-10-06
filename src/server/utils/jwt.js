const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
}

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            role: user.role,
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: "15m",
            issuer: "markethub-api",
            audience: "markethub-client"
        }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET, {
        issuer: "markethub-api",
        audience: "markethub-client"
    });
}

module.exports = {
    generateAccessToken,
    verifyAccessToken
};