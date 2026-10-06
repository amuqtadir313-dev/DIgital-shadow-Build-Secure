const pool = require("../config/database");

async function getUsers() {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            role,
            is_active,
            created_at,
            updated_at
         FROM users
         ORDER BY created_at DESC`
    );

    return result.rows;
}

async function updateUserStatus(userId, isActive) {
    const result = await pool.query(
        `UPDATE users
         SET
            is_active = $1,
            updated_at = NOW()
         WHERE id = $2
         RETURNING
            id,
            name,
            email,
            role,
            is_active,
            updated_at`,
        [isActive, userId]
    );

    return result.rows[0] || null;
}

module.exports = {
    getUsers,
    updateUserStatus
};