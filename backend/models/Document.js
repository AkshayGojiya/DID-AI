/**
 * Document Model
 * ==============
 * Represents identity documents uploaded by users.
 * Documents are encrypted and stored on IPFS.
 */

const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    // Reference to the user who owns this document
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    // Type of identity document
    documentType: {
        type: String,
        enum: ['passport', 'driving_license', 'national_id', 'residence_permit', 'other'],
        required: [true, 'Document type is required']
    },

    // Country that issued the document
    issuingCountry: {
        type: String,
        default: null
    },

    // Document number (encrypted in database)
    documentNumber: {
        type: String,
        default: null
    },

    // IPFS storage details
    ipfs: {
        hash: {
            type: String,
            required: [true, 'IPFS hash is required']
        },
        gateway: {
            type: String,
            default: 'https://gateway.pinata.cloud/ipfs/'
        },
        size: {
            type: Number,
            default: 0
        }
    },

    // Encryption details (key stored securely, NOT the actual key)
    encryption: {
        algorithm: {
            type: String,
            default: 'aes-256-cbc'
        },
        keyId: {
            type: String,
            required: true
        },
        iv: {
            type: String,
            required: true
        }
    },

    // Original file metadata
    file: {
        originalName: { type: String, default: null },
        mimeType: { type: String, default: null },
        size: { type: Number, default: 0 }
    },

    // Document verification status
    verification: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'verified', 'rejected', 'expired'],
            default: 'pending'
        },
        verifiedAt: { type: Date, default: null },
        rejectionReason: { type: String, default: null },
        aiConfidence: { type: Number, default: null, min: 0, max: 1 }
    },

    // OCR extracted data (encrypted)
    extractedData: {
        fullName: { type: String, default: null },
        dateOfBirth: { type: Date, default: null },
        expiryDate: { type: Date, default: null },
        nationality: { type: String, default: null },
        gender: { type: String, enum: ['M', 'F', 'X', null], default: null },
        mrzLine1: { type: String, default: null },
        mrzLine2: { type: String, default: null }
    },

    // Quality assessment
    quality: {
        score: { type: Number, default: null, min: 0, max: 1 },
        issues: [{ type: String }]
    },

    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
DocumentSchema.index({ userId: 1, documentType: 1 });
DocumentSchema.index({ 'verification.status': 1 });
DocumentSchema.index({ 'ipfs.hash': 1 });
DocumentSchema.index({ createdAt: -1 });

// Virtual for full IPFS URL
DocumentSchema.virtual('ipfsUrl').get(function () {
    return `${this.ipfs.gateway}${this.ipfs.hash}`;
});

// Check if document is expired
DocumentSchema.virtual('isExpired').get(function () {
    if (!this.extractedData.expiryDate) return false;
    return new Date() > this.extractedData.expiryDate;
});

// Find documents by user
DocumentSchema.statics.findByUser = function (userId) {
    return this.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
};

// Soft delete document
DocumentSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Mark as verified
DocumentSchema.methods.markVerified = function (confidence) {
    this.verification.status = 'verified';
    this.verification.verifiedAt = new Date();
    this.verification.aiConfidence = confidence;
    return this.save();
};

// Mark as rejected
DocumentSchema.methods.markRejected = function (reason) {
    this.verification.status = 'rejected';
    this.verification.rejectionReason = reason;
    return this.save();
};

// Don't include deleted documents by default
DocumentSchema.pre(/^find/, function (next) {
    if (!this.getOptions().includeDeleted) {
        this.where({ isDeleted: false });
    }
    next();
});

module.exports = mongoose.model('Document', DocumentSchema);
