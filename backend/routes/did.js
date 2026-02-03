/**
 * DID Routes
 * ==========
 * Handles Decentralized Identifier (DID) operations.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const { authenticate, requireVerified } = require('../middleware/authMiddleware');
const { isValidAddress } = require('../utils/auth');

/**
 * @route   GET /api/v1/did/status
 * @desc    Get blockchain connection status
 * @access  Public
 */
router.get('/status', async (req, res) => {
    try {
        const providerInfo = await blockchainService.getProviderInfo();
        const contracts = blockchainService.getContractAddresses();

        res.json({
            success: true,
            blockchain: providerInfo,
            contracts
        });
    } catch (error) {
        console.error('[DID] Status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get blockchain status',
            code: 'STATUS_ERROR'
        });
    }
});

/**
 * @route   GET /api/v1/did/:address
 * @desc    Get DID document for an address
 * @access  Public
 */
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;

        // Validate address
        if (!isValidAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address',
                code: 'INVALID_ADDRESS'
            });
        }

        // Check if DID exists on blockchain
        const hasDID = await blockchainService.hasDID(address);

        if (!hasDID) {
            // Return DID from database if exists
            const user = await User.findByWallet(address);

            if (user) {
                return res.json({
                    success: true,
                    did: {
                        id: user.did,
                        controller: user.walletAddress,
                        publicKey: user.publicKey,
                        onChain: false,
                        status: user.blockchain.didRegistered ? 'registered' : 'unregistered'
                    },
                    source: 'database'
                });
            }

            return res.status(404).json({
                success: false,
                error: 'DID not found',
                code: 'DID_NOT_FOUND'
            });
        }

        // Get DID from blockchain
        const didDocument = await blockchainService.getDID(address);

        res.json({
            success: true,
            did: {
                id: `did:ethr:${address.toLowerCase()}`,
                controller: didDocument.controller,
                publicKey: didDocument.publicKey,
                createdAt: new Date(didDocument.createdAt * 1000).toISOString(),
                isActive: didDocument.isActive,
                onChain: true
            },
            source: 'blockchain'
        });
    } catch (error) {
        console.error('[DID] Get DID error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get DID',
            code: 'GET_DID_ERROR'
        });
    }
});

/**
 * @route   POST /api/v1/did/register
 * @desc    Register a DID on the blockchain
 * @access  Private
 */
router.post('/register', authenticate, async (req, res) => {
    try {
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({
                success: false,
                error: 'Public key is required',
                code: 'MISSING_PUBLIC_KEY'
            });
        }

        // Check if already registered
        if (req.user.blockchain.didRegistered) {
            return res.status(400).json({
                success: false,
                error: 'DID already registered on blockchain',
                code: 'ALREADY_REGISTERED'
            });
        }

        // Check on blockchain
        const hasDID = await blockchainService.hasDID(req.user.walletAddress);

        if (hasDID) {
            // Update database to reflect blockchain state
            req.user.blockchain.didRegistered = true;
            await req.user.save();

            return res.status(400).json({
                success: false,
                error: 'DID already exists on blockchain',
                code: 'ALREADY_EXISTS'
            });
        }

        // Note: For security, we don't accept private keys from client
        // In production, use a signing service or hardware wallet
        // For demo/development, we'll return instructions

        res.json({
            success: true,
            message: 'DID registration prepared',
            instructions: {
                step1: 'Sign the transaction with your wallet',
                step2: 'Submit the signed transaction to the blockchain',
                contractAddress: blockchainService.getContractAddresses().didRegistry,
                method: 'registerDID',
                args: [publicKey],
                walletAddress: req.user.walletAddress
            },
            // For frontend to construct the transaction
            transaction: {
                to: blockchainService.getContractAddresses().didRegistry,
                data: blockchainService.didRegistryContract.interface.encodeFunctionData(
                    'registerDID',
                    [publicKey]
                )
            }
        });
    } catch (error) {
        console.error('[DID] Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register DID',
            code: 'REGISTER_ERROR'
        });
    }
});

