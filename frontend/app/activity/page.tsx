"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { activityApi } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityEvent {
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    meta: Record<string, any>;
}

interface ActivityStats {
    total: number;
    documents: number;
    credentials: number;
    scans: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    const weeks = Math.floor(days / 7);
    if (mins  < 1)  return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return `${weeks}w ago`;
}

// ─── Event → display config ───────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, {
    icon: string;
    color: keyof typeof COLOR_CLASSES;
    filterGroup: string;
}> = {
    account_created:    { icon: "🔐", color: "amber",   filterGroup: "account"   },
    did_registered:     { icon: "🆔", color: "violet",  filterGroup: "account"   },
    wallet_connected:   { icon: "🔗", color: "amber",   filterGroup: "account"   },
    document_upload:    { icon: "📄", color: "violet",  filterGroup: "document"  },
    document_verified:  { icon: "✓",  color: "emerald", filterGroup: "document"  },
    document_rejected:  { icon: "✕",  color: "pink",    filterGroup: "document"  },
    credential_issued:  { icon: "🏅", color: "emerald", filterGroup: "credential"},
    credential_revoked: { icon: "❌", color: "pink",    filterGroup: "credential"},
};

const DEFAULT_CONFIG = { icon: "•", color: "cyan" as const, filterGroup: "account" };

const COLOR_CLASSES = {
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500" },
    violet:  { bg: "bg-violet-500/20",  text: "text-violet-400",  border: "border-violet-500/30",  dot: "bg-violet-500"  },
    cyan:    { bg: "bg-cyan-500/20",    text: "text-cyan-400",    border: "border-cyan-500/30",    dot: "bg-cyan-500"    },
    pink:    { bg: "bg-pink-500/20",    text: "text-pink-400",    border: "border-pink-500/30",    dot: "bg-pink-500"    },
    amber:   { bg: "bg-amber-500/20",   text: "text-amber-400",   border: "border-amber-500/30",   dot: "bg-amber-500"   },
} as const;

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTERS = [
    { id: "all",        label: "All Activity"  },
    { id: "credential", label: "Credentials"   },
    { id: "document",   label: "Documents"     },
    { id: "account",    label: "Account"       },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityPage() {
    const { token, isAuthenticated } = useWeb3();
    const router = useRouter();

    const [events, setEvents]           = useState<ActivityEvent[]>([]);
    const [stats, setStats]             = useState<ActivityStats>({ total: 0, documents: 0, credentials: 0, scans: 0 });
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const loadActivity = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await activityApi.list(token);
            setEvents(res.events);
            setStats(res.stats);
        } catch (e: any) {
            setError(e.message || "Failed to load activity");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.push("/");
            return;
        }
        loadActivity();
    }, [isAuthenticated, token, loadActivity, router]);

    // Apply filter
    const filtered = events.filter(ev => {
        if (activeFilter === "all") return true;
        const cfg = EVENT_CONFIG[ev.type] ?? DEFAULT_CONFIG;
        return cfg.filterGroup === activeFilter;
    });

    // ── Render ────────────────────────────────────────────────────────────────
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
                        { label: "Total Events",  value: stats.total       },
                        { label: "Documents",      value: stats.documents   },
                        { label: "Credentials",    value: stats.credentials },
                        { label: "QR Verifications", value: stats.scans     },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="glass-card p-5 rounded-xl"
                        >
                            {loading ? (
                                <div className="h-8 w-12 bg-white/10 rounded animate-pulse mb-1" />
                            ) : (
                                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                            )}
                            <p className="text-sm text-white/60">{stat.label}</p>
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
                    {FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                activeFilter === filter.id
                                    ? "bg-violet-500 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </motion.div>

                {/* Error state */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-6 rounded-xl text-center mb-8"
                    >
                        <p className="text-red-400 mb-3">{error}</p>
                        <button
                            onClick={loadActivity}
                            className="text-sm px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </motion.div>
                )}

                {/* Loading skeleton */}
                {loading && !error && (
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="relative pl-16">
                                <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-white/10 animate-pulse" />
                                <div className="glass-card p-5 rounded-xl">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                                            <div className="h-3 w-64 bg-white/10 rounded animate-pulse" />
                                        </div>
                                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 rounded-xl text-center"
                    >
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-white/60">
                            {activeFilter === "all"
                                ? "No activity yet. Start by verifying your identity."
                                : `No ${activeFilter} events yet.`}
                        </p>
                    </motion.div>
                )}

                {/* Timeline */}
                {!loading && !error && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative"
                    >
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent" />

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((ev, index) => {
                                    const cfg    = EVENT_CONFIG[ev.type] ?? DEFAULT_CONFIG;
                                    const colors = COLOR_CLASSES[cfg.color];
                                    const isOpen = expandedItem === ev.id;

                                    return (
                                        <motion.div
                                            key={ev.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: 0.04 * index }}
                                            className="relative pl-16"
                                        >
                                            {/* Timeline dot */}
                                            <motion.div
                                                whileHover={{ scale: 1.2 }}
                                                className={`absolute left-4 top-4 w-5 h-5 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center z-10`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                            </motion.div>

                                            {/* Card */}
                                            <motion.div
                                                layout
                                                onClick={() => setExpandedItem(isOpen ? null : ev.id)}
                                                className={`glass-card-hover p-5 rounded-xl cursor-pointer ${
                                                    isOpen ? "ring-1 ring-violet-500/30" : ""
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl shrink-0`}>
                                                        {cfg.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-semibold mb-1">{ev.title}</h3>
                                                                <p className="text-sm text-white/50">{ev.description}</p>
                                                            </div>
                                                            <span className="text-xs text-white/40 whitespace-nowrap shrink-0">
                                                                {timeAgo(ev.date)}
                                                            </span>
                                                        </div>

                                                        {/* Expanded details */}
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="mt-4 pt-4 border-t border-white/10 space-y-2"
                                                            >
                                                                {/* Timestamp */}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-white/40 w-24 shrink-0">Time:</span>
                                                                    <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded">
                                                                        {new Date(ev.date).toLocaleString()}
                                                                    </code>
                                                                </div>

                                                                {/* Wallet / DID / hash / ipfsHash etc. */}
                                                                {ev.meta.txHash && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">Tx Hash:</span>
                                                                        <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded truncate max-w-xs">
                                                                            {ev.meta.txHash}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {ev.meta.ipfsHash && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">IPFS Hash:</span>
                                                                        <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded truncate max-w-xs">
                                                                            {ev.meta.ipfsHash}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {ev.meta.hash && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">Cred Hash:</span>
                                                                        <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded truncate max-w-xs">
                                                                            {ev.meta.hash}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {ev.meta.did && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">DID:</span>
                                                                        <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded truncate max-w-xs">
                                                                            {ev.meta.did}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {ev.meta.aiConfidence !== undefined && ev.meta.aiConfidence !== null && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">AI Score:</span>
                                                                        <span className="text-xs text-emerald-400">
                                                                            {(ev.meta.aiConfidence * 100).toFixed(1)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {ev.meta.credentialId && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">Credential:</span>
                                                                        <code className="text-xs text-violet-400 bg-white/5 px-2 py-1 rounded truncate max-w-xs">
                                                                            {ev.meta.credentialId}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {ev.meta.expiresAt && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-white/40 w-24 shrink-0">Expires:</span>
                                                                        <span className="text-xs text-white/60">
                                                                            {new Date(ev.meta.expiresAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
