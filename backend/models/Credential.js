/**
 * Credential Model
 * ================
 * Represents verifiable credentials issued after successful verification.
 * Credentials are hashed and stored on the blockchain.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const CredentialSchema = new mongoose.Schema({
    // Unique credential identifier
    credentialId: {
        type: String,
        required: true,
        unique: true,
        default: () => `cred_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
    },

    // Credential type (W3C Verifiable Credential standard)
    type: {
        type: String,
        enum: ['IdentityCredential', 'AgeVerification', 'NationalityVerification', 'AddressVerification'],
        default: 'IdentityCredential'
    },

    // Issuer DID (VerifyX system DID)
    issuer: {
        did: { type: String, required: true },
        name: { type: String, default: 'VerifyX' }
    },

    // Subject (credential holder)
    subject: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        did: {
            type: String,
            required: true
        }
    },

    // Reference to the verification that led to this credential
    verificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Verification',
        required: true
    },

    // Claims (attributes that are certified)
    claims: {
        fullName: { type: String, default: null },
        dateOfBirth: { type: Date, default: null },
        nationality: { type: String, default: null },
        documentType: { type: String, default: null },
        documentNumber: { type: String, default: null }, // Hashed for privacy
        isOver18: { type: Boolean, default: null },
        isOver21: { type: Boolean, default: null }
    },

    // Which claims are included (for selective disclosure)
    includedClaims: [{
        type: String,
        enum: ['fullName', 'dateOfBirth', 'nationality', 'documentType', 'isOver18', 'isOver21']
    }],

    // Credential hash (stored on blockchain)
    hash: {
        algorithm: { type: String, default: 'sha256' },
        value: { type: String, required: true }
    },

    // Blockchain record
    blockchain: {
        stored: { type: Boolean, default: false },
        txHash: { type: String, default: null },
        blockNumber: { type: Number, default: null },
        network: { type: String, default: 'ethereum' },
        contractAddress: { type: String, default: null },
        storedAt: { type: Date, default: null }
    },

    // Cryptographic proof
    proof: {
        type: { type: String, default: 'EcdsaSecp256k1Signature2019' },
        created: { type: Date, default: Date.now },
        proofPurpose: { type: String, default: 'assertionMethod' },
        verificationMethod: { type: String, default: null },
        jws: { type: String, default: null } // JSON Web Signature
    },

    // Credential status
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired', 'suspended'],
        default: 'active'
    },

    // Revocation details
    revocation: {
        revokedAt: { type: Date, default: null },
        reason: { type: String, default: null },
        revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },

    // Validity period
    issuedAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    },

    // Usage tracking
    usage: {
        shareCount: { type: Number, default: 0 },
        verifyCount: { type: Number, default: 0 },
        lastSharedAt: { type: Date, default: null },
        lastVerifiedAt: { type: Date, default: null }
    }
}, {
    timestamps: true
});

// Indexes
CredentialSchema.index({ credentialId: 1 });
CredentialSchema.index({ 'subject.userId': 1 });
CredentialSchema.index({ 'subject.did': 1 });
CredentialSchema.index({ 'hash.value': 1 });
CredentialSchema.index({ 'blockchain.txHash': 1 });
CredentialSchema.index({ status: 1 });
CredentialSchema.index({ expiresAt: 1 });

// Virtual for checking if credential is valid
CredentialSchema.virtual('isValid').get(function () {
    return this.status === 'active' && new Date() < this.expiresAt;
});

// Generate credential hash
CredentialSchema.methods.generateHash = function () {
    const dataToHash = {
        issuer: this.issuer.did,
        subject: this.subject.did,
        claims: this.claims,
        issuedAt: this.issuedAt.toISOString(),
        expiresAt: this.expiresAt.toISOString()
    };

    this.hash.value = crypto
        .createHash('sha256')
        .update(JSON.stringify(dataToHash))
        .digest('hex');

    return this.hash.value;
};

// Record blockchain storage
CredentialSchema.methods.recordBlockchainStorage = function (txHash, blockNumber, contractAddress) {
    this.blockchain.stored = true;
    this.blockchain.txHash = txHash;
    this.blockchain.blockNumber = blockNumber;
    this.blockchain.contractAddress = contractAddress;
    this.blockchain.storedAt = new Date();
    return this.save();
};

// Revoke credential
CredentialSchema.methods.revoke = function (reason, revokedBy) {
    this.status = 'revoked';
    this.revocation.revokedAt = new Date();
    this.revocation.reason = reason;
    this.revocation.revokedBy = revokedBy;
    return this.save();
};

// Record share
CredentialSchema.methods.recordShare = function () {
    this.usage.shareCount += 1;
    this.usage.lastSharedAt = new Date();
    return this.save();
};

// Record verification
CredentialSchema.methods.recordVerification = function () {
    this.usage.verifyCount += 1;
    this.usage.lastVerifiedAt = new Date();
    return this.save();
};

// Find credentials by user
CredentialSchema.statics.findByUser = function (userId) {
    return this.find({
        'subject.userId': userId,
        status: 'active',
        expiresAt: { $gt: new Date() }
    }).sort({ issuedAt: -1 });
};

// Find by hash (for blockchain verification)
CredentialSchema.statics.findByHash = function (hashValue) {
    return this.findOne({ 'hash.value': hashValue });
};

// Pre-save: generate hash if not exists
CredentialSchema.pre('save', function (next) {
    if (!this.hash.value) {
        this.generateHash();
    }
    next();
});

module.exports = mongoose.model('Credential', CredentialSchema);
