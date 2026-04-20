/**
 * Admin Routes
 * ============
 * Protected routes for admin panel:
 *   - Dashboard statistics
 *   - Verification review queue (approve / reject)
 *   - User management
 *   - Credential overview
 */

const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const Verification = require('../models/Verification');
const Document = require('../models/Document');
const Credential = require('../models/Credential');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

// ===========================================
// GET /api/v1/admin/stats
// Dashboard statistics
// ===========================================

router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const [
            totalVerifications,
            pendingReview,
            approvedThisMonth,
            rejectedThisMonth,
            totalUsers,
            verifiedUsers,
            totalCredentials,
            totalDocuments,
        ] = await Promise.all([
            Verification.countDocuments(),
            Verification.countDocuments({ status: 'pending_review' }),
            Verification.countDocuments({ result: 'passed', completedAt: { $gte: startOfMonth } }),
            Verification.countDocuments({ result: 'failed', completedAt: { $gte: startOfMonth } }),
            User.countDocuments(),
            User.countDocuments({ 'verification.isVerified': true }),
            Credential.countDocuments({ status: 'active' }),
            Document.countDocuments({ isDeleted: false }),
        ]);

        // Recent verifications for chart data (last 7 days)
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const recentVerifications = await Verification.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: 1 },
                    passed: { $sum: { $cond: [{ $eq: ['$result', 'passed'] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ['$result', 'failed'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                totalVerifications,
                pendingReview,
                approvedThisMonth,
                rejectedThisMonth,
                totalUsers,
                verifiedUsers,
                totalCredentials,
                totalDocuments,
            },
            chart: recentVerifications,
        });
    } catch (error) {
        console.error('[ADMIN] Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

// ===========================================
// GET /api/v1/admin/verifications
// List verifications with filters
// ===========================================

router.get('/verifications', async (req, res) => {
    try {
        const { status, result, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) query.status = status;
        if (result) query.result = result;

        const [verifications, total] = await Promise.all([
            Verification.find(query)
                .populate('userId', 'walletAddress did profile verification')
                .populate('documentId', 'documentType file verification')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Verification.countDocuments(query),
        ]);

        res.json({
            success: true,
            count: verifications.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            verifications: verifications.map(v => ({
                id: v._id,
                verificationId: v.verificationId,
                status: v.status,
                result: v.result,
                confidence: v.overallConfidence,
                user: v.userId ? {
                    id: v.userId._id,
                    walletAddress: v.userId.walletAddress,
                    displayName: v.userId.profile?.displayName,
                    isVerified: v.userId.verification?.isVerified,
                } : null,
                document: v.documentId ? {
                    id: v.documentId._id,
                    type: v.documentId.documentType,
                    fileName: v.documentId.file?.originalName,
                    status: v.documentId.verification?.status,
                } : null,
                aiResults: {
                    faceMatch: v.aiResults?.faceMatch?.confidence,
                    liveness: v.aiResults?.liveness?.confidence,
                    ocrPassed: v.aiResults?.ocr?.passed,
                },
                credential: v.credential,
                createdAt: v.createdAt,
                completedAt: v.completedAt,
            })),
        });
    } catch (error) {
        console.error('[ADMIN] List verifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to list verifications' });
    }
});

// ===========================================
// GET /api/v1/admin/verifications/:id
// Get full verification detail for review
// ===========================================

router.get('/verifications/:id', async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { verificationId: req.params.id };

        const verification = await Verification.findOne(query)
            .populate('userId', 'walletAddress did profile verification role status createdAt')
            .populate('documentId');

        if (!verification) {
            return res.status(404).json({ success: false, error: 'Verification not found' });
        }

        res.json({
            success: true,
            verification: {
                id: verification._id,
                verificationId: verification.verificationId,
                status: verification.status,
                result: verification.result,
                confidence: verification.overallConfidence,
                steps: verification.steps,
                aiResults: verification.aiResults,
                errors: verification.errors,
                user: verification.userId ? {
                    id: verification.userId._id,
                    walletAddress: verification.userId.walletAddress,
                    did: verification.userId.did,
                    displayName: verification.userId.profile?.displayName,
                    email: verification.userId.profile?.email,
                    isVerified: verification.userId.verification?.isVerified,
                    role: verification.userId.role,
                    createdAt: verification.userId.createdAt,
                } : null,
                document: verification.documentId ? {
                    id: verification.documentId._id,
                    documentType: verification.documentId.documentType,
                    issuingCountry: verification.documentId.issuingCountry,
                    ipfsHash: verification.documentId.ipfs?.hash,
                    ipfsUrl: `${verification.documentId.ipfs?.gateway}${verification.documentId.ipfs?.hash}`,
                    fileName: verification.documentId.file?.originalName,
                    fileSize: verification.documentId.file?.size,
                    mimeType: verification.documentId.file?.mimeType,
                    status: verification.documentId.verification?.status,
                    extractedData: verification.documentId.extractedData,
                    quality: verification.documentId.quality,
                } : null,
                credential: verification.credential,
                metadata: verification.metadata,
                createdAt: verification.createdAt,
                completedAt: verification.completedAt,
            },
        });
    } catch (error) {
        console.error('[ADMIN] Verification detail error:', error);
        res.status(500).json({ success: false, error: 'Failed to get verification detail' });
    }
});

// ===========================================
// POST /api/v1/admin/verifications/:id/approve
// Approve a verification and issue credential
// ===========================================

