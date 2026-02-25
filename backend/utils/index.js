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

const {
    encryptFile,
    decryptFile,
    generateKeyId,
    ALGORITHM
} = require('./encryption');

module.exports = {
    // Auth utilities
    verifySignature,
    generateJWT,
    verifyJWT,
    generateNonceMessage,
    generateNonce,
    hashData,
    isValidAddress,
    getChecksumAddress,

    // Encryption utilities
    encryptFile,
    decryptFile,
    generateKeyId,
    ALGORITHM
};
