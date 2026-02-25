require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/database');
const blockchainService = require('./services/blockchainService');

// Import routes
const { authRoutes, didRoutes, documentRoutes, credentialRoutes } = require('./routes');

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

// Credential routes (real implementation with MongoDB)
app.use('/api/v1/credentials', credentialRoutes);

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
