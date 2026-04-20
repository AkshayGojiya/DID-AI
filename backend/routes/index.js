/**
 * Routes Index
 * ============
 * Exports all route modules for centralized importing.
 */

const authRoutes           = require('./auth');
const didRoutes            = require('./did');
const documentRoutes       = require('./documents');
const credentialRoutes     = require('./credentials');
const activityRoutes       = require('./activity');
const verificationRoutes   = require('./verifications');
const adminRoutes          = require('./admin');

module.exports = {
    authRoutes,
    didRoutes,
    documentRoutes,
    credentialRoutes,
    activityRoutes,
    verificationRoutes,
    adminRoutes,
};
