/**
 * Authentication Utilities
 * ========================
 * Provides signature verification and JWT token generation for Web3 authentication.
 */

const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Verify an Ethereum signature
 * @param {string} message - The original message that was signed
 * @param {string} signature - The signature produced by the wallet
 * @param {string} expectedAddress - The expected signer's wallet address
 * @returns {boolean} - True if signature is valid and matches the address
 */
const verifySignature = (message, signature, expectedAddress) => {
    try {
        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        // Compare addresses (case-insensitive)
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification failed:', error.message);
        return false;
    }
};

/**
 * Generate a JWT token for an authenticated user
 * @param {string} walletAddress - The user's wallet address
 * @param {object} additionalData - Additional data to include in the token
 * @returns {string} - The generated JWT token
 */
const generateJWT = (walletAddress, additionalData = {}) => {
    const payload = {
        walletAddress: walletAddress.toLowerCase(),
        did: `did:ethr:${walletAddress.toLowerCase()}`,
        ...additionalData,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
const verifyJWT = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
};

/**
 * Generate a nonce message for wallet signature
 * @param {string} walletAddress - The user's wallet address
 * @param {string} nonce - The random nonce value
 * @returns {string} - The formatted message to be signed
 */
const generateNonceMessage = (walletAddress, nonce) => {
    return `Sign this message to authenticate with VerifyX.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
};

/**
 * Generate a random nonce
 * @returns {string} - A random nonce string
 */
const generateNonce = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Hash a password or sensitive data using ethers' keccak256
 * @param {string} data - Data to hash
 * @returns {string} - The keccak256 hash
 */
const hashData = (data) => {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
};

/**
 * Validate Ethereum address format
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid Ethereum address
 */
const isValidAddress = (address) => {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
};

/**
 * Get checksummed address
 * @param {string} address - The address to checksum
 * @returns {string} - The checksummed address
 */
const getChecksumAddress = (address) => {
    try {
        return ethers.getAddress(address);
    } catch {
        return null;
    }
};

module.exports = {
    verifySignature,
    generateJWT,
    verifyJWT,
    generateNonceMessage,
    generateNonce,
    hashData,
    isValidAddress,
    getChecksumAddress,
    JWT_SECRET,
    JWT_EXPIRY
};
