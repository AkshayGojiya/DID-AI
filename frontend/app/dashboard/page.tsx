"use client";

import Link from "next/link";
import { useState } from "react";

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
];

export default function Dashboard() {
    const [isConnected] = useState(true);
    const [copied, setCopied] = useState(false);

    const copyDID = () => {
        navigator.clipboard.writeText(mockDID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-24 px-6 pb-12">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                            <span className="text-xl font-bold gradient-text-animated">VerifyX</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/dashboard" className="nav-link text-white">Dashboard</Link>
                            <Link href="/verify" className="nav-link">Verify</Link>
                            <Link href="/credentials" className="nav-link">Credentials</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {isConnected && (
                                <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-sm">{mockWallet}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-400">Manage your decentralized identity and credentials</p>
                </div>

                {/* DID Card */}
                <div className="glass-card p-6 rounded-2xl mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">Your Decentralized Identity</h3>
                                <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                                    <VerifiedIcon />
                                    Active
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg font-mono">
                                    {mockDID}
                                </code>
                                <button
                                    onClick={copyDID}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Copy DID"
                                >
                                    <CopyIcon />
                                </button>
                                {copied && <span className="text-sm text-emerald-400">Copied!</span>}
                            </div>
                        </div>
                        <Link href="/credentials" className="btn-primary flex items-center gap-2">
                            <QRIcon />
                            Share Identity
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Verified Credentials", value: "2", icon: <VerifiedIcon />, color: "from-emerald-500 to-teal-500" },
                        { label: "Documents Stored", value: "5", icon: <DocumentIcon />, color: "from-indigo-500 to-purple-500" },
                        { label: "Pending Reviews", value: "1", icon: <ClockIcon />, color: "from-amber-500 to-orange-500" },
                        { label: "QR Shares", value: "12", icon: <QRIcon />, color: "from-cyan-500 to-blue-500" },
                    ].map((stat, index) => (
                        <div key={index} className="feature-card">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Credentials */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold">Your Credentials</h3>
                                <Link href="/verify" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                                    <PlusIcon />
                                    New Verification
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {credentials.map((cred) => (
                                    <div
                                        key={cred.id}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cred.status === 'verified'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {cred.status === 'verified' ? <VerifiedIcon /> : <ClockIcon />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{cred.type}</h4>
                                                <p className="text-sm text-gray-400">
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
                                            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all">
                                                <ArrowRightIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'
                                            }`} />
                                        <div>
                                            <p className="text-sm">{activity.action}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/activity"
                                className="block mt-6 text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                View All Activity
                            </Link>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card p-6 rounded-2xl mt-4">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/verify" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <PlusIcon />
                                    </div>
                                    <span className="text-sm">Start New Verification</span>
                                </Link>
                                <Link href="/credentials" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <QRIcon />
                                    </div>
                                    <span className="text-sm">Generate QR Code</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
