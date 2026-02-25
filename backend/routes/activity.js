/**
 * Activity Routes
 * ===============
 * Returns a time-sorted activity log aggregated from the user's
 * documents, credentials, and account history stored in MongoDB.
 */

const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Credential = require('../models/Credential');
const { authenticate } = require('../middleware/authMiddleware');

// Human-readable document type labels
function formatDocType(type) {
    const map = {
        passport:         'Passport',
        driving_license:  'Driving License',
        national_id:      'National ID',
        residence_permit: 'Residence Permit',
        other:            'Document',
    };
    return map[type] || 'Document';
}

/**
 * @route   GET /api/v1/activity
 * @desc    Aggregated activity log for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const user = req.user;

        // Explicitly filter isDeleted to avoid relying on the pre-hook
        const [documents, credentials] = await Promise.all([
            Document.find({ userId: user._id, isDeleted: false }).sort({ createdAt: 1 }).lean(),
            Credential.find({ 'subject.userId': user._id }).sort({ issuedAt: 1 }).lean(),
        ]);

        const events = [];

        // ── Account creation ──────────────────────────────────────────
        const addr = user.walletAddress || '';
        events.push({
            id:          `account_${user._id}`,
            type:        'account_created',
            title:       'Account Created',
            description: `Wallet ${addr.slice(0, 6)}...${addr.slice(-4)} registered on VerifyX`,
            date:        user.createdAt,
            meta:        { walletAddress: addr },
        });

        // ── DID blockchain registration ───────────────────────────────
        if (user.blockchain?.didRegistered && user.blockchain?.registeredAt) {
            events.push({
                id:          `did_${user._id}`,
                type:        'did_registered',
                title:       'DID Registered on Blockchain',
                description: 'Your decentralized identity was anchored on the blockchain',
                date:        user.blockchain.registeredAt,
                meta:        { did: user.did || null, txHash: user.blockchain.didTxHash || null },
            });
        }

        // ── Most-recent login (skip first to avoid duplicate with account creation) ──
        if (user.lastLogin && user.loginCount > 1) {
            events.push({
                id:          `login_${new Date(user.lastLogin).getTime()}`,
                type:        'wallet_connected',
                title:       'Wallet Signed In',
                description: `MetaMask authentication — login #${user.loginCount}`,
                date:        user.lastLogin,
                meta:        { loginCount: user.loginCount },
            });
        }

        // ── Document events ───────────────────────────────────────────
        for (const doc of documents) {
            const docType = formatDocType(doc.documentType);

            // Upload
            events.push({
                id:          `doc_upload_${doc._id}`,
                type:        'document_upload',
                title:       'Document Uploaded',
                description: `${docType} uploaded and encrypted`,
                date:        doc.createdAt,
                meta: {
                    documentId:   doc._id,
                    documentType: doc.documentType || null,
                    ipfsHash:     doc.ipfs?.hash || null,
                    fileName:     doc.file?.originalName || null,
                },
            });

            const vStatus = doc.verification?.status;

            // Verified
            if (vStatus === 'verified' && doc.verification?.verifiedAt) {
                events.push({
                    id:          `doc_verified_${doc._id}`,
                    type:        'document_verified',
                    title:       'Document Verified',
                    description: `${docType} passed AI verification`,
                    date:        doc.verification.verifiedAt,
                    meta: {
                        documentId:   doc._id,
                        documentType: doc.documentType || null,
                        aiConfidence: doc.verification?.aiConfidence ?? null,
                    },
                });
            }

            // Rejected
            if (vStatus === 'rejected') {
                const reason = doc.verification?.rejectionReason;
                events.push({
                    id:          `doc_rejected_${doc._id}`,
                    type:        'document_rejected',
                    title:       'Document Rejected',
                    description: `${docType} failed verification${reason ? ': ' + reason : ''}`,
                    date:        doc.updatedAt || doc.createdAt,
                    meta: {
                        documentId: doc._id,
                        reason:     reason || null,
                    },
                });
            }
        }

        // ── Credential events ─────────────────────────────────────────
        for (const cred of credentials) {
            const credType = cred.type || 'Credential';
            const issuerName = cred.issuer?.name || 'VerifyX';

            // Issued
            events.push({
                id:          `cred_issued_${cred._id}`,
                type:        'credential_issued',
                title:       'Credential Issued',
                description: `${credType} credential issued by ${issuerName}`,
                date:        cred.issuedAt || cred.createdAt,
                meta: {
                    credentialId: cred.credentialId || null,
                    type:         credType,
                    hash:         cred.hash?.value || null,
                    expiresAt:    cred.expiresAt || null,
                },
            });

            // Revoked
            if (cred.status === 'revoked' && cred.revocation?.revokedAt) {
                const reason = cred.revocation?.reason;
                events.push({
                    id:          `cred_revoked_${cred._id}`,
                    type:        'credential_revoked',
                    title:       'Credential Revoked',
                    description: `${credType} was revoked${reason ? ': ' + reason : ''}`,
                    date:        cred.revocation.revokedAt,
                    meta: {
                        credentialId: cred.credentialId || null,
                        reason:       reason || null,
                    },
                });
            }
        }

        // Sort newest first
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Stats
        const scanCount = credentials.reduce((sum, c) => sum + (c.usage?.verifyCount || 0), 0);

        res.json({
            success: true,
            events,
            stats: {
                total:       events.length,
                documents:   documents.length,
                credentials: credentials.length,
                scans:       scanCount,
            },
        });
    } catch (error) {
        console.error('[ACTIVITY] Error:', error);
        res.status(500).json({
            success:  false,
            error:    'Failed to retrieve activity',
            detail:   process.env.NODE_ENV !== 'production' ? error.message : undefined,
            code:     'ACTIVITY_ERROR',
        });
    }
});

module.exports = router;