/**
 * @route   POST /api/v1/did/confirm-registration
 * @desc    Confirm DID registration after blockchain transaction
 * @access  Private
 */
router.post('/confirm-registration', authenticate, async (req, res) => {
    try {
        const { txHash } = req.body;

        if (!txHash) {
            return res.status(400).json({
                success: false,
                error: 'Transaction hash is required',
                code: 'MISSING_TX_HASH'
            });
        }

        // Verify the DID exists on blockchain
        const hasDID = await blockchainService.hasDID(req.user.walletAddress);

        if (!hasDID) {
            return res.status(400).json({
                success: false,
                error: 'DID not found on blockchain. Transaction may be pending.',
                code: 'DID_NOT_FOUND'
            });
        }

        // Get DID details from blockchain
        const didDocument = await blockchainService.getDID(req.user.walletAddress);

        // Update user record
        req.user.blockchain.didRegistered = true;
        req.user.blockchain.didTxHash = txHash;
        req.user.blockchain.registeredAt = new Date();
        req.user.publicKey = didDocument.publicKey;
        await req.user.save();

        res.json({
            success: true,
            message: 'DID registration confirmed',
            did: {
                id: req.user.did,
                controller: didDocument.controller,
                publicKey: didDocument.publicKey,
                txHash,
                registeredAt: req.user.blockchain.registeredAt
            }
        });
    } catch (error) {
        console.error('[DID] Confirm registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to confirm DID registration',
            code: 'CONFIRM_ERROR'
        });
    }
});

/**
 * @route   PUT /api/v1/did/update
 * @desc    Update DID public key
 * @access  Private (requires verified)
 */
router.put('/update', authenticate, requireVerified, async (req, res) => {
    try {
        const { newPublicKey } = req.body;

        if (!newPublicKey) {
            return res.status(400).json({
                success: false,
                error: 'New public key is required',
                code: 'MISSING_PUBLIC_KEY'
            });
        }

        // Check if DID is registered
        if (!req.user.blockchain.didRegistered) {
            return res.status(400).json({
                success: false,
                error: 'DID not registered on blockchain',
                code: 'NOT_REGISTERED'
            });
        }

        res.json({
            success: true,
            message: 'DID update prepared',
            transaction: {
                to: blockchainService.getContractAddresses().didRegistry,
                data: blockchainService.didRegistryContract.interface.encodeFunctionData(
                    'updateDID',
                    [newPublicKey]
                )
            }
        });
    } catch (error) {
        console.error('[DID] Update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update DID',
            code: 'UPDATE_ERROR'
        });
    }
});

/**
 * @route   DELETE /api/v1/did/deactivate
 * @desc    Deactivate DID (irreversible)
 * @access  Private (requires verified)
 */
router.delete('/deactivate', authenticate, requireVerified, async (req, res) => {
    try {
        // Check if DID is registered
        if (!req.user.blockchain.didRegistered) {
            return res.status(400).json({
                success: false,
                error: 'DID not registered on blockchain',
                code: 'NOT_REGISTERED'
            });
        }

        res.json({
            success: true,
            message: 'DID deactivation prepared. WARNING: This action is irreversible!',
            transaction: {
                to: blockchainService.getContractAddresses().didRegistry,
                data: blockchainService.didRegistryContract.interface.encodeFunctionData(
                    'deactivateDID',
                    []
                )
            }
        });
    } catch (error) {
        console.error('[DID] Deactivate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate DID',
            code: 'DEACTIVATE_ERROR'
        });
    }
});

/**
 * @route   GET /api/v1/did/check/:address
 * @desc    Check if an address has active DID
 * @access  Public
 */
router.get('/check/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!isValidAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address',
                code: 'INVALID_ADDRESS'
            });
        }

        const hasDID = await blockchainService.hasDID(address);

        res.json({
            success: true,
            address: address.toLowerCase(),
            hasDID,
            did: hasDID ? `did:ethr:${address.toLowerCase()}` : null
        });
    } catch (error) {
        console.error('[DID] Check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check DID',
            code: 'CHECK_ERROR'
        });
    }
});

module.exports = router;
