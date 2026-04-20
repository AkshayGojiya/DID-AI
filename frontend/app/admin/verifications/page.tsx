"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { adminApi } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* ── Types ─────────────────────────────────────────────── */

interface VerificationItem {
    id: string;
    verificationId: string;
    status: string;
    result: string;
    confidence: number | null;
    user: { id: string; walletAddress: string; displayName: string | null } | null;
    document: { id: string; type: string; fileName: string | null; status: string } | null;
    aiResults: { faceMatch: number | null; liveness: number | null; ocrPassed: boolean | null };
    credential: { issued: boolean };
    createdAt: string;
}

/* ── Badge config ──────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
    pending_review: { label: "Pending Review", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
    completed:      { label: "Completed",      cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
    in_progress:    { label: "In Progress",    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
    failed:         { label: "Failed",         cls: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
    initiated:      { label: "Initiated",      cls: "bg-gray-500/10 text-gray-400 border-gray-500/20", dot: "bg-gray-400" },
};

const RESULT_CONFIG: Record<string, { label: string; cls: string }> = {
    passed:  { label: "Passed",  cls: "text-emerald-400" },
    failed:  { label: "Failed",  cls: "text-red-400" },
    pending: { label: "Pending", cls: "text-amber-400" },
};

/* ── Document type icons (SVG) ─────────────────────────── */

function DocTypeIcon({ type }: { type?: string }) {
    if (type === "passport") return (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    );
    if (type === "driving_license") return (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    );
    return (
        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
    );
}

/* ── Skeleton loader ───────────────────────────────────── */

function SkeletonRow() {
    return (
        <div className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="w-32 h-4 rounded skeleton mb-2" />
                    <div className="w-48 h-3 rounded skeleton" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-12 h-6 rounded-full skeleton" />
                <div className="w-20 h-6 rounded-full skeleton" />
            </div>
        </div>
    );
}

/* ── Filter pills ──────────────────────────────────────── */

const FILTERS = [
    { value: "",               label: "All",            icon: null },
    { value: "pending_review", label: "Pending Review", icon: "amber" },
    { value: "completed",      label: "Completed",      icon: "emerald" },
    { value: "in_progress",    label: "In Progress",    icon: "blue" },
    { value: "failed",         label: "Failed",         icon: "red" },
];

/* ── Main component ────────────────────────────────────── */

export default function AdminVerificationsPage() {
    const { token } = useWeb3();
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get("status") || "";

    const [verifications, setVerifications] = useState<VerificationItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [loading, setLoading] = useState(true);

    const fetchData = (p: number, status: string) => {
        if (!token) return;
        setLoading(true);
        adminApi.listVerifications(token, { status: status || undefined, page: p, limit: 15 })
            .then((data: { verifications: VerificationItem[]; total: number; totalPages: number }) => {
                setVerifications(data.verifications || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData(page, statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, statusFilter]);

    return (
        <div>
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold mb-1">Verifications</h1>
                <p className="text-sm text-white/40">Review and manage identity verification requests</p>
            </motion.div>

            {/* ── Filters ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-6 flex-wrap gap-3"
            >
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {FILTERS.map((f) => {
                        const isActive = statusFilter === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                                    isActive
                                        ? "bg-white/[0.08] text-white border-white/[0.12]"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border-transparent"
                                }`}
                            >
                                {f.icon && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        f.icon === "amber" ? "bg-amber-400" :
                                        f.icon === "emerald" ? "bg-emerald-400" :
                                        f.icon === "blue" ? "bg-blue-400" : "bg-red-400"
                                    }`} />
                                )}
                                {f.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                    {total} total
                </div>
            </motion.div>

            {/* ── Verification list ── */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : verifications.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-4"
                >
                    <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-white/30 text-sm">No verifications found</p>
                    {statusFilter && (
                        <button
                            onClick={() => { setStatusFilter(""); setPage(1); }}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-2">
                    {verifications.map((v, i) => {
                        const statusBadge = STATUS_CONFIG[v.status] || { label: v.status, cls: "bg-gray-500/10 text-gray-400 border-gray-500/20", dot: "bg-gray-400" };
                        const resultBadge = RESULT_CONFIG[v.result] || { label: v.result, cls: "text-gray-400" };
                        const score = v.confidence != null ? Math.round(v.confidence * 100) : null;
                        const isPending = v.status === "pending_review";

                        return (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.025, duration: 0.3 }}
                            >
                                <Link
                                    href={`/admin/verifications/${v.id}`}
                                    className={`group block glass-card p-4 rounded-xl transition-all duration-200 hover:border-white/20 ${
                                        isPending ? "border-amber-500/10 hover:border-amber-500/30" : ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: icon + info */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                isPending ? "bg-amber-500/10" : "bg-white/[0.06]"
                                            }`}>
                                                <DocTypeIcon type={v.document?.type} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-medium truncate">
                                                        {v.user?.displayName || (v.user?.walletAddress ? `${v.user.walletAddress.slice(0, 8)}...${v.user.walletAddress.slice(-4)}` : "Unknown")}
                                                    </p>
                                                    {v.credential?.issued && (
                                                        <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/30">
                                                    <span className="capitalize">{v.document?.type?.replace("_", " ") || "Document"}</span>
                                                    <span className="mx-1.5 text-white/10">|</span>
                                                    {new Date(v.createdAt).toLocaleDateString("en", {
                                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: score + badges */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {/* Score gauge */}
                                            {score !== null && (
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <div className="relative w-9 h-9">
                                                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                                                            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                                                            <circle
                                                                cx="18" cy="18" r="15" fill="none"
                                                                stroke={score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"}
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                                strokeDasharray={`${score * 0.942} 100`}
                                                            />
                                                        </svg>
                                                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
                                                            score >= 90 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-red-400"
                                                        }`}>
                                                            {score}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status badge */}
                                            <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium border ${statusBadge.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} ${isPending ? "animate-pulse" : ""}`} />
                                                {statusBadge.label}
                                            </span>

                                            {/* Result */}
                                            <span className={`hidden md:inline text-[11px] font-medium ${resultBadge.cls}`}>
                                                {resultBadge.label}
                                            </span>

                                            {/* Chevron */}
                                            <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 mt-8"
                >
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Prev
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                        page === pageNum
                                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                            : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && (
                            <>
                                <span className="text-white/20 px-1">...</span>
                                <button
                                    onClick={() => setPage(totalPages)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                        page === totalPages
                                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                                            : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                                    }`}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
