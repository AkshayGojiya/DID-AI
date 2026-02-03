/**
 * Authentication Routes
 * =====================
 * Handles Web3 wallet authentication with signature verification.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
    verifySignature,
    generateJWT,
    generateNonceMessage,
    generateNonce,
    isValidAddress
} = require('../utils/auth');
const { validateWalletAddress, rateLimit } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/v1/auth/nonce
 * @desc    Get a nonce for wallet signature authentication
 * @access  Public
 */
router.post('/nonce', validateWalletAddress, rateLimit(20, 60000), async (req, res) => {
    try {
        const { walletAddress } = req.body;

        // Find or create user
        let user = await User.findByWallet(walletAddress);

        if (!user) {
            // Create new user with generated nonce
            user = new User({
                walletAddress: walletAddress.toLowerCase(),
                nonce: generateNonce()
            });
            await user.save();
            console.log(`[AUTH] New user created: ${walletAddress}`);
        } else {
            // Generate new nonce for existing user
            user.generateNonce();
            await user.save();
        }

        // Create the message to be signed
        const message = generateNonceMessage(walletAddress, user.nonce);

        res.json({
            success: true,
            nonce: user.nonce,
            message,
            walletAddress: user.walletAddress,
            isNewUser: user.loginCount === 0
        });
    } catch (error) {
        console.error('[AUTH] Nonce generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate nonce',
            code: 'NONCE_ERROR'
        });
    }
});

/**
 * @route   POST /api/v1/auth/verify
 * @desc    Verify wallet signature and return JWT
 * @access  Public
 */
router.post('/verify', validateWalletAddress, rateLimit(10, 60000), async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        // Validate required fields
        if (!signature) {
            return res.status(400).json({
                success: false,
                error: 'Signature is required',
                code: 'MISSING_SIGNATURE'
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required',
                code: 'MISSING_MESSAGE'
            });
        }

        // Find user
        const user = await User.findByWallet(walletAddress);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found. Please request a nonce first.',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Account is suspended or deleted',
                code: 'ACCOUNT_INACTIVE'
            });
        }

        // Verify the nonce is in the message
        if (!message.includes(user.nonce)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired nonce in message',
                code: 'INVALID_NONCE'
            });
        }

        // Verify the signature
        const isValid = verifySignature(message, signature, walletAddress);

        if (!isValid) {
            console.log(`[AUTH] Invalid signature for ${walletAddress}`);
            return res.status(401).json({
                success: false,
                error: 'Invalid signature',
                code: 'INVALID_SIGNATURE'
            });
        }

        // Signature is valid - generate new nonce for next login
        user.generateNonce();
        await user.recordLogin();

        // Generate JWT token
        const token = generateJWT(user.walletAddress, {
            role: user.role,
            isVerified: user.verification.isVerified,
            userId: user._id.toString()
        });

        console.log(`[AUTH] Successful login: ${walletAddress}`);

        res.json({
            success: true,
            token,
            expiresIn: '7d',
            user: {
                walletAddress: user.walletAddress,
                did: user.did,
                role: user.role,
                verification: {
                    isVerified: user.verification.isVerified,
                    level: user.verification.verificationLevel
                },
                profile: user.profile,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            }
        });
    } catch (error) {
        console.error('[AUTH] Verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const { authenticate } = require('../middleware/authMiddleware');

router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                walletAddress: req.user.walletAddress,
                did: req.user.did,
                role: req.user.role,
                verification: {
                    isVerified: req.user.verification.isVerified,
                    level: req.user.verification.verificationLevel,
                    verifiedAt: req.user.verification.verifiedAt
                },
                profile: req.user.profile,
                blockchain: {
                    didRegistered: req.user.blockchain.didRegistered,
                    registeredAt: req.user.blockchain.registeredAt
                },
                createdAt: req.user.createdAt,
                lastLogin: req.user.lastLogin,
                loginCount: req.user.loginCount
            }
        });
    } catch (error) {
        console.error('[AUTH] Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user data',
            code: 'GET_USER_ERROR'
        });
    }
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate current session (optional - JWT is stateless)
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        // Generate new nonce to invalidate any message signed with old nonce
        req.user.generateNonce();
        await req.user.save();

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('[AUTH] Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            code: 'LOGOUT_ERROR'
        });
    }
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh', authenticate, async (req, res) => {
    try {
        // Generate new token
        const token = generateJWT(req.user.walletAddress, {
            role: req.user.role,
            isVerified: req.user.verification.isVerified,
            userId: req.user._id.toString()
        });

        res.json({
            success: true,
            token,
            expiresIn: '7d'
        });
    } catch (error) {
        console.error('[AUTH] Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed',
            code: 'REFRESH_ERROR'
        });
    }
});

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { displayName, email, avatar } = req.body;

        // Update allowed fields only
        if (displayName !== undefined) req.user.profile.displayName = displayName;
        if (email !== undefined) req.user.profile.email = email;
        if (avatar !== undefined) req.user.profile.avatar = avatar;

        await req.user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: req.user.profile
        });
    } catch (error) {
        console.error('[AUTH] Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Profile update failed',
            code: 'PROFILE_UPDATE_ERROR'
        });
    }
});

module.exports = router;
