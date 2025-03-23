
const {
    supabase,
    adminOperations,
} = require("../config/database");

/**
 * Get all users, optionally filtered by role
 * @route GET /admin/users
 */
const getAllUsers = async (req, res) => {
    const { role } = req.query;
    
    try {
        const users = await adminOperations.getAllUsers(role);
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * Ban a user
 * @route POST /admin/users/:id/ban
 */

const banUser = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id;
    console.log(id);
    try {
        // Validate input
        if (!reason) {
            return res.status(400).json({ message: 'Reason for ban is required' });
        }
        
        const user = await adminOperations.banUser(id, reason, adminId);
        
        return res.status(200).json({
            message: 'User has been banned successfully',
            user
        });
    } catch (error) {
        console.error(`Error banning user ${id}:`, error);
        return res.status(500).json({
            message: 'Error banning user',
            error: error.message
        });
    }
};

/**
 * Verify an organizer account
 * @route POST /admin/users/:id/verify
 */
const verifyOrganizer = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.user_id
    
    try {
        const organizer = await adminOperations.verifyOrganizer(id, adminId);
        
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer not found or not an organizer account' });
        }
        
        return res.status(200).json({
            message: 'Organizer account has been verified',
            organizer
        });
    } catch (error) {
        console.error(`Error verifying organizer ${id}:`, error);
        return res.status(500).json({
            message: 'Error verifying organizer',
            error: error.message
        });
    }
};

/**
 * Get all reports, optionally filtered by status
 * @route GET /admin/reports
 */
const getReports = async (req, res) => {
    const { status } = req.query;
    
    console.log("Getting reports with status:", status);
    
    try {
        const reports = await adminOperations.getAllReports(status);
        console.log("Reports found:", reports.length);
        return res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({
            message: 'Error fetching reports',
            error: error.message
        });
    }
};
/**
 * Resolve a report
 * @route POST /admin/reports/:id/resolve
 */
const resolveReport = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.user_id
    
    try {
        const report = await adminOperations.resolveReport(id, adminId);
        
        return res.status(200).json({
            message: 'Report has been resolved',
            report
        });
    } catch (error) {
        console.error(`Error resolving report ${id}:`, error);
        return res.status(500).json({
            message: 'Error resolving report',
            error: error.message
        });
    }
};

/**
 * Remove an inappropriate event
 * @route DELETE /admin/events/:id
 */
const removeEvent = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.user_id
    
    try {
        if (!reason) {
            return res.status(400).json({ message: 'Reason for removal is required' });
        }
        
        await adminOperations.removeEvent(parseInt(id), reason, adminId);
        
        return res.status(200).json({
            message: 'Event has been removed successfully'
        });
    } catch (error) {
        console.error(`Error removing event ${id}:`, error);
        return res.status(500).json({
            message: 'Error removing event',
            error: error.message
        });
    }
};


module.exports = {
    getAllUsers,
    banUser,
    verifyOrganizer,
    getReports,
    resolveReport,
    removeEvent,
};