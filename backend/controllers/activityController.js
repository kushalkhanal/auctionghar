const {
    getAllActivityLogs,
    getUserActivityLogs,
    getActivityStats,
    cleanupOldLogs,
    getRecentFailures,
    getUserTimeline
} = require('../utils/activityLogger');

/**
 * @desc    Get all activity logs (Admin only)
 * @route   GET /api/activity/logs
 * @access  Private/Admin
 */
exports.getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            category,
            status,
            userId,
            startDate,
            endDate,
            search
        } = req.query;

        const result = await getAllActivityLogs({
            page: parseInt(page),
            limit: parseInt(limit),
            action,
            category,
            status,
            userId,
            startDate,
            endDate,
            search
        });

        return res.status(200).json({
            success: true,
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching activity logs'
        });
    }
};

/**
 * @desc    Get activity logs for a specific user
 * @route   GET /api/activity/user/:userId
 * @access  Private/Admin
 */
exports.getUserLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            limit = 50,
            skip = 0,
            action,
            category,
            status,
            startDate,
            endDate
        } = req.query;

        const logs = await getUserActivityLogs(userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            action,
            category,
            status,
            startDate,
            endDate
        });

        return res.status(200).json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching user logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching user activity logs'
        });
    }
};

/**
 * @desc    Get current user's activity logs
 * @route   GET /api/activity/my-logs
 * @access  Private
 */
exports.getMyLogs = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            limit = 50,
            skip = 0,
            action,
            category,
            startDate,
            endDate
        } = req.query;

        const logs = await getUserActivityLogs(userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            action,
            category,
            startDate,
            endDate
        });

        return res.status(200).json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching my logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching your activity logs'
        });
    }
};

/**
 * @desc    Get activity statistics
 * @route   GET /api/activity/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await getActivityStats({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching activity statistics'
        });
    }
};

/**
 * @desc    Get recent failed activities
 * @route   GET /api/activity/failures
 * @access  Private/Admin
 */
exports.getFailures = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const failures = await getRecentFailures(parseInt(limit));

        return res.status(200).json({
            success: true,
            data: failures,
            count: failures.length
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching failures:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching failed activities'
        });
    }
};

/**
 * @desc    Get user activity timeline
 * @route   GET /api/activity/timeline/:userId
 * @access  Private/Admin
 */
exports.getUserTimeline = async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;

        const timeline = await getUserTimeline(userId, parseInt(days));

        return res.status(200).json({
            success: true,
            data: timeline
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error fetching timeline:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching activity timeline'
        });
    }
};

/**
 * @desc    Manually cleanup old logs
 * @route   DELETE /api/activity/cleanup
 * @access  Private/Admin
 */
exports.cleanupLogs = async (req, res) => {
    try {
        const { daysToKeep = 90 } = req.query;

        const deletedCount = await cleanupOldLogs(parseInt(daysToKeep));

        return res.status(200).json({
            success: true,
            message: `Cleaned up ${deletedCount} old activity logs`,
            deletedCount
        });
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error cleaning up logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error cleaning up activity logs'
        });
    }
};

/**
 * @desc    Export activity logs to CSV
 * @route   GET /api/activity/export
 * @access  Private/Admin
 */
exports.exportLogs = async (req, res) => {
    try {
        const {
            action,
            category,
            status,
            userId,
            startDate,
            endDate
        } = req.query;

        const result = await getAllActivityLogs({
            page: 1,
            limit: 10000, // Max export limit
            action,
            category,
            status,
            userId,
            startDate,
            endDate
        });

        // Convert to CSV
        const logs = result.logs;
        if (logs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No logs found for export'
            });
        }

        // CSV headers
        const headers = [
            'Timestamp',
            'User',
            'Action',
            'Category',
            'Status',
            'IP Address',
            'Resource ID',
            'Error Message'
        ];

        // CSV rows
        const rows = logs.map(log => [
            log.createdAt,
            log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown',
            log.action,
            log.category,
            log.status,
            log.ipAddress,
            log.resourceId || '',
            log.errorMessage || ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=activity_logs_${Date.now()}.csv`);

        return res.status(200).send(csvContent);
    } catch (error) {
        console.error('[ACTIVITY_CONTROLLER] Error exporting logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error exporting activity logs'
        });
    }
};
