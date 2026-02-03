/**
 * Authentication Middleware
 * =========================
 * Provides middleware functions for protecting routes and verifying authentication.
 */

const { verifyJWT, isValidAddress } = require('../utils/auth');
const User = require('../models/User');

/**
 * Authenticate JWT Token
 * Extracts and verifies JWT from Authorization header
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'No authorization header provided',
                code: 'NO_AUTH_HEADER'
            });
        }

        // Check for Bearer token format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization format. Use: Bearer <token>',
                code: 'INVALID_AUTH_FORMAT'
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = verifyJWT(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        // Get user from database
        const user = await User.findByWallet(decoded.walletAddress);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
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

        // Attach user and decoded token to request
        req.user = user;
        req.token = decoded;
        req.walletAddress = decoded.walletAddress;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Optional Authentication
 * Same as authenticate but doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without user
        }

        const token = authHeader.substring(7);
        const decoded = verifyJWT(token);

        if (decoded) {
            const user = await User.findByWallet(decoded.walletAddress);
            if (user && user.status === 'active') {
                req.user = user;
                req.token = decoded;
                req.walletAddress = decoded.walletAddress;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication on error
        next();
    }
};

/**
 * Require Verified User
 * Must be used after authenticate middleware
 */
const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }

    if (!req.user.verification.isVerified) {
        return res.status(403).json({
            success: false,
            error: 'Account verification required',
            code: 'VERIFICATION_REQUIRED'
        });
    }

    next();
};

/**
 * Require Specific Role(s)
 * Must be used after authenticate middleware
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const flatRoles = roles.flat();

        if (!flatRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${flatRoles.join(' or ')}`,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

/**
 * Validate Wallet Address in Request Body
 */
const validateWalletAddress = (req, res, next) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            error: 'Wallet address is required',
            code: 'MISSING_WALLET'
        });
    }

    if (!isValidAddress(walletAddress)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Ethereum address format',
            code: 'INVALID_ADDRESS'
        });
    }

    // Normalize to lowercase
    req.body.walletAddress = walletAddress.toLowerCase();
    next();
};

/**
 * Rate limit by wallet address
 * Simple in-memory rate limiting (use Redis in production)
 */
const walletRateLimits = new Map();

const rateLimit = (maxRequests = 10, windowMs = 60000) => {
    return (req, res, next) => {
        const identifier = req.body.walletAddress || req.ip;
        const now = Date.now();

        if (!walletRateLimits.has(identifier)) {
            walletRateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
            return next();
        }

        const limit = walletRateLimits.get(identifier);

        if (now > limit.resetAt) {
            walletRateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (limit.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((limit.resetAt - now) / 1000)
            });
        }

        limit.count++;
        next();
    };
};

// Clean up rate limits periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of walletRateLimits.entries()) {
        if (now > value.resetAt) {
            walletRateLimits.delete(key);
        }
    }
}, 60000);

module.exports = {
    authenticate,
    optionalAuth,
    requireVerified,
    requireRole,
    validateWalletAddress,
    rateLimit
};
