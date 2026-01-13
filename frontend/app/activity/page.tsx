"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const activityData = [
    {
        id: 1,
        type: "verification_complete",
        title: "Identity Verified Successfully",
        description: "Your identity verification was completed and credentials issued",
        timestamp: "2 hours ago",
        icon: "✓",
        color: "emerald",
        txHash: "0xabc123...def456",
    },
    {
        id: 2,
        type: "document_upload",
        title: "Document Uploaded",
        description: "Passport document encrypted and stored on IPFS",
        timestamp: "1 day ago",
        icon: "📄",
        color: "violet",
        ipfsHash: "QmXxXxXx...YyYyYy",
    },
    {
        id: 3,
        type: "credential_shared",
        title: "Credential Shared",
        description: "You shared your identity credential with MegaCorp Inc.",
        timestamp: "2 days ago",
        icon: "🔗",
        color: "cyan",
    },
    {
        id: 4,
        type: "scan_verified",
        title: "QR Code Scanned",
        description: "You verified a credential from did:ethr:0x8a2f...b3c1",
        timestamp: "3 days ago",
        icon: "📱",
        color: "pink",
    },
    {
        id: 5,
        type: "wallet_connected",
        title: "Wallet Connected",
        description: "MetaMask wallet connected: 0x742d35Cc...4438f44e",
        timestamp: "5 days ago",
        icon: "🔐",
        color: "amber",
    },
    {
        id: 6,
        type: "did_created",
        title: "DID Created",
        description: "Your decentralized identity was registered on blockchain",
        timestamp: "5 days ago",
        icon: "🆔",
        color: "violet",
        txHash: "0x7890abc...123def",
    },
    {
        id: 7,
        type: "credential_shared",
        title: "Credential Shared",
        description: "You shared nationality attribute with TravelSafe App",
        timestamp: "1 week ago",
        icon: "🔗",
        color: "cyan",
    },
    {
        id: 8,
        type: "liveness_check",
        title: "Liveness Check Passed",
        description: "Anti-spoofing verification completed successfully",
        timestamp: "1 week ago",
        icon: "👤",
        color: "emerald",
    },
];

const filters = [
    { id: "all", label: "All Activity" },
    { id: "verification", label: "Verifications" },
    { id: "credential", label: "Credentials" },
    { id: "scan", label: "Scans" },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    violet: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
    cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
    pink: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
    amber: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
};

export default function ActivityPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Activity Log</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        Track all your identity verification activities and transactions
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: "Total Actions", value: "24", change: "+3 this week" },
                        { label: "Verifications", value: "5", change: "+1 this week" },
                        { label: "Shares", value: "12", change: "+2 this week" },
                        { label: "Scans", value: "7", change: "+1 this week" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="glass-card p-5 rounded-xl"
                        >
                            <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                            <p className="text-sm text-white/60">{stat.label}</p>
                            <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-2 mb-8 overflow-x-auto pb-2"
                >
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter.id
                                    ? "bg-violet-500 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </motion.div>

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent" />

                    {/* Activity Items */}
                    <div className="space-y-4">
                        {activityData.map((item, index) => {
                            const colors = colorClasses[item.color];
                            const isExpanded = expandedItem === item.id;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="relative pl-16"
                                >
                                    {/* Timeline dot */}
                                    <motion.div
                                        whileHover={{ scale: 1.2 }}
                                        className={`absolute left-4 top-4 w-5 h-5 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center z-10`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${colors.bg.replace("/20", "")}`} />
                                    </motion.div>

                                    {/* Activity Card */}
                                    <motion.div
                                        layout
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                        className={`glass-card-hover p-5 rounded-xl cursor-pointer ${isExpanded ? "ring-1 ring-violet-500/30" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl shrink-0`}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                                        <p className="text-sm text-white/50">{item.description}</p>
                                                    </div>
                                                    <span className="text-xs text-white/40 whitespace-nowrap">{item.timestamp}</span>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-4 pt-4 border-t border-white/10"
                                                    >
                                                        {item.txHash && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs text-white/40">Transaction:</span>
                                                                <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded">
                                                                    {item.txHash}
                                                                </code>
                                                                <button className="text-xs text-cyan-400 hover:underline">View</button>
                                                            </div>
                                                        )}
                                                        {item.ipfsHash && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs text-white/40">IPFS Hash:</span>
                                                                <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded">
                                                                    {item.ipfsHash}
                                                                </code>
                                                                <button className="text-xs text-cyan-400 hover:underline">View</button>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 mt-3">
                                                            <button className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                                View Details
                                                            </button>
                                                            <button className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                                Export
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Load More */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary"
                    >
                        Load More Activity
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
