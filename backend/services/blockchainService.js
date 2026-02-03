/**
 * Blockchain Service
 * ==================
 * Provides integration with Ethereum blockchain for DID and Credential management.
 */

const { ethers } = require('ethers');
const { DIDRegistry, CredentialRegistry } = require('../config/contracts');

// Initialize provider
const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC);

// Contract addresses from environment or config
const DID_REGISTRY_ADDRESS = process.env.DID_REGISTRY_ADDRESS || DIDRegistry.address;
const CREDENTIAL_REGISTRY_ADDRESS = process.env.CREDENTIAL_REGISTRY_ADDRESS || CredentialRegistry.address;

// Initialize read-only contract instances
const didRegistryContract = new ethers.Contract(
    DID_REGISTRY_ADDRESS,
    DIDRegistry.abi,
    provider
);

const credentialRegistryContract = new ethers.Contract(
    CREDENTIAL_REGISTRY_ADDRESS,
    CredentialRegistry.abi,
    provider
);

/**
 * Check if provider is connected
 * @returns {Promise<boolean>}
 */
const isConnected = async () => {
    try {
        await provider.getBlockNumber();
        return true;
    } catch (error) {
        console.error('[Blockchain] Provider not connected:', error.message);
        return false;
    }
};

/**
 * Get provider info
 * @returns {Promise<object>}
 */
const getProviderInfo = async () => {
    try {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        return {
            connected: true,
            chainId: Number(network.chainId),
            blockNumber,
            rpcUrl: BLOCKCHAIN_RPC
        };
    } catch (error) {
        return {
            connected: false,
            error: error.message
        };
    }
};

// ===========================================
// DID Registry Functions
// ===========================================

/**
 * Get a wallet instance for transactions
 * @param {string} privateKey - Private key of the signer
 * @returns {ethers.Wallet}
 */
const getWallet = (privateKey) => {
    return new ethers.Wallet(privateKey, provider);
};

/**
 * Register a DID on the blockchain
 * @param {string} publicKey - The public key to register
 * @param {string} privateKey - The private key to sign the transaction
 * @returns {Promise<object>} - Transaction result
 */
