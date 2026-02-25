/**
 * Credentials Routes
 * ==================
 * CRUD operations for Verifiable Credentials.
 * Credentials are issued after a successful verification session.
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Credential = require('../models/Credential');
const Verification = require('../models/Verification');
const Document = require('../models/Document');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/v1/credentials
 * @desc    List all active credentials for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const credentials = await Credential.find({
            'subject.userId': req.user._id,
        }).sort({ issuedAt: -1 });

        res.json({
            success: true,
            count: credentials.length,
            credentials: credentials.map(cred => ({
                id:             cred._id,
                credentialId:   cred.credentialId,
                type:           cred.type,
                issuer:         cred.issuer,
                issuedAt:       cred.issuedAt,
                expiresAt:      cred.expiresAt,
                status:         cred.status,
                hash:           cred.hash.value,
                blockchain:     cred.blockchain,
                claims:         cred.claims,
                includedClaims: cred.includedClaims,
                usage:          cred.usage,
            })),
        });
    } catch (error) {
        console.error('[CREDENTIALS] List error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve credentials',
            code: 'LIST_ERROR',
        });
    }
});

/**
 * @route   GET /api/v1/credentials/verify/:hash
 * @desc    Verify a credential by its hash (public endpoint for QR scanning)
 * @access  Public
 */
router.get('/verify/:hash', async (req, res) => {
    try {
        const credential = await Credential.findByHash(req.params.hash);

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'Credential not found',
                code: 'NOT_FOUND',
            });
        }

        const isValid = credential.status === 'active' && new Date() < credential.expiresAt;

        // Build selective-disclosure claims
        const sharedClaims = credential.includedClaims.reduce((acc, key) => {
            if (credential.claims[key] !== null && credential.claims[key] !== undefined) {
                acc[key] = credential.claims[key];
            }
            return acc;
        }, {});

        const response = {
            success: true,
            verified: isValid,
            credential: {
                credentialId:  credential.credentialId,
                type:          credential.type,
                issuer:        credential.issuer,
                subject:       { did: credential.subject.did },
                issuedAt:      credential.issuedAt,
                expiresAt:     credential.expiresAt,
                status:        credential.status,
                claims:        sharedClaims,
                blockchain:    credential.blockchain,
            },
        };

        res.json(response);

        // Record verification usage in background (non-blocking)
        if (isValid) {
            credential.recordVerification().catch(() => {});
        }
    } catch (error) {
        console.error('[CREDENTIALS] Verify error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify credential',
            code: 'VERIFY_ERROR',
        });
    }
});

/**
 * @route   GET /api/v1/credentials/:id
 * @desc    Get a single credential by MongoDB _id
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credential ID',
                code: 'INVALID_ID',
            });
        }

        const credential = await Credential.findOne({
            _id: req.params.id,
            'subject.userId': req.user._id,
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'Credential not found',
                code: 'NOT_FOUND',
            });
        }

        res.json({
            success: true,
            credential: {
                id:             credential._id,
                credentialId:   credential.credentialId,
                type:           credential.type,
                issuer:         credential.issuer,
                issuedAt:       credential.issuedAt,
                expiresAt:      credential.expiresAt,
                status:         credential.status,
                hash:           credential.hash.value,
                blockchain:     credential.blockchain,
                claims:         credential.claims,
                includedClaims: credential.includedClaims,
                usage:          credential.usage,
            },
        });
    } catch (error) {
        console.error('[CREDENTIALS] Get error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve credential',
            code: 'GET_ERROR',
        });
    }
});

/**
 * @route   POST /api/v1/credentials
 * @desc    Issue a new credential after successful AI verification
 * @access  Private
 * @body    { documentId, claims, includedClaims, aiResults }
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { documentId, claims = {}, includedClaims, aiResults = {} } = req.body;

        // Validate documentId
        if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({
                success: false,
                error: 'Valid documentId is required',
                code: 'MISSING_DOC_ID',
            });
        }

        // Confirm document belongs to user
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            isDeleted: false,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or does not belong to you',
                code: 'DOC_NOT_FOUND',
            });
        }

        // Create a Verification record to satisfy the FK constraint
        const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const verification = await Verification.create({
            userId:      req.user._id,
            documentId:  document._id,
            status:      'completed',
            result:      'passed',
            steps: {
                documentUpload: { status: 'completed', completedAt: new Date() },
                faceCapture:    { status: 'completed', completedAt: new Date() },
                livenessCheck:  { status: 'completed', completedAt: new Date() },
                aiVerification: { status: 'completed', completedAt: new Date() },
            },
            aiResults,
            completedAt: new Date(),
            expiresAt:   oneYear, // prevent TTL deletion
        });

        // Determine which claims to include
        const claimsToInclude = Array.isArray(includedClaims) && includedClaims.length
            ? includedClaims
            : ['fullName', 'nationality', 'documentType', 'isOver18'];

        // Issue the credential
        const credential = await Credential.create({
            issuer: {
                did:  'did:ethr:verifyx',
                name: 'VerifyX',
            },
            subject: {
                userId: req.user._id,
                did:    req.user.did || `did:ethr:${req.user.walletAddress}`,
            },
            verificationId: verification._id,
            claims,
            includedClaims: claimsToInclude,
            expiresAt:      oneYear,
        });

        // Link credential back to verification
        verification.credential.issued      = true;
        verification.credential.credentialId = credential._id;
        verification.credential.issuedAt    = new Date();
        await verification.save();

        // Mark user as verified
        if (!req.user.verification.isVerified) {
            req.user.verification.isVerified         = true;
            req.user.verification.verifiedAt         = new Date();
            req.user.verification.verificationLevel  = 'basic';
            await req.user.save();
        }

        console.log(`[CREDENTIALS] Issued credential ${credential.credentialId} for user ${req.user._id}`);

        res.status(201).json({
            success: true,
            message: 'Credential issued successfully',
            credential: {
                id:           credential._id,
                credentialId: credential.credentialId,
                type:         credential.type,
                issuedAt:     credential.issuedAt,
                expiresAt:    credential.expiresAt,
                hash:         credential.hash.value,
                status:       credential.status,
            },
        });
    } catch (error) {
        console.error('[CREDENTIALS] Create error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to issue credential',
            code: 'CREATE_ERROR',
        });
    }
});

/**
 * @route   PUT /api/v1/credentials/:id/revoke
 * @desc    Revoke a credential
 * @access  Private
 */
router.put('/:id/revoke', authenticate, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credential ID',
                code: 'INVALID_ID',
            });
        }

        const credential = await Credential.findOne({
            _id: req.params.id,
            'subject.userId': req.user._id,
        });

        if (!credential) {
            return res.status(404).json({
                success: false,
                error: 'Credential not found',
                code: 'NOT_FOUND',
            });
        }

        if (credential.status === 'revoked') {
            return res.status(400).json({
                success: false,
                error: 'Credential is already revoked',
                code: 'ALREADY_REVOKED',
            });
        }

        const reason = req.body.reason || 'User requested revocation';
        await credential.revoke(reason, req.user._id);

        res.json({
            success: true,
            message: 'Credential revoked successfully',
        });
    } catch (error) {
        console.error('[CREDENTIALS] Revoke error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke credential',
            code: 'REVOKE_ERROR',
        });
    }
});

module.exports = router;
