

const User = require('../../models/userModel');

// @desc    Get all users for the admin panel
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// @desc    Delete a user by ID
exports.deleteUserById = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admin from deleting themselves
        if (userToDelete._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        // Prevent deletion of other admin accounts (optional security measure)
        if (userToDelete.role === 'admin' && req.user._id.toString() !== userToDelete._id.toString()) {
            return res.status(403).json({ message: "Cannot delete other admin accounts" });
        }

        await userToDelete.deleteOne();
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};