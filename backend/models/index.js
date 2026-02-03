/**
 * Models Index
 * ============
 * Central export point for all database models.
 */

const User = require('./User');
const Document = require('./Document');
const Verification = require('./Verification');
const Credential = require('./Credential');

module.exports = {
    User,
    Document,
    Verification,
    Credential
};
