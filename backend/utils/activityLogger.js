const ActivityLog = require('../models/activityLogModel');

/**
 * Log user activity
 * @param {Object} options - Activity log options
 * @param {String} options.userId - User ID
 * @param {String} options.action - Action type
 * @param {String} options.category - Action category
 * @param {Object} options.metadata - Additional metadata
 * @param {String} options.ipAddress - IP address
 * @param {String} options.userAgent - User agent
 * @param {String} options.status - Status (success/failure/pending)
 * @param {String} options.errorMessage - Error message if failed
 * @param {Number} options.duration - Duration in milliseconds
 * @param {String} options.resourceId - Related resource ID
 * @param {String} options.resourceType - Related resource type
 */
const logActivity = async (options) => {
    try {
        const {
            userId,
            action,
            category,
            metadata = {},
            ipAddress = 'unknown',
            userAgent = null,
            status = 'success',
            errorMessage = null,
            duration = null,
            resourceId = null,
            resourceType = null
        } = options;

        // Validate required fields
        if (!userId || !action || !category) {
            console.error('[ACTIVITY_LOG] Missing required fields:', { userId, action, category });
            return null;
        }

        // Create activity log
        const activityLog = new ActivityLog({
            userId,
            action,
            category,
            metadata,
            ipAddress,
            userAgent,
            status,
            errorMessage,
            duration,
            resourceId,
            resourceType
        });

        await activityLog.save();
        console.log(`[ACTIVITY_LOG] Logged: ${action} by user ${userId}`);

        return activityLog;
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error logging activity:', error);
        return null;
    }
};

/**
 * Get activity logs for a specific user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} Activity logs
 */
const getUserActivityLogs = async (userId, options = {}) => {
    try {
        const {
            limit = 50,
            skip = 0,
            action = null,
            category = null,
            status = null,
            startDate = null,
            endDate = null
        } = options;

        const query = { userId };

        if (action) query.action = action;
        if (category) query.category = category;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        return logs;
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error fetching user logs:', error);
        return [];
    }
};

/**
 * Get all activity logs with filters
 * @param {Object} options - Query options
 * @returns {Object} Logs and pagination info
 */
const getAllActivityLogs = async (options = {}) => {
    try {
        const {
            page = 1,
            limit = 50,
            action = null,
            category = null,
            status = null,
            userId = null,
            startDate = null,
            endDate = null,
            search = null
        } = options;

        const query = {};

        if (action) query.action = action;
        if (category) query.category = category;
        if (status) query.status = status;
        if (userId) query.userId = userId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { action: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ActivityLog.find(query)
                .populate('userId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            ActivityLog.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error fetching all logs:', error);
        return { logs: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
    }
};

/**
 * Get activity statistics
 * @param {Object} options - Query options
 * @returns {Object} Statistics
 */
const getActivityStats = async (options = {}) => {
    try {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            endDate = new Date()
        } = options;

        const query = {
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        const [
            totalLogs,
            byCategory,
            byAction,
            byStatus,
            topUsers
        ] = await Promise.all([
            ActivityLog.countDocuments(query),

            ActivityLog.aggregate([
                { $match: query },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            ActivityLog.aggregate([
                { $match: query },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            ActivityLog.aggregate([
                { $match: query },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),

            ActivityLog.aggregate([
                { $match: query },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: '$_id',
                        count: 1,
                        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                        email: '$user.email'
                    }
                }
            ])
        ]);

        return {
            totalLogs,
            byCategory,
            byAction,
            byStatus,
            topUsers,
            dateRange: { startDate, endDate }
        };
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error fetching stats:', error);
        return null;
    }
};

/**
 * Delete old activity logs
 * @param {Number} daysToKeep - Number of days to keep logs
 * @returns {Number} Number of deleted logs
 */
const cleanupOldLogs = async (daysToKeep = 90) => {
    try {
        const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

        const result = await ActivityLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        console.log(`[ACTIVITY_LOG] Cleaned up ${result.deletedCount} old logs`);
        return result.deletedCount;
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error cleaning up logs:', error);
        return 0;
    }
};

/**
 * Get recent failed activities
 * @param {Number} limit - Number of logs to return
 * @returns {Array} Recent failed activities
 */
const getRecentFailures = async (limit = 20) => {
    try {
        const logs = await ActivityLog.find({ status: 'failure' })
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return logs;
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error fetching recent failures:', error);
        return [];
    }
};

/**
 * Get activity timeline for a user
 * @param {String} userId - User ID
 * @param {Number} days - Number of days to look back
 * @returns {Array} Activity timeline
 */
const getUserTimeline = async (userId, days = 7) => {
    try {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const timeline = await ActivityLog.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        category: '$category'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': -1 }
            }
        ]);

        return timeline;
    } catch (error) {
        console.error('[ACTIVITY_LOG] Error fetching user timeline:', error);
        return [];
    }
};

module.exports = {
    logActivity,
    getUserActivityLogs,
    getAllActivityLogs,
    getActivityStats,
    cleanupOldLogs,
    getRecentFailures,
    getUserTimeline
};
