/**
 * Verification Model
 * ==================
 * Tracks the complete verification process for a user.
 * Records all steps: document upload, face match, liveness, OCR.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const VerificationSchema = new mongoose.Schema({
    // Unique verification session ID
    verificationId: {
        type: String,
        required: true,
        unique: true,
        default: () => `ver_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    },

    // Reference to the user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    // Reference to the document being verified
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: [true, 'Document ID is required']
    },

    // Overall verification status
    status: {
        type: String,
        enum: ['initiated', 'in_progress', 'completed', 'failed', 'expired', 'cancelled'],
        default: 'initiated'
    },

    // Final result
    result: {
        type: String,
        enum: ['pending', 'passed', 'failed'],
        default: 'pending'
    },

    // Step-by-step progress
    steps: {
        documentUpload: {
            status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
            completedAt: { type: Date, default: null }
        },
        faceCapture: {
            status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
            completedAt: { type: Date, default: null },
            selfieIpfsHash: { type: String, default: null }
        },
        livenessCheck: {
            status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
            completedAt: { type: Date, default: null },
            challengeType: { type: String, default: null }
        },
        aiVerification: {
            status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
            completedAt: { type: Date, default: null }
        }
    },

    // AI Verification Results
    aiResults: {
        faceMatch: {
            passed: { type: Boolean, default: null },
            confidence: { type: Number, default: null, min: 0, max: 1 },
            threshold: { type: Number, default: 0.80 },
            model: { type: String, default: 'ArcFace' },
            processingTime: { type: Number, default: null } // in ms
        },
        liveness: {
            passed: { type: Boolean, default: null },
            confidence: { type: Number, default: null, min: 0, max: 1 },
            isRealFace: { type: Boolean, default: null },
            spoofType: { type: String, default: null },
            processingTime: { type: Number, default: null }
        },
        ocr: {
            passed: { type: Boolean, default: null },
            dataExtracted: { type: Boolean, default: false },
            documentValid: { type: Boolean, default: null },
            mrzValid: { type: Boolean, default: null },
            expiryValid: { type: Boolean, default: null },
            processingTime: { type: Number, default: null },
            confidenceScores: {
                fullName: { type: Number, default: null },
                dateOfBirth: { type: Number, default: null },
                documentNumber: { type: Number, default: null },
                nationality: { type: Number, default: null },
                expiryDate: { type: Number, default: null }
            }
        }
    },

    // Overall confidence score (weighted average)
    overallConfidence: {
        type: Number,
        default: null,
        min: 0,
        max: 1
    },

    // Credential issued after successful verification
    credential: {
        issued: { type: Boolean, default: false },
        credentialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Credential', default: null },
        issuedAt: { type: Date, default: null }
    },

    // Timing
    startedAt: {
        type: Date,
        default: Date.now
    },

    completedAt: {
        type: Date,
        default: null
    },

    // Session expiry (verification must complete within this time)
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    },

    // Error tracking
    errors: [{
        step: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Metadata
    metadata: {
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null },
        deviceInfo: { type: String, default: null }
    }
}, {
    timestamps: true
});

// Indexes
VerificationSchema.index({ verificationId: 1 });
VerificationSchema.index({ userId: 1, status: 1 });
VerificationSchema.index({ documentId: 1 });
VerificationSchema.index({ createdAt: -1 });
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Check if verification is expired
VerificationSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiresAt;
});

// Calculate overall confidence
VerificationSchema.methods.calculateOverallConfidence = function () {
    const weights = { faceMatch: 0.4, liveness: 0.35, ocr: 0.25 };
    let totalWeight = 0;
    let weightedSum = 0;

    if (this.aiResults.faceMatch.confidence !== null) {
        weightedSum += this.aiResults.faceMatch.confidence * weights.faceMatch;
        totalWeight += weights.faceMatch;
    }
    if (this.aiResults.liveness.confidence !== null) {
        weightedSum += this.aiResults.liveness.confidence * weights.liveness;
        totalWeight += weights.liveness;
    }
    if (this.aiResults.ocr.passed !== null) {
        // Use average of OCR confidence scores
        const ocrScores = Object.values(this.aiResults.ocr.confidenceScores).filter(s => s !== null);
        if (ocrScores.length > 0) {
            const avgOcr = ocrScores.reduce((a, b) => a + b, 0) / ocrScores.length;
            weightedSum += avgOcr * weights.ocr;
            totalWeight += weights.ocr;
        }
    }

    this.overallConfidence = totalWeight > 0 ? weightedSum / totalWeight : null;
    return this.overallConfidence;
};

// Complete verification
VerificationSchema.methods.complete = function (passed) {
    this.status = 'completed';
    this.result = passed ? 'passed' : 'failed';
    this.completedAt = new Date();
    this.calculateOverallConfidence();
    return this.save();
};

// Add error
VerificationSchema.methods.addError = function (step, message) {
    this.errors.push({ step, message, timestamp: new Date() });
    return this.save();
};

// Update step status
VerificationSchema.methods.updateStep = function (stepName, status) {
    if (this.steps[stepName]) {
        this.steps[stepName].status = status;
        if (status === 'completed') {
            this.steps[stepName].completedAt = new Date();
        }
    }
    return this.save();
};

// Find active verification for user
VerificationSchema.statics.findActiveByUser = function (userId) {
    return this.findOne({
        userId,
        status: { $in: ['initiated', 'in_progress'] },
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Verification', VerificationSchema);
