"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ScanPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<null | {
        success: boolean;
        data?: {
            did: string;
            credentialType: string;
            issuer: string;
            issuedAt: string;
            attributes: string[];
            verified: boolean;
        };
    }>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Mock scan function
    const handleStartScan = () => {
        setIsScanning(true);
        setScanResult(null);

        // Simulate scanning after 3 seconds
        setTimeout(() => {
            setScanResult({
                success: true,
                data: {
                    did: "did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                    credentialType: "Identity Verification",
                    issuer: "VerifyX",
                    issuedAt: "2024-01-10",
                    attributes: ["Full Name", "Nationality", "Date of Birth"],
                    verified: true,
                },
            });
            setIsScanning(false);
        }, 3000);
    };

    const handleReset = () => {
        setScanResult(null);
        setIsScanning(false);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Scan & Verify</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">
                        Scan a QR code to verify someone's credentials instantly on the blockchain
                    </p>
                </motion.div>

                {/* Scanner Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-3xl p-8 mb-8"
                >
                    <AnimatePresence mode="wait">
                        {!scanResult ? (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                {/* Camera View */}
                                <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-black/50 mb-8">
                                    {isScanning ? (
                                        <>
                                            {/* Simulated camera feed */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10" />

                                            {/* Scanning animation */}
                                            <motion.div
                                                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                                                initial={{ top: 0 }}
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Corner markers */}
                                            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-violet-500" />
                                            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-violet-500" />
                                            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-violet-500" />
                                            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-violet-500" />

                                            {/* Center crosshair */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-32 h-32 relative">
                                                    <div className="absolute inset-0 border-2 border-violet-500/50 rounded-lg animate-pulse" />
                                                    <motion.div
                                                        className="absolute inset-2 border border-cyan-500/50 rounded-lg"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                </div>
                                            </div>

                                            <p className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-sm">
                                                Position QR code within the frame
                                            </p>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4"
                                            >
                                                <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                                </svg>
                                            </motion.div>
                                            <p className="text-white/40 text-sm">Camera preview will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {/* Scan Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleStartScan}
                                    disabled={isScanning}
                                    className={`btn-glow text-lg px-10 py-4 ${isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isScanning ? (
                                        <span className="flex items-center gap-3">
                                            <span className="spinner" />
                                            Scanning...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                                            </svg>
                                            Start Scanning
                                        </span>
                                    )}
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {/* Success Result */}
                                {scanResult.success && scanResult.data && (
                                    <div>
                                        {/* Success Header */}
                                        <div className="text-center mb-8">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", bounce: 0.5 }}
                                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                                            >
                                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Credential Verified!</h2>
                                            <p className="text-white/60">This credential is valid and verified on the blockchain</p>
                                        </div>

                                        {/* Credential Details */}
                                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">DID</p>
                                                <p className="font-mono text-sm text-white/80 truncate">{scanResult.data.did}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Credential Type</p>
                                                <p className="font-medium">{scanResult.data.credentialType}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Issuer</p>
                                                <p className="font-medium">{scanResult.data.issuer}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Issued Date</p>
                                                <p className="font-medium">{scanResult.data.issuedAt}</p>
                                            </div>
                                        </div>

                                        {/* Shared Attributes */}
                                        <div className="mb-8">
                                            <p className="text-sm text-white/40 mb-3">Shared Attributes</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scanResult.data.attributes.map((attr, i) => (
                                                    <motion.span
                                                        key={attr}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full text-sm"
                                                    >
                                                        {attr}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Blockchain Verification */}
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-emerald-400">Blockchain Verified</p>
                                                    <p className="text-xs text-white/40">Credential hash verified on Ethereum</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-4 justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleReset}
                                                className="btn-secondary"
                                            >
                                                Scan Another
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="btn-primary"
                                            >
                                                Save to History
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: "🔒",
                            title: "Privacy Protected",
                            description: "Only shared attributes are revealed, your data stays private",
                        },
                        {
                            icon: "⚡",
                            title: "Instant Verification",
                            description: "Blockchain verification happens in real-time",
                        },
                        {
                            icon: "✓",
                            title: "Tamper Proof",
                            description: "Credentials cannot be forged or modified",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass-card-hover p-6 rounded-2xl text-center"
                        >
                            <div className="text-3xl mb-3">{card.icon}</div>
                            <h3 className="font-semibold mb-2">{card.title}</h3>
                            <p className="text-sm text-white/50">{card.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
