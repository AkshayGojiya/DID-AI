"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const docsSections = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: "🚀",
        items: [
            { id: "introduction", title: "Introduction", content: "Welcome to VerifyX, the decentralized identity verification platform." },
            { id: "quick-start", title: "Quick Start Guide", content: "Get up and running with VerifyX in minutes." },
            { id: "wallet-setup", title: "Wallet Setup", content: "Connect your MetaMask or other Web3 wallet." },
        ],
    },
    {
        id: "verification",
        title: "Identity Verification",
        icon: "✓",
        items: [
            { id: "process-overview", title: "Process Overview", content: "Understanding the verification flow." },
            { id: "document-types", title: "Supported Documents", content: "List of accepted identity documents." },
            { id: "face-verification", title: "Face Verification", content: "How AI-powered face matching works." },
            { id: "liveness-detection", title: "Liveness Detection", content: "Anti-spoofing measures explained." },
        ],
    },
    {
        id: "credentials",
        title: "Credentials",
        icon: "🪪",
        items: [
            { id: "what-are-credentials", title: "What are Credentials", content: "Understanding verifiable credentials." },
            { id: "selective-disclosure", title: "Selective Disclosure", content: "Share only what you need to share." },
            { id: "qr-sharing", title: "QR Code Sharing", content: "How to share credentials via QR codes." },
        ],
    },
    {
        id: "security",
        title: "Security",
        icon: "🔒",
        items: [
            { id: "encryption", title: "Encryption", content: "How your data is protected." },
            { id: "blockchain", title: "Blockchain Security", content: "Immutability and trust guarantees." },
            { id: "privacy", title: "Privacy Model", content: "Your privacy is our priority." },
        ],
    },
    {
        id: "api",
        title: "API Reference",
        icon: "⚡",
        items: [
            { id: "authentication", title: "Authentication", content: "API authentication methods." },
            { id: "endpoints", title: "Endpoints", content: "Available API endpoints." },
            { id: "webhooks", title: "Webhooks", content: "Real-time event notifications." },
        ],
    },
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");
    const [activeItem, setActiveItem] = useState("introduction");
    const [searchQuery, setSearchQuery] = useState("");

    const currentSection = docsSections.find((s) => s.id === activeSection);
    const currentItem = currentSection?.items.find((i) => i.id === activeItem);

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
                        <span className="gradient-text">Documentation</span>
                    </h1>
                    <p className="text-white/60 text-lg mb-8">
                        Everything you need to know about VerifyX
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl">
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-glass w-full pl-12"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card rounded-2xl p-4 sticky top-24">
                            <nav className="space-y-4">
                                {docsSections.map((section) => (
                                    <div key={section.id}>
                                        <button
                                            onClick={() => {
                                                setActiveSection(section.id);
                                                setActiveItem(section.items[0].id);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-colors ${activeSection === section.id
                                                    ? "text-white"
                                                    : "text-white/50 hover:text-white"
                                                }`}
                                        >
                                            <span>{section.icon}</span>
                                            <span>{section.title}</span>
                                        </button>

                                        {activeSection === section.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="ml-6 mt-1 space-y-1"
                                            >
                                                {section.items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setActiveItem(item.id)}
                                                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${activeItem === item.id
                                                                ? "text-violet-400 bg-violet-500/10"
                                                                : "text-white/40 hover:text-white/70"
                                                            }`}
                                                    >
                                                        {item.title}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4"
                    >
                        <div className="glass-card rounded-2xl p-8">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
                                <span>Docs</span>
                                <span>/</span>
                                <span>{currentSection?.title}</span>
                                <span>/</span>
                                <span className="text-white">{currentItem?.title}</span>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold mb-4">{currentItem?.title}</h2>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-white/70 text-lg mb-8">{currentItem?.content}</p>

                                {/* Introduction Content */}
                                {activeItem === "introduction" && (
                                    <>
                                        <h3 className="text-xl font-semibold mt-8 mb-4">What is VerifyX?</h3>
                                        <p className="text-white/60 mb-4">
                                            VerifyX is a decentralized identity verification platform that combines
                                            artificial intelligence with blockchain technology to provide secure,
                                            privacy-preserving identity verification.
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-4 my-8">
                                            {[
                                                { icon: "🔐", title: "Self-Sovereign", desc: "You own and control your identity" },
                                                { icon: "🤖", title: "AI-Powered", desc: "Advanced face and document verification" },
                                                { icon: "⛓️", title: "Blockchain", desc: "Immutable credential storage" },
                                                { icon: "🔒", title: "Privacy First", desc: "Zero personal data on-chain" },
                                            ].map((feature) => (
                                                <div key={feature.title} className="p-4 bg-white/5 rounded-xl">
                                                    <div className="text-2xl mb-2">{feature.icon}</div>
                                                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                                                    <p className="text-sm text-white/50">{feature.desc}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-xl font-semibold mt-8 mb-4">How It Works</h3>
                                        <ol className="list-decimal list-inside space-y-3 text-white/60">
                                            <li>Connect your Web3 wallet (MetaMask, WalletConnect, etc.)</li>
                                            <li>Upload your identity documents securely</li>
                                            <li>Complete AI-powered face and liveness verification</li>
                                            <li>Receive blockchain-backed verifiable credentials</li>
                                            <li>Share credentials selectively with anyone</li>
                                        </ol>
                                    </>
                                )}

                                {/* Quick Start Content */}
                                {activeItem === "quick-start" && (
                                    <>
                                        <h3 className="text-xl font-semibold mt-8 mb-4">Prerequisites</h3>
                                        <ul className="list-disc list-inside space-y-2 text-white/60 mb-8">
                                            <li>A Web3 wallet (MetaMask recommended)</li>
                                            <li>A valid identity document (passport, driving license, or national ID)</li>
                                            <li>A device with a camera for selfie verification</li>
                                        </ul>

                                        <h3 className="text-xl font-semibold mt-8 mb-4">Step 1: Connect Your Wallet</h3>
                                        <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                                            <p className="text-sm text-white/70">
                                                Click the "Connect Wallet" button in the top right corner and follow
                                                the prompts in your wallet extension.
                                            </p>
                                        </div>

                                        <h3 className="text-xl font-semibold mt-8 mb-4">Step 2: Start Verification</h3>
                                        <p className="text-white/60 mb-4">
                                            Navigate to the Verify page and follow the 4-step process to complete
                                            your identity verification.
                                        </p>

                                        <div className="flex gap-4 mt-8">
                                            <Link href="/verify" className="btn-primary">
                                                Start Verification
                                            </Link>
                                            <Link href="/docs/verification" className="btn-secondary">
                                                Learn More
                                            </Link>
                                        </div>
                                    </>
                                )}

                                {/* API Reference Content */}
                                {activeSection === "api" && (
                                    <>
                                        <h3 className="text-xl font-semibold mt-8 mb-4">API Endpoints</h3>

                                        <div className="space-y-4">
                                            {[
                                                { method: "POST", path: "/api/v1/auth/nonce", desc: "Get authentication nonce" },
                                                { method: "POST", path: "/api/v1/auth/verify", desc: "Verify wallet signature" },
                                                { method: "GET", path: "/api/v1/did/:address", desc: "Get DID document" },
                                                { method: "POST", path: "/api/v1/verification/start", desc: "Start verification" },
                                                { method: "GET", path: "/api/v1/credentials/:userId", desc: "Get user credentials" },
                                            ].map((endpoint) => (
                                                <div key={endpoint.path} className="p-4 bg-white/5 rounded-xl">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-mono ${endpoint.method === "GET"
                                                                ? "bg-emerald-500/20 text-emerald-400"
                                                                : "bg-violet-500/20 text-violet-400"
                                                            }`}>
                                                            {endpoint.method}
                                                        </span>
                                                        <code className="text-sm text-white/80">{endpoint.path}</code>
                                                    </div>
                                                    <p className="text-sm text-white/50">{endpoint.desc}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                            <p className="text-sm text-amber-300">
                                                <strong>Note:</strong> All API endpoints require authentication via JWT token
                                                obtained from the auth flow.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                                <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>
                                <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                                    Next
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
