/**
 * Routes Index
 * ============
 * Exports all route modules for centralized importing.
 */

const authRoutes = require('./auth');
const didRoutes = require('./did');

module.exports = {
    authRoutes,
    didRoutes
};
