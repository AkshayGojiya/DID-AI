/**
 * Routes Index
 * ============
 * Exports all route modules for centralized importing.
 */

const authRoutes = require('./auth');
const didRoutes = require('./did');
const documentRoutes = require('./documents');

module.exports = {
    authRoutes,
    didRoutes,
    documentRoutes
};
