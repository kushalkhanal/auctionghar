
const User = require('../../models/userModel');
const BiddingRoom = require('../../models/biddingRoomModel');

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalBiddingRooms, pendingKYC] = await Promise.all([
            User.countDocuments(),
            BiddingRoom.countDocuments(),
            User.countDocuments({ kycStatus: 'pending' })
        ]);

        res.status(200).json({
            totalUsers,
            totalBiddingRooms,
            pendingKYC
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};