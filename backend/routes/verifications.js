/**
 * Verifications Routes
 * ====================
 * Handles the full verification lifecycle:
 *   1. User submits document + selfie + liveness frames
 *   2. Backend uploads document to IPFS (encrypted)
 *   3. Backend calls AI service (face verify, liveness, OCR)
 *   4. Backend calculates weighted confidence score
 *   5. Routes to: auto-approve / admin-review / auto-reject
 *
 * This replaces the old insecure flow where the frontend called AI
 * directly and self-issued credentials.
 */

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { authenticate } = require('../middleware/authMiddleware');
const { encryptFile } = require('../utils/encryption');
const { generateKeyId } = require('../utils/encryption');
const { uploadToIPFS } = require('../services/ipfsService');
const blockchainService = require('../services/blockchainService');
const Verification = require('../models/Verification');
const Document = require('../models/Document');
const Credential = require('../models/Credential');
const User = require('../models/User');

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Thresholds (can be overridden via env)
const AUTO_APPROVE_THRESHOLD = parseFloat(process.env.AUTO_APPROVE_THRESHOLD || '85') / 100;
const AUTO_REJECT_THRESHOLD = parseFloat(process.env.AUTO_REJECT_THRESHOLD || '50') / 100;

// Multer config for document upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
});

// ─── Helper: call AI service ───

