/**
 * Middleware Index
 * ================
 * Exports all middleware functions for centralized importing.
 */

const {
    authenticate,
    optionalAuth,
    requireVerified,
    requireRole,
    validateWalletAddress,
    rateLimit
} = require('./authMiddleware');

module.exports = {
    authenticate,
    optionalAuth,
    requireVerified,
    requireRole,
    validateWalletAddress,
    rateLimit
};
