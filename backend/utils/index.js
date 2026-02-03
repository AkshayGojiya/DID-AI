/**
 * Utils Index
 * ===========
 * Exports all utility functions for centralized importing.
 */

const {
    verifySignature,
    generateJWT,
    verifyJWT,
    generateNonceMessage,
    generateNonce,
    hashData,
    isValidAddress,
    getChecksumAddress
} = require('./auth');

module.exports = {
    // Auth utilities
    verifySignature,
    generateJWT,
    verifyJWT,
    generateNonceMessage,
    generateNonce,
    hashData,
    isValidAddress,
    getChecksumAddress
};
