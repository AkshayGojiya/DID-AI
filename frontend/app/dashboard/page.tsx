"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

// Icons
const VerifiedIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const QRIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

// Mock data
const mockDID = "did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const mockWallet = "0x742d...f44e";

const credentials = [
    {
        id: 1,
        type: "Identity Verification",
        status: "verified",
        issuedDate: "2024-01-10",
        expiryDate: "2025-01-10",
    },
    {
        id: 2,
        type: "Document Verification",
        status: "pending",
        issuedDate: "2024-01-12",
        expiryDate: null,
    },
];

const recentActivity = [
    { action: "Identity verified", time: "2 hours ago", type: "success" },
    { action: "Document uploaded", time: "1 day ago", type: "info" },
    { action: "Wallet connected", time: "2 days ago", type: "info" },
    { action: "Credential shared", time: "3 days ago", type: "info" },
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

export default function Dashboard() {
    const [copied, setCopied] = useState(false);

    const copyDID = () => {
        navigator.clipboard.writeText(mockDID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-28 px-6 pb-12">
            <motion.div
                className="max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-white/50">Manage your decentralized identity and credentials</p>
                </motion.div>

                {/* DID Card */}
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-6 rounded-2xl mb-8 relative overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">Your Decentralized Identity</h3>
                                <motion.span
                                    className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <VerifiedIcon />
                                    Active
                                </motion.span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg font-mono">
                                    {mockDID}
                                </code>
                                <motion.button
                                    onClick={copyDID}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Copy DID"
                                >
                                    <CopyIcon />
                                </motion.button>
                                {copied && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-sm text-emerald-400"
                                    >
                                        Copied!
                                    </motion.span>
                                )}
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href="/credentials" className="btn-primary flex items-center gap-2">
                                <QRIcon />
                                Share Identity
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Verified Credentials", value: "2", icon: <VerifiedIcon />, color: "from-emerald-500 to-teal-500" },
                        { label: "Documents Stored", value: "5", icon: <DocumentIcon />, color: "from-violet-500 to-purple-500" },
                        { label: "Pending Reviews", value: "1", icon: <ClockIcon />, color: "from-amber-500 to-orange-500" },
                        { label: "QR Shares", value: "12", icon: <QRIcon />, color: "from-cyan-500 to-blue-500" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="feature-card cursor-pointer"
                        >
                            <motion.div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                {stat.icon}
                            </motion.div>
                            <motion.div
                                className="text-3xl font-bold mb-1"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-sm text-white/50">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Credentials */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">Your Credentials</h3>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link href="/verify" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                                        <PlusIcon />
                                        New Verification
                                    </Link>
                                </motion.div>
                            </div>

                            <div className="space-y-4">
                                {credentials.map((cred, index) => (
                                    <motion.div
                                        key={cred.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${cred.status === 'verified'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                    }`}
                                                whileHover={{ rotate: 10 }}
                                            >
                                                {cred.status === 'verified' ? <VerifiedIcon /> : <ClockIcon />}
                                            </motion.div>
                                            <div>
                                                <h4 className="font-medium">{cred.type}</h4>
                                                <p className="text-sm text-white/40">
                                                    Issued: {cred.issuedDate}
                                                    {cred.expiryDate && ` • Expires: ${cred.expiryDate}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cred.status === 'verified'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {cred.status === 'verified' ? 'Verified' : 'Pending'}
                                            </span>
                                            <motion.button
                                                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                                                whileHover={{ x: 5 }}
                                            >
                                                <ArrowRightIcon />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
                        {/* Recent Activity */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-3"
                                    >
                                        <motion.div
                                            className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-emerald-400' : 'bg-violet-400'
                                                }`}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                        />
                                        <div>
                                            <p className="text-sm">{activity.action}</p>
                                            <p className="text-xs text-white/40">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link
                                href="/activity"
                                className="block mt-6 text-center text-sm text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                View All Activity →
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                {[
                                    { href: "/verify", icon: <PlusIcon />, label: "Start New Verification", color: "violet" },
                                    { href: "/credentials", icon: <QRIcon />, label: "Generate QR Code", color: "cyan" },
                                    { href: "/scan", icon: <DocumentIcon />, label: "Scan QR Code", color: "pink" },
                                ].map((action, index) => (
                                    <motion.div
                                        key={action.href}
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link
                                            href={action.href}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-${action.color}-500/20 flex items-center justify-center text-${action.color}-400`}>
                                                {action.icon}
                                            </div>
                                            <span className="text-sm">{action.label}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
