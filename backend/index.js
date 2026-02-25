require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const blockchainService = require('./services/blockchainService');

// Import routes
const { authRoutes, didRoutes, documentRoutes } = require('./routes');

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

app.get('/health', async (req, res) => {
    const mongoose = require('mongoose');
    const ipfsService = require('./services/ipfsService');
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    // Check blockchain connection
    const blockchainConnected = await blockchainService.isConnected();

    // Check IPFS (Pinata) connection
    let ipfsConnected = false;
    try {
        ipfsConnected = await ipfsService.testConnection();
    } catch { /* ignore */ }

    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            database: dbStatus[dbState] || 'unknown',
            blockchain: blockchainConnected ? 'connected' : 'disconnected',
            ipfs: ipfsConnected ? 'connected' : 'disconnected',
            ai: 'pending',
        },
    });
});

app.get('/api/v1/status', async (req, res) => {
    const blockchainInfo = await blockchainService.getProviderInfo();

    res.json({
        api: 'v1',
        status: 'operational',
        blockchain: blockchainInfo,
        contracts: blockchainService.getContractAddresses(),
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
// API Routes
// ===========================================

// Auth routes (real implementation)
app.use('/api/v1/auth', authRoutes);

// DID routes (real implementation with blockchain)
app.use('/api/v1/did', didRoutes);

// Document routes (real implementation with IPFS + encryption)
app.use('/api/v1/documents', documentRoutes);

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