const registerDID = async (publicKey, privateKey) => {
    try {
        const wallet = getWallet(privateKey);
        const contract = didRegistryContract.connect(wallet);

        console.log(`[Blockchain] Registering DID for ${wallet.address}...`);

        const tx = await contract.registerDID(publicKey);
        console.log(`[Blockchain] Transaction submitted: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`[Blockchain] DID registered in block ${receipt.blockNumber}`);

        return {
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            address: wallet.address
        };
    } catch (error) {
        console.error('[Blockchain] Register DID error:', error.message);
        throw new Error(`Failed to register DID: ${error.message}`);
    }
};

/**
 * Update a DID's public key
 * @param {string} newPublicKey - The new public key
 * @param {string} privateKey - The private key to sign the transaction
 * @returns {Promise<object>} - Transaction result
 */
const updateDID = async (newPublicKey, privateKey) => {
    try {
        const wallet = getWallet(privateKey);
        const contract = didRegistryContract.connect(wallet);

        console.log(`[Blockchain] Updating DID for ${wallet.address}...`);

        const tx = await contract.updateDID(newPublicKey);
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('[Blockchain] Update DID error:', error.message);
        throw new Error(`Failed to update DID: ${error.message}`);
    }
};

/**
 * Deactivate a DID
 * @param {string} privateKey - The private key to sign the transaction
 * @returns {Promise<object>} - Transaction result
 */
const deactivateDID = async (privateKey) => {
    try {
        const wallet = getWallet(privateKey);
        const contract = didRegistryContract.connect(wallet);

        console.log(`[Blockchain] Deactivating DID for ${wallet.address}...`);

        const tx = await contract.deactivateDID();
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('[Blockchain] Deactivate DID error:', error.message);
        throw new Error(`Failed to deactivate DID: ${error.message}`);
    }
};

/**
 * Get DID document for an address (read-only)
 * @param {string} address - The wallet address to query
 * @returns {Promise<object|null>} - DID document or null if not found
 */
const getDID = async (address) => {
    try {
        const didDocument = await didRegistryContract.getDID(address);

        return {
            controller: didDocument.controller,
            publicKey: didDocument.publicKey,
            createdAt: Number(didDocument.createdAt),
            isActive: didDocument.isActive
        };
    } catch (error) {
        // DID not found returns an error
        if (error.message.includes('DID not found')) {
            return null;
        }
        throw error;
    }
};

/**
 * Check if an address has an active DID (read-only)
 * @param {string} address - The wallet address to check
 * @returns {Promise<boolean>}
 */
const hasDID = async (address) => {
    try {
        return await didRegistryContract.hasDID(address);
    } catch (error) {
        console.error('[Blockchain] hasDID error:', error.message);
        return false;
    }
};

// ===========================================
// Credential Registry Functions
// ===========================================

/**
 * Issue a credential on the blockchain
 * @param {string} credentialHash - Keccak256 hash of credential data
 * @param {string} subjectAddress - Address of the credential holder
 * @param {number} expiresAt - Unix timestamp when credential expires
 * @param {string} privateKey - Private key of the issuer
 * @returns {Promise<object>} - Transaction result
 */
const issueCredential = async (credentialHash, subjectAddress, expiresAt, privateKey) => {
    try {
        const wallet = getWallet(privateKey);
        const contract = credentialRegistryContract.connect(wallet);

        // Ensure credentialHash is bytes32
        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        console.log(`[Blockchain] Issuing credential for ${subjectAddress}...`);

        const tx = await contract.issueCredential(hash, subjectAddress, expiresAt);
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            credentialHash: hash,
            subject: subjectAddress,
            issuer: wallet.address,
            expiresAt
        };
    } catch (error) {
        console.error('[Blockchain] Issue credential error:', error.message);
        throw new Error(`Failed to issue credential: ${error.message}`);
    }
};

/**
 * Verify if a credential is valid (read-only)
 * @param {string} credentialHash - The credential hash to verify
 * @returns {Promise<boolean>}
 */
const verifyCredential = async (credentialHash) => {
    try {
        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        return await credentialRegistryContract.verifyCredential(hash);
    } catch (error) {
        console.error('[Blockchain] Verify credential error:', error.message);
        return false;
    }
};

/**
 * Get credential details (read-only)
 * @param {string} credentialHash - The credential hash to query
 * @returns {Promise<object|null>}
 */
const getCredential = async (credentialHash) => {
    try {
        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        const credential = await credentialRegistryContract.getCredential(hash);

        return {
            credentialHash: credential.credentialHash,
            subject: credential.subject,
            issuer: credential.issuer,
            issuedAt: Number(credential.issuedAt),
            expiresAt: Number(credential.expiresAt),
            isRevoked: credential.isRevoked
        };
    } catch (error) {
        if (error.message.includes('Credential not found')) {
            return null;
        }
        throw error;
    }
};

/**
 * Get all credentials for a subject (read-only)
 * @param {string} subjectAddress - The subject's wallet address
 * @returns {Promise<string[]>} - Array of credential hashes
 */
const getSubjectCredentials = async (subjectAddress) => {
    try {
        return await credentialRegistryContract.getSubjectCredentials(subjectAddress);
    } catch (error) {
        console.error('[Blockchain] Get subject credentials error:', error.message);
        return [];
    }
};

/**
 * Revoke a credential
 * @param {string} credentialHash - The credential hash to revoke
 * @param {string} privateKey - Private key of issuer or subject
 * @returns {Promise<object>} - Transaction result
 */
const revokeCredential = async (credentialHash, privateKey) => {
    try {
        const wallet = getWallet(privateKey);
        const contract = credentialRegistryContract.connect(wallet);

        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        console.log(`[Blockchain] Revoking credential ${hash}...`);

        const tx = await contract.revokeCredential(hash);
        const receipt = await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('[Blockchain] Revoke credential error:', error.message);
        throw new Error(`Failed to revoke credential: ${error.message}`);
    }
};

/**
 * Check if a credential is expired (read-only)
 * @param {string} credentialHash - The credential hash to check
 * @returns {Promise<boolean>}
 */
const isCredentialExpired = async (credentialHash) => {
    try {
        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        return await credentialRegistryContract.isExpired(hash);
    } catch (error) {
        console.error('[Blockchain] isExpired error:', error.message);
        return true; // Assume expired on error
    }
};

/**
 * Check if a credential is revoked (read-only)
 * @param {string} credentialHash - The credential hash to check
 * @returns {Promise<boolean>}
 */
const isCredentialRevoked = async (credentialHash) => {
    try {
        const hash = credentialHash.startsWith('0x')
            ? credentialHash
            : ethers.id(credentialHash);

        return await credentialRegistryContract.isRevoked(hash);
    } catch (error) {
        console.error('[Blockchain] isRevoked error:', error.message);
        return true; // Assume revoked on error
    }
};

// ===========================================
// Utility Functions
// ===========================================

/**
 * Generate a credential hash from data
 * @param {object} data - Credential data to hash
 * @returns {string} - Keccak256 hash
 */
const hashCredentialData = (data) => {
    const jsonString = JSON.stringify(data);
    return ethers.id(jsonString);
};

/**
 * Get contract addresses
 * @returns {object}
 */
const getContractAddresses = () => ({
    didRegistry: DID_REGISTRY_ADDRESS,
    credentialRegistry: CREDENTIAL_REGISTRY_ADDRESS
});

module.exports = {
    // Provider
    provider,
    isConnected,
    getProviderInfo,
    getWallet,

    // DID Registry
    registerDID,
    updateDID,
    deactivateDID,
    getDID,
    hasDID,

    // Credential Registry
    issueCredential,
    verifyCredential,
    getCredential,
    getSubjectCredentials,
    revokeCredential,
    isCredentialExpired,
    isCredentialRevoked,

    // Utilities
    hashCredentialData,
    getContractAddresses,

    // Contract instances (read-only)
    didRegistryContract,
    credentialRegistryContract
};