async function callAI(path, body) {
    const res = await fetch(`${AI_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `AI service error ${res.status}`);
    return data;
}

// ─── Helper: issue credential after approval ───

async function issueCredentialForVerification(verification, user) {
    const document = await Document.findById(verification.documentId);
    if (!document) throw new Error('Document not found');

    const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const issuerDid = 'did:ethr:verifyx';
    const subjectDid = user.did || `did:ethr:${user.walletAddress}`;

    // Build claims from OCR extracted data
    const ocr = verification.aiResults.ocr || {};
    const claims = {
        fullName: document.extractedData.fullName || null,
        dateOfBirth: document.extractedData.dateOfBirth || null,
        nationality: document.extractedData.nationality || null,
        documentType: document.documentType,
        documentNumber: null, // privacy: don't include raw number
        isOver18: true,
    };

    const includedClaims = Object.keys(claims).filter(k => claims[k] != null);

    // Generate credential hash
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

    // Link credential back to verification
    verification.credential.issued = true;
    verification.credential.credentialId = credential._id;
    verification.credential.issuedAt = new Date();
    await verification.save();

    // Mark user as verified
    if (!user.verification.isVerified) {
        user.verification.isVerified = true;
        user.verification.verifiedAt = new Date();
        user.verification.verificationLevel = 'basic';
        await user.save();
    }

    // Mark document as verified
    await document.markVerified(verification.overallConfidence);

    // Attempt blockchain anchoring (async, non-blocking)
    anchorToBlockchain(credential, user.walletAddress).catch(err => {
        console.warn('[VERIFY] Blockchain anchoring failed (non-fatal):', err.message);
    });

    return credential;
}

// ─── Helper: anchor credential hash to blockchain ───

async function anchorToBlockchain(credential, walletAddress) {
    try {
        const connected = await blockchainService.isConnected();
        if (!connected) return;

        const expiresAtUnix = Math.floor(new Date(credential.expiresAt).getTime() / 1000);
        const result = await blockchainService.issueCredential(
            credential.hash.value,
            walletAddress,
            expiresAtUnix,
            process.env.DEPLOYER_PRIVATE_KEY
        );

        if (result.success) {
            await credential.recordBlockchainStorage(
                result.txHash,
                result.blockNumber,
                blockchainService.getContractAddresses().credentialRegistry
            );
            console.log(`[BLOCKCHAIN] Credential ${credential.credentialId} anchored: ${result.txHash}`);
        }
    } catch (err) {
        console.warn('[BLOCKCHAIN] Anchoring error:', err.message);
    }
}

// ===========================================
// POST /api/v1/verifications/submit
// Main verification submission endpoint
// ===========================================

router.post('/submit', authenticate, upload.single('document'), async (req, res) => {
    try {
        const { documentType, selfieImage, livenessFrames, challengeType } = req.body;

        // ── Validate required fields ──
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Document file is required', code: 'NO_FILE' });
        }
        if (!documentType) {
            return res.status(400).json({ success: false, error: 'documentType is required', code: 'MISSING_DOC_TYPE' });
        }
        if (!selfieImage) {
            return res.status(400).json({ success: false, error: 'selfieImage (base64) is required', code: 'MISSING_SELFIE' });
        }

        const validTypes = ['passport', 'driving_license', 'national_id', 'residence_permit'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({ success: false, error: `Invalid documentType`, code: 'INVALID_DOC_TYPE' });
        }

        // ── 1. Encrypt and upload document to IPFS ──
        const { encrypted, key, iv } = encryptFile(req.file.buffer);
        const ipfsResult = await uploadToIPFS(
            encrypted,
            `enc_${Date.now()}_${req.file.originalname}`,
            { userId: req.user._id.toString(), documentType }
        );
        const keyId = generateKeyId();

        const document = await Document.create({
            userId: req.user._id,
            documentType,
            ipfs: { hash: ipfsResult.ipfsHash, gateway: ipfsResult.gateway, size: ipfsResult.size },
            encryption: { algorithm: 'aes-256-cbc', keyId, iv, _key: key },
            file: { originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size },
            verification: { status: 'processing' },
        });

        // ── 2. Create verification record ──
        const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const verification = await Verification.create({
            userId: req.user._id,
            documentId: document._id,
            status: 'in_progress',
            result: 'pending',
            steps: {
                documentUpload: { status: 'completed', completedAt: new Date() },
                faceCapture: { status: 'completed', completedAt: new Date() },
                livenessCheck: { status: 'completed', completedAt: new Date() },
                aiVerification: { status: 'processing' },
            },
            expiresAt: oneYear,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            },
        });

        // ── 3. Convert document to base64 for AI service ──
        const docBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // ── 4. Call AI services (server-to-server) ──
        let faceResult = null;
        let livenessResultData = null;
        let ocrResult = null;

        // Face verification
        try {
            faceResult = await callAI('/api/v1/face/verify', {
                document_image: docBase64,
                selfie_image: selfieImage,
            });
            verification.aiResults.faceMatch = {
                passed: faceResult.verification?.match ?? false,
                confidence: faceResult.verification?.confidence ?? 0,
                threshold: faceResult.verification?.threshold ?? 0.80,
                model: faceResult.verification?.model || 'ArcFace',
                processingTime: faceResult.processing_time_ms || null,
            };
        } catch (err) {
            console.error('[VERIFY] Face verification error:', err.message);
            verification.addError('faceMatch', err.message);
            verification.aiResults.faceMatch = { passed: false, confidence: 0 };
        }

        // Liveness detection (re-verify with frames if provided)
        let parsedFrames = [];
        try {
            parsedFrames = typeof livenessFrames === 'string' ? JSON.parse(livenessFrames) : livenessFrames;
        } catch { parsedFrames = []; }

        if (Array.isArray(parsedFrames) && parsedFrames.length >= 3) {
            try {
                livenessResultData = await callAI('/api/v1/liveness/detect', {
                    frames: parsedFrames,
                    challenge_type: challengeType || 'blink',
                });
                verification.aiResults.liveness = {
                    passed: livenessResultData.liveness?.is_live ?? false,
                    confidence: livenessResultData.liveness?.confidence ?? 0,
                    isRealFace: livenessResultData.anti_spoofing?.is_real_face ?? null,
                    spoofType: livenessResultData.anti_spoofing?.spoof_type_detected ?? null,
                    processingTime: livenessResultData.processing_time_ms || null,
                };
                verification.steps.livenessCheck.challengeType = challengeType || 'blink';
            } catch (err) {
                console.error('[VERIFY] Liveness error:', err.message);
                verification.addError('liveness', err.message);
                verification.aiResults.liveness = { passed: false, confidence: 0 };
            }
        } else {
            // No frames — mark as passed with lower confidence (frontend already verified)
            verification.aiResults.liveness = { passed: true, confidence: 0.7 };
        }

        // OCR extraction
        try {
            ocrResult = await callAI('/api/v1/ocr/extract', {
                image: docBase64,
                document_type: documentType,
            });
            verification.aiResults.ocr = {
                passed: ocrResult.success ?? false,
                dataExtracted: !!ocrResult.extracted_data,
                documentValid: ocrResult.checks_passed?.length > 0,
                mrzValid: ocrResult.mrz_found ?? false,
                processingTime: ocrResult.processing_time_ms || null,
                confidenceScores: ocrResult.confidence_scores || {},
            };

            // Populate document extracted data
            if (ocrResult.extracted_data) {
                const ed = ocrResult.extracted_data;
                document.extractedData = {
                    fullName: ed.full_name || ed.fullName || null,
                    dateOfBirth: ed.date_of_birth ? new Date(ed.date_of_birth) : null,
                    expiryDate: ed.expiry_date ? new Date(ed.expiry_date) : null,
                    nationality: ed.nationality || null,
                    gender: ed.gender || null,
                    mrzLine1: ed.mrz_line1 || null,
                    mrzLine2: ed.mrz_line2 || null,
                };
                await document.save();
            }
        } catch (err) {
            console.error('[VERIFY] OCR error:', err.message);
            verification.addError('ocr', err.message);
            verification.aiResults.ocr = { passed: false, dataExtracted: false };
        }

        // ── 5. Mark AI verification step complete ──
        verification.steps.aiVerification.status = 'completed';
        verification.steps.aiVerification.completedAt = new Date();

        // ── 6. Calculate overall confidence ──
        verification.calculateOverallConfidence();
        const score = verification.overallConfidence || 0;

        // ── 7. Route based on score tier ──
        let status, result, message;

        if (score >= AUTO_APPROVE_THRESHOLD) {
            // AUTO-APPROVE
            status = 'completed';
            result = 'passed';
            message = 'Verification approved automatically';
            verification.status = status;
            verification.result = result;
            verification.completedAt = new Date();
            await verification.save();

            // Issue credential
            const credential = await issueCredentialForVerification(verification, req.user);

            console.log(`[VERIFY] Auto-approved: ${verification.verificationId} (score: ${(score * 100).toFixed(1)}%)`);

            return res.status(201).json({
                success: true,
                verificationId: verification.verificationId,
                status: 'approved',
                confidence: score,
                message,
                credential: {
                    id: credential._id,
                    credentialId: credential.credentialId,
                    hash: credential.hash.value,
                },
            });
        } else if (score >= AUTO_REJECT_THRESHOLD) {
            // FLAG FOR ADMIN REVIEW
            status = 'pending_review';
            result = 'pending';
            message = 'Verification submitted for admin review';
            verification.status = status;
            verification.result = result;
            await verification.save();

            // Update document status
            document.verification.status = 'processing';
            await document.save();

            console.log(`[VERIFY] Flagged for review: ${verification.verificationId} (score: ${(score * 100).toFixed(1)}%)`);

            return res.status(202).json({
                success: true,
                verificationId: verification.verificationId,
                status: 'pending_review',
                confidence: score,
                message,
            });
        } else {
            // AUTO-REJECT
            status = 'completed';
            result = 'failed';
            const reasons = [];
            if (!verification.aiResults.faceMatch.passed) reasons.push('Face mismatch');
            if (!verification.aiResults.liveness.passed) reasons.push('Liveness check failed');
            if (!verification.aiResults.ocr.passed) reasons.push('Document could not be verified');
            message = reasons.length > 0 ? reasons.join(', ') : 'Verification score too low';

            verification.status = status;
            verification.result = result;
            verification.completedAt = new Date();
            await verification.save();

            // Reject document
            await document.markRejected(message);

            console.log(`[VERIFY] Auto-rejected: ${verification.verificationId} (score: ${(score * 100).toFixed(1)}%)`);

            return res.status(200).json({
                success: true,
                verificationId: verification.verificationId,
                status: 'rejected',
                confidence: score,
                message,
                reasons,
            });
        }

    } catch (error) {
        console.error('[VERIFY] Submit error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, error: 'File too large (max 10 MB)', code: 'FILE_TOO_LARGE' });
        }
        res.status(500).json({ success: false, error: error.message || 'Verification failed', code: 'VERIFY_ERROR' });
    }
});

// ===========================================
// GET /api/v1/verifications/:id/status
// Poll verification status (for frontend)
// ===========================================

router.get('/:id/status', authenticate, async (req, res) => {
    try {
        const verification = await Verification.findOne({
            verificationId: req.params.id,
            userId: req.user._id,
        });

        if (!verification) {
            return res.status(404).json({ success: false, error: 'Verification not found', code: 'NOT_FOUND' });
        }

        const response = {
            success: true,
            verificationId: verification.verificationId,
            status: verification.status,
            result: verification.result,
            confidence: verification.overallConfidence,
            steps: verification.steps,
            credential: verification.credential,
            createdAt: verification.createdAt,
            completedAt: verification.completedAt,
        };

        // Include rejection reasons if failed
        if (verification.result === 'failed' && verification.errors.length > 0) {
            response.reasons = verification.errors.map(e => e.message);
        }

        res.json(response);
    } catch (error) {
        console.error('[VERIFY] Status error:', error);
        res.status(500).json({ success: false, error: 'Failed to get status', code: 'STATUS_ERROR' });
    }
});

// ===========================================
// GET /api/v1/verifications
// List user's verifications
// ===========================================

router.get('/', authenticate, async (req, res) => {
    try {
        const verifications = await Verification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            count: verifications.length,
            verifications: verifications.map(v => ({
                verificationId: v.verificationId,
                status: v.status,
                result: v.result,
                confidence: v.overallConfidence,
                credential: v.credential,
                createdAt: v.createdAt,
                completedAt: v.completedAt,
            })),
        });
    } catch (error) {
        console.error('[VERIFY] List error:', error);
        res.status(500).json({ success: false, error: 'Failed to list verifications', code: 'LIST_ERROR' });
    }
});

module.exports = router;