router.post('/verifications/:id/approve', async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { verificationId: req.params.id };

        const verification = await Verification.findOne(query);
        if (!verification) {
            return res.status(404).json({ success: false, error: 'Verification not found' });
        }

        if (verification.status !== 'pending_review') {
            return res.status(400).json({
                success: false,
                error: `Cannot approve verification with status: ${verification.status}`,
            });
        }

        const user = await User.findById(verification.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Mark as approved
        verification.status = 'completed';
        verification.result = 'passed';
        verification.completedAt = new Date();
        await verification.save();

        // Issue credential
        const credential = await issueCredentialForVerification(verification, user);

        console.log(`[ADMIN] Approved: ${verification.verificationId} by admin ${req.user.walletAddress}`);

        res.json({
            success: true,
            message: 'Verification approved and credential issued',
            credential: {
                id: credential._id,
                credentialId: credential.credentialId,
                hash: credential.hash.value,
            },
        });
    } catch (error) {
        console.error('[ADMIN] Approve error:', error);
        res.status(500).json({ success: false, error: 'Failed to approve verification' });
    }
});

// ===========================================
// POST /api/v1/admin/verifications/:id/reject
// Reject a verification
// ===========================================

router.post('/verifications/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ success: false, error: 'Rejection reason is required' });
        }

        const query = mongoose.Types.ObjectId.isValid(req.params.id)
            ? { _id: req.params.id }
            : { verificationId: req.params.id };

        const verification = await Verification.findOne(query);
        if (!verification) {
            return res.status(404).json({ success: false, error: 'Verification not found' });
        }

        if (verification.status !== 'pending_review') {
            return res.status(400).json({
                success: false,
                error: `Cannot reject verification with status: ${verification.status}`,
            });
        }

        // Mark as rejected
        verification.status = 'completed';
        verification.result = 'failed';
        verification.completedAt = new Date();
        verification.errors.push({ step: 'adminReview', message: reason, timestamp: new Date() });
        await verification.save();

        // Reject the document
        const document = await Document.findById(verification.documentId);
        if (document) {
            await document.markRejected(reason);
        }

        console.log(`[ADMIN] Rejected: ${verification.verificationId} by admin ${req.user.walletAddress} — ${reason}`);

        res.json({
            success: true,
            message: 'Verification rejected',
            reason,
        });
    } catch (error) {
        console.error('[ADMIN] Reject error:', error);
        res.status(500).json({ success: false, error: 'Failed to reject verification' });
    }
});

// ===========================================
// GET /api/v1/admin/users
// List all users
// ===========================================

router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('-nonce'),
            User.countDocuments(),
        ]);

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            users: users.map(u => ({
                id: u._id,
                walletAddress: u.walletAddress,
                did: u.did,
                role: u.role,
                displayName: u.profile?.displayName,
                email: u.profile?.email,
                isVerified: u.verification?.isVerified,
                verificationLevel: u.verification?.verificationLevel,
                status: u.status,
                lastLogin: u.lastLogin,
                loginCount: u.loginCount,
                createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        console.error('[ADMIN] List users error:', error);
        res.status(500).json({ success: false, error: 'Failed to list users' });
    }
});

// ===========================================
// GET /api/v1/admin/credentials
// List all credentials
// ===========================================

router.get('/credentials', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};
        if (status) query.status = status;

        const [credentials, total] = await Promise.all([
            Credential.find(query)
                .populate('subject.userId', 'walletAddress profile')
                .sort({ issuedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Credential.countDocuments(query),
        ]);

        res.json({
            success: true,
            count: credentials.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            credentials: credentials.map(c => ({
                id: c._id,
                credentialId: c.credentialId,
                type: c.type,
                status: c.status,
                hash: c.hash.value,
                blockchain: c.blockchain,
                claims: c.claims,
                issuedAt: c.issuedAt,
                expiresAt: c.expiresAt,
                user: c.subject?.userId ? {
                    walletAddress: c.subject.userId.walletAddress,
                    displayName: c.subject.userId.profile?.displayName,
                } : null,
            })),
        });
    } catch (error) {
        console.error('[ADMIN] List credentials error:', error);
        res.status(500).json({ success: false, error: 'Failed to list credentials' });
    }
});

// ─── Helper (duplicated from verifications.js to keep admin self-contained) ───

async function issueCredentialForVerification(verification, user) {
    const document = await Document.findById(verification.documentId);
    if (!document) throw new Error('Document not found');

    const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const issuerDid = 'did:ethr:verifyx';
    const subjectDid = user.did || `did:ethr:${user.walletAddress}`;

    const claims = {
        fullName: document.extractedData?.fullName || null,
        dateOfBirth: document.extractedData?.dateOfBirth || null,
        nationality: document.extractedData?.nationality || null,
        documentType: document.documentType,
        documentNumber: null,
        isOver18: true,
    };
    const includedClaims = Object.keys(claims).filter(k => claims[k] != null);

    const issuedAt = new Date();
    const hashValue = crypto
        .createHash('sha256')
        .update(JSON.stringify({
            issuer: issuerDid,
            subject: subjectDid,
            claims,
            issuedAt: issuedAt.toISOString(),
            expiresAt: oneYear.toISOString(),
        }))
        .digest('hex');

    const credential = await Credential.create({
        issuer: { did: issuerDid, name: 'VerifyX' },
        subject: { userId: user._id, did: subjectDid },
        verificationId: verification._id,
        claims,
        includedClaims,
        issuedAt,
        expiresAt: oneYear,
        hash: { algorithm: 'sha256', value: hashValue },
    });

    verification.credential.issued = true;
    verification.credential.credentialId = credential._id;
    verification.credential.issuedAt = new Date();
    await verification.save();

    if (!user.verification.isVerified) {
        user.verification.isVerified = true;
        user.verification.verifiedAt = new Date();
        user.verification.verificationLevel = 'basic';
        await user.save();
    }

    await document.markVerified(verification.overallConfidence);

    return credential;
}

module.exports = router;
