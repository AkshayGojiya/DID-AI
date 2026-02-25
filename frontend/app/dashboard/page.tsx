"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { authApi, documentsApi, credentialsApi } from "@/lib/api";

// ── Icons ──────────────────────────────────────────────────────────────────

const VerifiedIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const QRIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────

interface UserProfile {
    did: string;
    walletAddress: string;
    verification: { isVerified: boolean; level: string };
    createdAt: string;
    loginCount: number;
}

interface DocumentItem {
    id: string;
    documentType: string;
    status: string;
    uploadedAt: string;
}

interface CredentialItem {
    id: string;
    type: string;
    status: string;
    issuedAt: string;
    expiresAt: string | null;
}

// ── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

function formatDocType(t: string) {
    return t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatCredType(t: string) {
    return t.replace(/([A-Z])/g, " $1").trim();
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { address, token, isAuthenticated } = useWeb3();

    const [user, setUser]               = useState<UserProfile | null>(null);
    const [documents, setDocuments]     = useState<DocumentItem[]>([]);
    const [credentials, setCredentials] = useState<CredentialItem[]>([]);
    const [loading, setLoading]         = useState(true);
    const [copied, setCopied]           = useState(false);

    const did = user?.did || (address ? `did:ethr:${address}` : "");

    const copyDID = () => {
        if (!did) return;
        navigator.clipboard.writeText(did);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [userRes, docsRes, credsRes] = await Promise.allSettled([
                authApi.me(token),
                documentsApi.list(token),
                credentialsApi.list(token),
            ]);
            if (userRes.status === "fulfilled")  setUser(userRes.value.user);
            if (docsRes.status === "fulfilled")  setDocuments(docsRes.value.documents ?? []);
            if (credsRes.status === "fulfilled") setCredentials(credsRes.value.credentials ?? []);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Auth guard ─────────────────────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-2xl text-center max-w-md"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-white/50 mb-6 text-sm">
                        Connect and sign in with MetaMask to view your dashboard.
                    </p>
                    <Link href="/" className="btn-primary inline-block">Go to Home</Link>
                </motion.div>
            </div>
        );
    }

    // ── Derived values ─────────────────────────────────────────────────────

    const pendingDocs        = documents.filter(d => d.status === "pending").length;
    const activeCredentials  = credentials.filter(c => c.status === "active");

    const activity = [
        ...documents.map(d => ({
            action: `Document uploaded: ${formatDocType(d.documentType)}`,
            time:   timeAgo(d.uploadedAt),
            type:   d.status === "verified" ? "success" : "info",
        })),
        ...credentials.map(c => ({
            action: `Credential issued: ${formatCredType(c.type)}`,
            time:   timeAgo(c.issuedAt),
            type:   "success",
        })),
    ].slice(0, 5);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 pb-8 sm:pb-12">
            <motion.div
                className="max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8 sm:mb-10 md:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                        <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="text-white/50 text-sm sm:text-base">
                        Manage your decentralized identity and credentials
                    </p>
                </motion.div>

                {/* DID Card */}
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 relative overflow-hidden"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5"
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-semibold">Your Decentralized Identity</h3>
                                <motion.span
                                    className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                                        user?.verification?.isVerified
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/20 text-amber-400"
                                    }`}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <VerifiedIcon />
                                    {user?.verification?.isVerified ? "Verified" : "Unverified"}
                                </motion.span>
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto">
                                <code className="text-xs sm:text-sm text-white/60 bg-white/5 px-2 sm:px-3 py-1.5 rounded-lg font-mono whitespace-nowrap">
                                    {loading ? "Loading…" : (did || "—")}
                                </code>
                                {did && (
                                    <motion.button
                                        onClick={copyDID}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                        title="Copy DID"
                                    >
                                        <CopyIcon />
                                    </motion.button>
                                )}
                                {copied && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-xs sm:text-sm text-emerald-400 whitespace-nowrap"
                                    >
                                        Copied!
                                    </motion.span>
                                )}
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
                            <Link href="/credentials" className="btn-primary flex items-center gap-2 justify-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                                <QRIcon />
                                Share Identity
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                    {[
                        { label: "Verified Credentials", value: loading ? "…" : String(activeCredentials.length), icon: <VerifiedIcon />, color: "from-emerald-500 to-teal-500" },
                        { label: "Documents Stored",     value: loading ? "…" : String(documents.length),         icon: <DocumentIcon />, color: "from-violet-500 to-purple-500" },
                        { label: "Pending Reviews",      value: loading ? "…" : String(pendingDocs),              icon: <ClockIcon />,    color: "from-amber-500 to-orange-500" },
                        { label: "Total Logins",         value: loading ? "…" : String(user?.loginCount ?? 0),   icon: <QRIcon />,       color: "from-cyan-500 to-blue-500" },
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

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Credentials list */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                                <h3 className="text-lg sm:text-xl font-semibold">Your Credentials</h3>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link href="/verify" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 flex items-center gap-1 sm:gap-2">
                                        <PlusIcon />
                                        <span className="hidden sm:inline">New Verification</span>
                                        <span className="sm:hidden">New</span>
                                    </Link>
                                </motion.div>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : credentials.length === 0 ? (
                                <div className="text-center py-10 text-white/40 flex flex-col items-center gap-3">
                                    <DocumentIcon />
                                    <p className="text-sm">No credentials yet.</p>
                                    <Link href="/verify" className="text-xs text-violet-400 hover:underline">
                                        Start a verification →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {credentials.map((cred, index) => (
                                        <motion.div
                                            key={cred.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                        cred.status === "active"
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-amber-500/20 text-amber-400"
                                                    }`}
                                                    whileHover={{ rotate: 10 }}
                                                >
                                                    {cred.status === "active" ? <VerifiedIcon /> : <ClockIcon />}
                                                </motion.div>
                                                <div>
                                                    <h4 className="font-medium">{formatCredType(cred.type)}</h4>
                                                    <p className="text-sm text-white/40">
                                                        Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                                                        {cred.expiresAt && ` • Expires: ${new Date(cred.expiresAt).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    cred.status === "active"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-amber-500/20 text-amber-400"
                                                }`}>
                                                    {cred.status === "active" ? "Active" : cred.status}
                                                </span>
                                                <Link
                                                    href="/credentials"
                                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"
                                                >
                                                    <ArrowRightIcon />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
                        {/* Recent Activity */}
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : activity.length === 0 ? (
                                <p className="text-sm text-white/40">No activity yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {activity.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className="flex items-start gap-3"
                                        >
                                            <motion.div
                                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                    item.type === "success" ? "bg-emerald-400" : "bg-violet-400"
                                                }`}
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                            />
                                            <div>
                                                <p className="text-sm">{item.action}</p>
                                                <p className="text-xs text-white/40">{item.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
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
                                    { href: "/verify",      icon: <PlusIcon />,     label: "Start New Verification", color: "violet" },
                                    { href: "/credentials", icon: <QRIcon />,       label: "Generate QR Code",       color: "cyan"   },
                                    { href: "/scan",        icon: <DocumentIcon />, label: "Scan QR Code",           color: "pink"   },
                                ].map((action) => (
                                    <motion.div key={action.href} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
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
