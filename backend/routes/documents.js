/**
 * Document Routes
 * ===============
 * Handles document upload, retrieval, download, and deletion.
 * Files are encrypted client-side before being stored on IPFS.
 */

const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const { encryptFile, decryptFile, generateKeyId } = require('../utils/encryption');
const { uploadToIPFS, fetchFromIPFS, unpinFromIPFS } = require('../services/ipfsService');
const Document = require('../models/Document');

const router = express.Router();

// Multer config: store in memory (we encrypt then upload to IPFS, no local storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}. Accepted: JPEG, PNG, WebP, PDF`));
        }
    }
});

// ===========================================
// POST /api/v1/documents/upload
// Upload and encrypt a document to IPFS
// ===========================================
router.post('/upload', authenticate, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided. Send a file with field name "document"',
                code: 'NO_FILE'
            });
        }

        const { documentType, issuingCountry } = req.body;

        if (!documentType) {
            return res.status(400).json({
                success: false,
                error: 'documentType is required (passport, driving_license, national_id, residence_permit)',
                code: 'MISSING_DOC_TYPE'
            });
        }

        const validTypes = ['passport', 'driving_license', 'national_id', 'residence_permit', 'other'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid documentType. Must be one of: ${validTypes.join(', ')}`,
                code: 'INVALID_DOC_TYPE'
            });
        }

        // 1. Encrypt the file
        const { encrypted, key, iv } = encryptFile(req.file.buffer);

        // 2. Upload encrypted file to IPFS
        const ipfsResult = await uploadToIPFS(
            encrypted,
            `enc_${Date.now()}_${req.file.originalname}`,
            { userId: req.user._id.toString(), documentType }
        );

        // 3. Generate a key ID and store the encryption key
        //    In production, use a proper key management service (AWS KMS, HashiCorp Vault).
        //    For now, the key is stored alongside the keyId in the DB — acceptable for dev.
        const keyId = generateKeyId();

        // 4. Save document record in MongoDB
        const document = await Document.create({
            userId: req.user._id,
            documentType,
            issuingCountry: issuingCountry || null,
            ipfs: {
                hash: ipfsResult.ipfsHash,
                gateway: ipfsResult.gateway,
                size: ipfsResult.size
            },
            encryption: {
                algorithm: 'aes-256-cbc',
                keyId,
                iv,
                // Store key for dev — in production, store in KMS and only keep keyId
                _key: key
            },
            file: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size
            }
        });

        console.log(`[UPLOAD] Document ${document._id} uploaded by user ${req.user._id} → IPFS: ${ipfsResult.ipfsHash}`);

        res.status(201).json({
            success: true,
            message: 'Document uploaded and encrypted successfully',
            document: {
                id: document._id,
                documentType: document.documentType,
                ipfsHash: document.ipfs.hash,
                ipfsUrl: `${document.ipfs.gateway}${document.ipfs.hash}`,
                fileSize: document.file.size,
                status: document.verification.status,
                uploadedAt: document.createdAt
            }
        });
    } catch (error) {
        console.error('[UPLOAD ERROR]', error);

        // Handle multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'File too large. Maximum size is 10 MB',
                code: 'FILE_TOO_LARGE'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload document',
            code: 'UPLOAD_FAILED'
        });
    }
});

// ===========================================
// GET /api/v1/documents
// List all documents for the authenticated user
// ===========================================
router.get('/', authenticate, async (req, res) => {
    try {
        const { status, documentType } = req.query;

        const query = { userId: req.user._id, isDeleted: false };
        if (status) query['verification.status'] = status;
        if (documentType) query.documentType = documentType;

        const documents = await Document.find(query)
            .sort({ createdAt: -1 })
            .select('-encryption._key -encryption.iv');

        res.json({
            success: true,
            count: documents.length,
            documents: documents.map(doc => ({
                id: doc._id,
                documentType: doc.documentType,
                issuingCountry: doc.issuingCountry,
                ipfsHash: doc.ipfs.hash,
                ipfsUrl: `${doc.ipfs.gateway}${doc.ipfs.hash}`,
                fileName: doc.file.originalName,
                fileSize: doc.file.size,
                mimeType: doc.file.mimeType,
                status: doc.verification.status,
                aiConfidence: doc.verification.aiConfidence,
                uploadedAt: doc.createdAt,
                verifiedAt: doc.verification.verifiedAt
            }))
        });
    } catch (error) {
        console.error('[DOCUMENTS LIST ERROR]', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve documents',
            code: 'LIST_FAILED'
        });
    }
});

// ===========================================
// GET /api/v1/documents/:documentId
// Get a single document's details
// ===========================================
router.get('/:documentId', authenticate, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.documentId,
            userId: req.user._id,
            isDeleted: false
        }).select('-encryption._key -encryption.iv');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                code: 'NOT_FOUND'
            });
        }

        res.json({
            success: true,
            document: {
                id: document._id,
                documentType: document.documentType,
                issuingCountry: document.issuingCountry,
                ipfsHash: document.ipfs.hash,
                ipfsUrl: `${document.ipfs.gateway}${document.ipfs.hash}`,
                fileName: document.file.originalName,
                fileSize: document.file.size,
                mimeType: document.file.mimeType,
                status: document.verification.status,
                aiConfidence: document.verification.aiConfidence,
                extractedData: document.extractedData,
                quality: document.quality,
                uploadedAt: document.createdAt,
                verifiedAt: document.verification.verifiedAt,
                rejectionReason: document.verification.rejectionReason
            }
        });
    } catch (error) {
        console.error('[DOCUMENT DETAIL ERROR]', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve document',
            code: 'DETAIL_FAILED'
        });
    }
});

// ===========================================
// GET /api/v1/documents/:documentId/download
// Download and decrypt a document from IPFS
// ===========================================
router.get('/:documentId/download', authenticate, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.documentId,
            userId: req.user._id,
            isDeleted: false
        }).select('+encryption._key');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                code: 'NOT_FOUND'
            });
        }

        // Fetch encrypted file from IPFS
        const encryptedBuffer = await fetchFromIPFS(document.ipfs.hash);

        // Decrypt the file
        const decryptedBuffer = decryptFile(
            encryptedBuffer,
            document.encryption._key,
            document.encryption.iv
        );

        // Send as download
        res.setHeader('Content-Type', document.file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.file.originalName}"`);
        res.setHeader('Content-Length', decryptedBuffer.length);
        res.send(decryptedBuffer);
    } catch (error) {
        console.error('[DOWNLOAD ERROR]', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download document',
            code: 'DOWNLOAD_FAILED'
        });
    }
});

// ===========================================
// DELETE /api/v1/documents/:documentId
// Soft delete a document (and optionally unpin from IPFS)
// ===========================================
router.delete('/:documentId', authenticate, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.documentId,
            userId: req.user._id,
            isDeleted: false
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                code: 'NOT_FOUND'
            });
        }

        // Soft delete the document record
        await document.softDelete();

        // Optionally unpin from IPFS (free up Pinata storage)
        try {
            await unpinFromIPFS(document.ipfs.hash);
        } catch (unpinError) {
            // Non-critical — log but don't fail the request
            console.warn(`[UNPIN WARNING] Failed to unpin ${document.ipfs.hash}:`, unpinError.message);
        }

        console.log(`[DELETE] Document ${document._id} soft-deleted by user ${req.user._id}`);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('[DELETE ERROR]', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete document',
            code: 'DELETE_FAILED'
        });
    }
});

module.exports = router;
