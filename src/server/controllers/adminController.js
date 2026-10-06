const {
    getUsers,
    updateUserStatus
} = require("../services/adminService");

async function getAllUsers(req, res, next) {
    try {
        const users = await getUsers();

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean."
            });
        }

        if (userId === req.user.id && isActive === false) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own admin account."
            });
        }

        const user = await updateUserStatus(
            userId,
            isActive
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "User status updated successfully.",
            user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    updateStatus
};