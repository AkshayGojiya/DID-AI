require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// ===========================================
// Middleware Configuration
// ===========================================

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ===========================================
// Health Check Endpoints
// ===========================================

app.get('/', (req, res) => {
    res.json({
        name: 'VerifyX API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
    });
});

app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus[dbState] || 'unknown',
            ipfs: 'pending',
            ai: 'pending',
        },
    });
});

app.get('/api/v1/status', (req, res) => {
    res.json({
        api: 'v1',
        status: 'operational',
        endpoints: {
            auth: '/api/v1/auth',
            did: '/api/v1/did',
            documents: '/api/v1/documents',
            verification: '/api/v1/verification',
            credentials: '/api/v1/credentials',
        },
    });
});

// ===========================================
// API Routes (Placeholders)
// ===========================================

// Auth routes
app.post('/api/v1/auth/nonce', (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Generate a random nonce for wallet signature
    const nonce = `Sign this message to authenticate with VerifyX: ${Date.now()}-${Math.random().toString(36).substring(7)}`;

    res.json({
        success: true,
        nonce,
        walletAddress,
    });
});

app.post('/api/v1/auth/verify', (req, res) => {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Verify signature using ethers.js
    // For now, return mock JWT token
    res.json({
        success: true,
        token: 'mock_jwt_token_' + Date.now(),
        user: {
            walletAddress,
            did: `did:ethr:${walletAddress}`,
            createdAt: new Date().toISOString(),
        },
    });
});

// DID routes
app.get('/api/v1/did/:address', (req, res) => {
    const { address } = req.params;

    res.json({
        success: true,
        did: {
            id: `did:ethr:${address}`,
            controller: address,
            publicKey: 'mock_public_key',
            createdAt: new Date().toISOString(),
            status: 'active',
        },
    });
});

app.post('/api/v1/did/register', (req, res) => {
    const { walletAddress, publicKey } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    res.json({
        success: true,
        did: {
            id: `did:ethr:${walletAddress}`,
            controller: walletAddress,
            publicKey: publicKey || 'generated_public_key',
            createdAt: new Date().toISOString(),
            status: 'active',
        },
    });
});

// Document routes
app.post('/api/v1/documents/upload', (req, res) => {
    // TODO: Implement file upload with multer
    res.json({
        success: true,
        message: 'Document upload endpoint - implementation pending',
        document: {
            id: 'doc_' + Date.now(),
            ipfsHash: 'Qm...',
            encryptedAt: new Date().toISOString(),
        },
    });
});

app.get('/api/v1/documents/:userId', (req, res) => {
    const { userId } = req.params;

    res.json({
        success: true,
        documents: [
            {
                id: 'doc_001',
                type: 'passport',
                status: 'verified',
                ipfsHash: 'QmXxXxXxX...',
                uploadedAt: new Date().toISOString(),
            },
        ],
    });
});

// Verification routes
app.post('/api/v1/verification/start', (req, res) => {
    const { userId, documentId } = req.body;

    res.json({
        success: true,
        verification: {
            id: 'ver_' + Date.now(),
            userId,
            documentId,
            status: 'pending',
            steps: {
                documentUpload: 'complete',
                faceCapture: 'pending',
                livenessCheck: 'pending',
                aiVerification: 'pending',
            },
            createdAt: new Date().toISOString(),
        },
    });
});

app.get('/api/v1/verification/:verificationId', (req, res) => {
    const { verificationId } = req.params;

    res.json({
        success: true,
        verification: {
            id: verificationId,
            status: 'completed',
            result: {
                faceMatch: { score: 0.95, passed: true },
                liveness: { score: 0.98, passed: true },
                documentOcr: { extracted: true, validated: true },
            },
            credential: {
                hash: '0x7a2d...f44e',
                txHash: '0xabc123...def456',
            },
            completedAt: new Date().toISOString(),
        },
    });
});

// Credentials routes
app.get('/api/v1/credentials/:userId', (req, res) => {
    const { userId } = req.params;

    res.json({
        success: true,
        credentials: [
            {
                id: 'cred_001',
                type: 'identity_verification',
                status: 'active',
                issuedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                hash: '0x7a2d...f44e',
                attributes: ['fullName', 'dateOfBirth', 'nationality'],
            },
        ],
    });
});

app.post('/api/v1/credentials/verify', (req, res) => {
    const { credentialId, signature, attributes } = req.body;

    res.json({
        success: true,
        verified: true,
        credential: {
            id: credentialId,
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            attributes: attributes || ['fullName', 'nationality'],
        },
    });
});

// ===========================================
// Error Handling
// ===========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString(),
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
    });
});

// ===========================================
// Server Start
// ===========================================

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🚀 VerifyX API Server                       ║
  ║                                               ║
  ║   Status:  Running                            ║
  ║   Port:    ${PORT}                               ║
  ║   Mode:    ${process.env.NODE_ENV || 'development'}                       ║
  ║                                               ║
  ║   Endpoints:                                  ║
  ║   • Health:  http://localhost:${PORT}/health     ║
  ║   • API:     http://localhost:${PORT}/api/v1     ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
