const argon2 = require("argon2");
const pool = require("../config/database");

async function registerUser({ name, email, password, role = "customer" }) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("An account with this email already exists.");
    }

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    const result = await pool.query(
        `INSERT INTO users
            (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, is_active, created_at`,
        [name.trim(), normalizedEmail, passwordHash, role]
    );

    return result.rows[0];
}

async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, is_active
         FROM users
         WHERE email = $1`,
        [normalizedEmail]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password.");
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw new Error("Invalid email or password.");
    }

    const passwordValid = await argon2.verify(
        user.password_hash,
        password
    );

    if (!passwordValid) {
        throw new Error("Invalid email or password.");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
    };
}

module.exports = {
    registerUser,
    loginUser
};