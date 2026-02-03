/**
 * MongoDB Database Connection Configuration
 * ==========================================
 * Handles connection to MongoDB Atlas with retry logic
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options are now default in Mongoose 6+, but explicit for clarity
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`
  ╔═══════════════════════════════════════════════╗
  ║  ✅ MongoDB Connected Successfully            ║
  ║  Host: ${conn.connection.host.padEnd(37)}║
  ║  Database: ${(conn.connection.name || 'verifyx').padEnd(33)}║
  ╚═══════════════════════════════════════════════╝
        `);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error(`
  ╔═══════════════════════════════════════════════╗
  ║  ❌ MongoDB Connection Failed                 ║
  ║  Error: ${error.message.substring(0, 35).padEnd(37)}║
  ╚═══════════════════════════════════════════════╝
        `);

        // Exit process with failure
        process.exit(1);
    }
};

// Graceful shutdown
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

module.exports = { connectDB, disconnectDB };
