/**
 * Routes Index
 * ============
 * Exports all route modules for centralized importing.
 */

const authRoutes       = require('./auth');
const didRoutes        = require('./did');
const documentRoutes   = require('./documents');
const credentialRoutes = require('./credentials');

module.exports = {
    authRoutes,
    didRoutes,
    documentRoutes,
    credentialRoutes,
};
