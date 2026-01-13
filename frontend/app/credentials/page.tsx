"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const mockCredentials = [
    {
        id: 1,
        type: "Identity Verification",
        status: "active",
        issuer: "VerifyX",
        issuedAt: "2024-01-10",
        expiresAt: "2025-01-10",
        hash: "0x7a2d35Cc6634C0532925a3b844Bc454e4438f44e...",
        txHash: "0xabc123def456...",
        attributes: [
            { key: "fullName", label: "Full Name", value: "John Doe" },
            { key: "dateOfBirth", label: "Date of Birth", value: "1990-01-15" },
            { key: "nationality", label: "Nationality", value: "United States" },
            { key: "documentNumber", label: "Document Number", value: "AB1234567" },
            { key: "expiryDate", label: "Document Expiry", value: "2030-01-15" },
        ],
    },
    {
        id: 2,
        type: "Document Verification",
        status: "active",
        issuer: "VerifyX",
        issuedAt: "2024-01-12",
        expiresAt: "2025-01-12",
        hash: "0x8b3e46Dd7745D1643a4c5944Cd565e5549g55f...",
        txHash: "0xdef789ghi012...",
        attributes: [
            { key: "documentType", label: "Document Type", value: "Passport" },
            { key: "issuingCountry", label: "Issuing Country", value: "United States" },
            { key: "verified", label: "Verified", value: "Yes" },
        ],
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function CredentialsPage() {
    const [selectedCredential, setSelectedCredential] = useState(mockCredentials[0]);
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);

    const toggleAttribute = (key: string) => {
        setSelectedAttributes((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const generateShareData = () => {
        const sharedData = {
            credentialId: selectedCredential.id,
            credentialType: selectedCredential.type,
            issuer: selectedCredential.issuer,
            attributes: selectedCredential.attributes
                .filter((attr) => selectedAttributes.includes(attr.key))
                .map((attr) => ({ key: attr.key, value: attr.value })),
            timestamp: new Date().toISOString(),
            signature: "mock_signature_" + Date.now(),
        };
        return JSON.stringify(sharedData);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Your Credentials</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        Manage, view, and share your verified credentials
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Credentials List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-1"
                    >
                        <div className="glass-card p-4 rounded-2xl">
                            <h3 className="font-semibold text-lg mb-4 px-2">All Credentials</h3>

                            <div className="space-y-2">
                                {mockCredentials.map((credential, index) => (
                                    <motion.button
                                        key={credential.id}
                                        variants={itemVariants}
                                        onClick={() => {
                                            setSelectedCredential(credential);
                                            setSelectedAttributes([]);
                                        }}
                                        whileHover={{ x: 4 }}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${selectedCredential.id === credential.id
                                                ? "bg-violet-500/20 border border-violet-500/30"
                                                : "bg-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${credential.status === "active"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-amber-500/20 text-amber-400"
                                                    }`}
                                                whileHover={{ rotate: 10 }}
                                            >
                                                {credential.status === "active" ? "✓" : "⏳"}
                                            </motion.div>
                                            <div>
                                                <p className="font-medium">{credential.type}</p>
                                                <p className="text-xs text-white/40">
                                                    Issued: {credential.issuedAt}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <Link
                                href="/verify"
                                className="block mt-4 text-center text-sm text-violet-400 hover:text-violet-300 p-3 bg-violet-500/10 rounded-xl transition-colors"
                            >
                                + Add New Credential
                            </Link>
                        </div>
                    </motion.div>

                    {/* Credential Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedCredential.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-card p-8 rounded-2xl"
                            >
                                {/* Credential Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{selectedCredential.type}</h2>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/50">
                                            Issued by {selectedCredential.issuer} on {selectedCredential.issuedAt}
                                        </p>
                                    </div>
                                    <motion.button
                                        onClick={() => setShowQRModal(true)}
                                        disabled={selectedAttributes.length === 0}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generate QR
                                    </motion.button>
                                </div>

                                {/* Blockchain Info */}
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <p className="text-xs text-white/40 mb-1">Credential Hash</p>
                                        <p className="font-mono text-sm truncate">{selectedCredential.hash}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <p className="text-xs text-white/40 mb-1">Transaction Hash</p>
                                        <p className="font-mono text-sm truncate">{selectedCredential.txHash}</p>
                                    </div>
                                </div>

                                {/* Selective Disclosure */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Selective Disclosure</h3>
                                        <p className="text-sm text-white/50">
                                            {selectedAttributes.length} of {selectedCredential.attributes.length} selected
                                        </p>
                                    </div>
                                    <p className="text-sm text-white/50 mb-4">
                                        Choose which attributes to share. Only selected attributes will be included in the QR code.
                                    </p>

                                    <div className="space-y-3">
                                        {selectedCredential.attributes.map((attr, index) => (
                                            <motion.div
                                                key={attr.key}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => toggleAttribute(attr.key)}
                                                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${selectedAttributes.includes(attr.key)
                                                        ? "bg-violet-500/20 border border-violet-500/30"
                                                        : "bg-white/5 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <motion.div
                                                        animate={{
                                                            scale: selectedAttributes.includes(attr.key) ? [1, 1.2, 1] : 1,
                                                        }}
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAttributes.includes(attr.key)
                                                                ? "bg-violet-500 text-white"
                                                                : "bg-white/10"
                                                            }`}
                                                    >
                                                        {selectedAttributes.includes(attr.key) && "✓"}
                                                    </motion.div>
                                                    <div>
                                                        <p className="font-medium">{attr.label}</p>
                                                        <p className="text-sm text-white/40">{attr.value}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                    >
                                        View on Etherscan
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                    >
                                        Download Certificate
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-4 py-2 bg-red-500/10 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                        Revoke Credential
                                    </motion.button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setShowQRModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card p-8 rounded-3xl max-w-md w-full"
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-2">Share Credential</h3>
                                <p className="text-white/50 text-sm mb-6">
                                    Scan this QR code to verify the selected attributes
                                </p>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="bg-white p-6 rounded-2xl inline-block mb-6"
                                >
                                    <QRCodeSVG
                                        value={generateShareData()}
                                        size={200}
                                        level="H"
                                        includeMargin
                                    />
                                </motion.div>

                                <div className="text-left mb-6 p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-white/40 mb-2">Sharing:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCredential.attributes
                                            .filter((attr) => selectedAttributes.includes(attr.key))
                                            .map((attr) => (
                                                <span
                                                    key={attr.key}
                                                    className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs"
                                                >
                                                    {attr.label}
                                                </span>
                                            ))}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowQRModal(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Close
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 btn-primary"
                                    >
                                        Download
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
