"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { documentsApi } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────

interface DocumentItem {
    id: string;
    documentType: string;
    issuingCountry: string | null;
    ipfsHash: string;
    ipfsUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    status: string;
    aiConfidence: number | null;
    uploadedAt: string;
    verifiedAt: string | null;
}

// ── Icons ──────────────────────────────────────────────────────

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

// ── Helpers ────────────────────────────────────────────────────

function formatDocType(t: string) {
    return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function statusConfig(status: string) {
    switch (status) {
        case "verified":
            return { label: "Verified", bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" };
        case "rejected":
            return { label: "Rejected", bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" };
        case "processing":
            return { label: "Processing", bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" };
        case "expired":
            return { label: "Expired", bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-400" };
        default:
            return { label: "Pending", bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" };
    }
}

function docTypeIcon(type: string): string {
    switch (type) {
        case "passport": return "🛂";
        case "driving_license": return "🚗";
        case "national_id": return "🪪";
        case "residence_permit": return "🏠";
        default: return "📄";
    }
}

// ── Animation Variants ────────────────────────────────────────

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// ── Component ─────────────────────────────────────────────────

export default function DocumentsPage() {
    const { token, isAuthenticated } = useWeb3();

    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Detail modal
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Download state
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Copied IPFS hash
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    // ── Fetch data ────────────────────────────────────────────

    const fetchDocuments = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await documentsApi.list(token);
            setDocuments(res.documents ?? []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load documents";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // ── Actions ───────────────────────────────────────────────

    const handleDelete = async () => {
        if (!deleteTarget || !token) return;
        setIsDeleting(true);
        try {
            await documentsApi.delete(deleteTarget.id, token);
            setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
            setDeleteTarget(null);
            if (selectedDoc?.id === deleteTarget.id) setSelectedDoc(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Delete failed";
            alert(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async (doc: DocumentItem) => {
        if (!token) return;
        setDownloadingId(doc.id);
        try {
            const blob = await documentsApi.download(doc.id, token);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.fileName || `document_${doc.id}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Download failed";
            alert(message);
        } finally {
            setDownloadingId(null);
        }
    };

    const copyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(hash);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    // ── Filtered documents ────────────────────────────────────

    const filtered = documents.filter((doc) => {
        if (filterStatus !== "all" && doc.status !== filterStatus) return false;
        if (filterType !== "all" && doc.documentType !== filterType) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                doc.fileName?.toLowerCase().includes(q) ||
                doc.documentType.toLowerCase().includes(q) ||
                doc.ipfsHash.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // ── Stats ─────────────────────────────────────────────────

    const stats = {
        total: documents.length,
        verified: documents.filter((d) => d.status === "verified").length,
        pending: documents.filter((d) => d.status === "pending").length,
        rejected: documents.filter((d) => d.status === "rejected").length,
    };

    // ── Auth guard ────────────────────────────────────────────

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
                        Connect and sign in with MetaMask to view your documents.
                    </p>
                    <Link href="/" className="btn-primary inline-block">Go to Home</Link>
                </motion.div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                            <span className="gradient-text">My Documents</span>
                        </h1>
                        <p className="text-white/50 text-sm sm:text-base">
                            View, download, and manage your uploaded identity documents
                        </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            href="/verify"
                            className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Upload New
                        </Link>
                    </motion.div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { label: "Total Documents", value: stats.total, color: "from-violet-500 to-purple-500", icon: "📁" },
                        { label: "Verified", value: stats.verified, color: "from-emerald-500 to-teal-500", icon: "✅" },
                        { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500", icon: "⏳" },
                        { label: "Rejected", value: stats.rejected, color: "from-red-500 to-pink-500", icon: "❌" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="feature-card cursor-default"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-base`}>
                                    {stat.icon}
                                </div>
                                <motion.span
                                    className="text-2xl sm:text-3xl font-bold"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + idx * 0.08 }}
                                >
                                    {loading ? "…" : stat.value}
                                </motion.span>
                            </div>
                            <div className="text-xs sm:text-sm text-white/50">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass-card p-4 rounded-xl sm:rounded-2xl mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by filename, type, or IPFS hash..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-2">
                            <FilterIcon />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Type filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="passport">Passport</option>
                            <option value="driving_license">Driving License</option>
                            <option value="national_id">National ID</option>
                            <option value="residence_permit">Residence Permit</option>
                        </select>
                    </div>
                </div>

                {/* Error state */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button
                            onClick={fetchDocuments}
                            className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </motion.div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-40 bg-white/5 rounded" />
                                        <div className="h-3 w-60 bg-white/5 rounded" />
                                    </div>
                                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-12 text-center"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl mb-4"
                        >
                            📂
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">
                            {documents.length === 0 ? "No Documents Yet" : "No Matching Documents"}
                        </h3>
                        <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                            {documents.length === 0
                                ? "Upload your first identity document to get started with verification."
                                : "Try adjusting your filters or search query."}
                        </p>
                        {documents.length === 0 && (
                            <Link href="/verify" className="btn-primary inline-flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Start Verification
                            </Link>
                        )}
                    </motion.div>
                )}

                {/* Document list */}
                {!loading && filtered.length > 0 && (
                    <div className="space-y-3">
                        {filtered.map((doc) => {
                            const st = statusConfig(doc.status);
                            return (
                                <div
                                    key={doc.id}
                                    className="glass-card rounded-xl p-4 sm:p-5 hover:border-violet-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: 8, scale: 1.1 }}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0"
                                        >
                                            {docTypeIcon(doc.documentType)}
                                        </motion.div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-semibold text-sm sm:text-base truncate">
                                                    {formatDocType(doc.documentType)}
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${st.bg} ${st.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                    {st.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                                                <span className="truncate max-w-[120px] sm:max-w-[200px]" title={doc.fileName}>
                                                    {doc.fileName || "Unnamed"}
                                                </span>
                                                <span>•</span>
                                                <span>{formatFileSize(doc.fileSize)}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="hidden sm:inline" title={new Date(doc.uploadedAt).toLocaleString()}>
                                                    {timeAgo(doc.uploadedAt)}
                                                </span>
                                            </div>
                                            {/* IPFS hash */}
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-xs text-white/25 font-mono truncate max-w-[160px] sm:max-w-[280px]" title={doc.ipfsHash}>
                                                    IPFS: {doc.ipfsHash}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); copyHash(doc.ipfsHash); }}
                                                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                                                    title="Copy IPFS hash"
                                                >
                                                    <CopyIcon />
                                                </button>
                                                {copiedHash === doc.ipfsHash && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="text-xs text-emerald-400"
                                                    >
                                                        Copied!
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                            {/* View details */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedDoc(doc)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 text-white/50 hover:text-violet-400 transition-all"
                                                title="View details"
                                            >
                                                <EyeIcon />
                                            </motion.button>

                                            {/* Download */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDownload(doc)}
                                                disabled={downloadingId === doc.id}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/50 hover:text-cyan-400 transition-all disabled:opacity-40"
                                                title="Download"
                                            >
                                                {downloadingId === doc.id ? (
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                ) : (
                                                    <DownloadIcon />
                                                )}
                                            </motion.button>

                                            {/* Delete */}
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setDeleteTarget(doc)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                                title="Delete"
                                            >
                                                <TrashIcon />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Confidence bar for verified docs */}
                                    {doc.aiConfidence !== null && doc.status === "verified" && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-white/40">AI Confidence</span>
                                                <span className="text-emerald-400 font-medium">{Math.round(doc.aiConfidence * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${doc.aiConfidence * 100}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Result count */}
                {!loading && documents.length > 0 && (
                    <motion.p
                        variants={itemVariants}
                        className="text-xs text-white/30 text-center mt-6"
                    >
                        Showing {filtered.length} of {documents.length} document{documents.length !== 1 ? "s" : ""}
                    </motion.p>
                )}
            </div>

            {/* ── Detail Modal ── */}
            <AnimatePresence>
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedDoc(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center text-xl">
                                        {docTypeIcon(selectedDoc.documentType)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{formatDocType(selectedDoc.documentType)}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig(selectedDoc.status).bg} ${statusConfig(selectedDoc.status).text}`}>
                                            {statusConfig(selectedDoc.status).label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            {/* Detail rows */}
                            <div className="space-y-4">
                                {[
                                    { label: "File Name", value: selectedDoc.fileName || "N/A" },
                                    { label: "File Size", value: formatFileSize(selectedDoc.fileSize) },
                                    { label: "MIME Type", value: selectedDoc.mimeType || "N/A" },
                                    { label: "Issuing Country", value: selectedDoc.issuingCountry || "Not specified" },
                                    { label: "Uploaded", value: new Date(selectedDoc.uploadedAt).toLocaleString() },
                                    { label: "Verified At", value: selectedDoc.verifiedAt ? new Date(selectedDoc.verifiedAt).toLocaleString() : "Not yet" },
                                    { label: "AI Confidence", value: selectedDoc.aiConfidence !== null ? `${Math.round(selectedDoc.aiConfidence * 100)}%` : "N/A" },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5">
                                        <span className="text-sm text-white/40">{row.label}</span>
                                        <span className="text-sm font-medium">{row.value}</span>
                                    </div>
                                ))}

                                {/* IPFS Hash */}
                                <div className="py-2 border-b border-white/5">
                                    <span className="text-sm text-white/40 block mb-1">IPFS Hash</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-lg font-mono break-all flex-1">
                                            {selectedDoc.ipfsHash}
                                        </code>
                                        <button
                                            onClick={() => copyHash(selectedDoc.ipfsHash)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                </div>

                                {/* IPFS URL */}
                                <div className="py-2 border-b border-white/5">
                                    <span className="text-sm text-white/40 block mb-1">IPFS Gateway URL</span>
                                    <a
                                        href={selectedDoc.ipfsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-violet-400 hover:text-violet-300 break-all transition-colors"
                                    >
                                        {selectedDoc.ipfsUrl}
                                    </a>
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDownload(selectedDoc)}
                                    disabled={downloadingId === selectedDoc.id}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-50"
                                >
                                    {downloadingId === selectedDoc.id ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <DownloadIcon />
                                            Download
                                        </>
                                    )}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setDeleteTarget(selectedDoc); }}
                                    className="px-5 py-2.5 rounded-full border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold"
                                >
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.6 }}
                                    className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4"
                                >
                                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                    </svg>
                                </motion.div>
                                <h3 className="text-lg font-bold mb-2">Delete Document?</h3>
                                <p className="text-sm text-white/50 mb-1">
                                    This will remove <strong className="text-white/80">{formatDocType(deleteTarget.documentType)}</strong> from your account.
                                </p>
                                <p className="text-xs text-white/30 mb-6">
                                    The file will be unpinned from IPFS and the record will be soft-deleted.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteTarget(null)}
                                        disabled={isDeleting}
                                        className="flex-1 btn-secondary text-sm py-2.5 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            "Delete Document"
                                        )}
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
