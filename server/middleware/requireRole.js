/**
 * requireRole middleware — must be used AFTER adminAuthMiddleware
 * which attaches req.adminRole from the MongoDB Admin collection.
 *
 * Usage: router.get('/secret', adminAuthMiddleware, requireRole('super_admin'), handler)
 */
module.exports = function requireRole(...allowedRoles) {
    return function (req, res, next) {
        if (!req.adminRole) {
            return res.status(403).json({ error: 'Role not determined. Ensure adminAuthMiddleware runs first.' });
        }
        if (!allowedRoles.includes(req.adminRole)) {
            return res.status(403).json({
                error: `Access denied. This action requires one of: [${allowedRoles.join(', ')}]. Your role: ${req.adminRole}`
            });
        }
        next();
    };
};
