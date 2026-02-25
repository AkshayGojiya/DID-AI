/**
 * User Model
 * ==========
 * Represents a user in the VerifyX system.
 * Users are identified by their Ethereum wallet address.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    // Ethereum wallet address (primary identifier)
    walletAddress: {
        type: String,
        required: [true, 'Wallet address is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
    },

    // Random nonce for signature authentication
    nonce: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },

    // Decentralized Identifier (DID)
    did: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness
    },

    // User's public key (from wallet or generated)
    publicKey: {
        type: String,
        default: null
    },

    // User role for access control
    role: {
        type: String,
        enum: ['user', 'verifier', 'admin'],
        default: 'user'
    },

    // Profile information
    profile: {
        displayName: { type: String, default: null },
        email: { type: String, default: null },
        avatar: { type: String, default: null }
    },

    // Verification status
    verification: {
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date, default: null },
        verificationLevel: {
            type: String,
            enum: ['none', 'basic', 'advanced', 'premium'],
            default: 'none'
        }
    },

    // Blockchain registration status
    blockchain: {
        didRegistered: { type: Boolean, default: false },
        didTxHash: { type: String, default: null },
        registeredAt: { type: Date, default: null }
    },

    // Account status
    status: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    },

    // Authentication tracking
    lastLogin: {
        type: Date,
        default: null
    },

    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for faster queries
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ did: 1 });
UserSchema.index({ 'verification.isVerified': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for formatted DID
UserSchema.virtual('formattedDID').get(function () {
    return this.did || `did:ethr:${this.walletAddress}`;
});

// Generate new nonce (called after each authentication)
UserSchema.methods.generateNonce = function () {
    this.nonce = crypto.randomBytes(32).toString('hex');
    return this.nonce;
};

// Record login
UserSchema.methods.recordLogin = function () {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

// Check if user is verified
UserSchema.methods.isVerifiedUser = function () {
    return this.verification.isVerified && this.status === 'active';
};

// Static method to find by wallet address
UserSchema.statics.findByWallet = function (walletAddress) {
    return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

// Pre-save middleware to generate DID (async — no next() needed in Mongoose 8.x)
UserSchema.pre('save', async function () {
    if (!this.did && this.walletAddress) {
        this.did = `did:ethr:${this.walletAddress}`;
    }
});

module.exports = mongoose.model('User', UserSchema);
