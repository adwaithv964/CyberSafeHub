/**
 * Activity Logger Utility
 * Centralizes logging of user actions for the Dashboard "Recent Activity" feed.
 */

const LOG_STORAGE_KEY = 'userActivityLog';
const MAX_LOG_ENTRIES = 50;

/**
 * Logs a new activity.
 * @param {string} type - 'AUTH' | 'SCAN' | 'VAULT' | 'SYSTEM'
 * @param {string} description - Brief description (e.g., "Health Check Completed")
 * @param {string} details - Extra info (e.g., "Score: 85/100")
 */
export const logActivity = (type, description, details = '') => {
    try {
        const existingLogs = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');

        const newEntry = {
            id: Date.now(),
            type,
            description,
            details,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString(),
            timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedLogs = [newEntry, ...existingLogs].slice(0, MAX_LOG_ENTRIES);
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));

        // Dispatch event for real-time updates if needed in same window
        window.dispatchEvent(new Event('activityLogUpdated'));

        return updatedLogs;
    } catch (error) {
        console.error("Failed to log activity:", error);
        return [];
    }
};

/**
 * Retrieves recent activities.
 * @param {number} limit - Number of entries to return
 */
export const getRecentActivity = (limit = 10) => {
    try {
        const logs = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
        return logs.slice(0, limit);
    } catch (error) {
        return [];
    }
};

/**
 * Helper to get icon props based on activity type
 */
export const getActivityIcon = (type) => {
    switch (type) {
        case 'AUTH': return { icon: 'user', color: 'text-blue-500', bg: 'bg-blue-100' };
        case 'SCAN': return { icon: 'shield', color: 'text-purple-500', bg: 'bg-purple-100' };
        case 'VAULT': return { icon: 'key', color: 'text-yellow-500', bg: 'bg-yellow-100' };
        case 'SYSTEM': return { icon: 'settings', color: 'text-gray-500', bg: 'bg-gray-100' };
        default: return { icon: 'activity', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
};
