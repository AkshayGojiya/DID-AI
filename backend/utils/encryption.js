/**
 * Encryption Utility
 * ==================
 * Handles file encryption/decryption using AES-256-CBC.
 * Files are encrypted before uploading to IPFS for privacy.
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * Encrypt a file buffer
 * @param {Buffer} buffer - Raw file buffer
 * @returns {{ encrypted: Buffer, key: string, iv: string }}
 */
const encryptFile = (buffer) => {
    const key = crypto.randomBytes(KEY_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        encrypted,
        key: key.toString('hex'),
        iv: iv.toString('hex')
    };
};

/**
 * Decrypt a file buffer
 * @param {Buffer} encryptedBuffer - Encrypted file buffer
 * @param {string} keyHex - Hex-encoded encryption key
 * @param {string} ivHex - Hex-encoded initialization vector
 * @returns {Buffer} Decrypted file buffer
 */
const decryptFile = (encryptedBuffer, keyHex, ivHex) => {
    const key = Buffer.from(keyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

/**
 * Generate a unique key ID for referencing stored keys
 * @returns {string} UUID-style key identifier
 */
const generateKeyId = () => {
    return crypto.randomUUID();
};

module.exports = {
    encryptFile,
    decryptFile,
    generateKeyId,
    ALGORITHM
};
