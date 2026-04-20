"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { adminApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

/* ── Animated circular gauge ───────────────────────────── */

function CircularGauge({
    value,
    label,
    weight,
    size = 96,
    passed,
}: {
    value: number | null;
    label: string;
    weight: string;
    size?: number;
    passed?: boolean | null;
}) {
    const pct = value != null ? Math.round(value * 100) : 0;
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (pct / 100) * circumference;
    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
                    />
                    <motion.circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold" style={{ color }}>{pct}%</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[10px] text-white/30">{weight}</p>
            </div>
            {passed != null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                    {passed ? "Passed" : "Failed"}
                </span>
            )}
        </div>
    );
}

/* ── Confidence bar ────────────────────────────────────── */

function ConfidenceBar({ value, label }: { value: number | null; label: string }) {
    const pct = value != null ? Math.round(value * 100) : 0;
    const color = pct >= 75 ? "from-emerald-500 to-emerald-400"
                : pct >= 50 ? "from-amber-500 to-amber-400"
                :             "from-red-500 to-red-400";
    return (
        <div>
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">{label}</span>
                <span className="font-mono font-semibold">{pct}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`h-1.5 rounded-full bg-gradient-to-r ${color}`}
                />
            </div>
        </div>
    );
}

/* ── Info row ──────────────────────────────────────────── */

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-xs text-white/40">{label}</span>
            <span className={`text-sm ${mono ? "font-mono text-xs" : ""} text-white/80 truncate ml-4 max-w-[60%] text-right`}>
                {value || "\u2014"}
            </span>
        </div>
    );
}

/* ── Skeleton ──────────────────────────────────────────── */

function DetailSkeleton() {
    return (
        <div className="max-w-5xl">
            <div className="w-32 h-4 rounded skeleton mb-6" />
            <div className="glass-card p-6 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="w-48 h-6 rounded skeleton mb-2" />
                        <div className="w-32 h-3 rounded skeleton" />
                    </div>
                    <div className="w-20 h-8 rounded-full skeleton" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className="w-16 h-3 rounded skeleton mb-1" />
                            <div className="w-24 h-4 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl h-64 skeleton" />
                <div className="glass-card p-6 rounded-2xl h-64 skeleton" />
            </div>
        </div>
    );
}

/* ── Main component ────────────────────────────────────── */

export default function AdminVerificationDetailPage() {
    const { token } = useWeb3();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!token || !id) return;
        adminApi.getVerification(id, token)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((res: { verification: any }) => setData(res.verification))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token, id]);

    const handleApprove = async () => {
        if (!token) return;
        setActionLoading(true);
        setActionResult(null);
        try {
            await adminApi.approveVerification(id, token);
            setActionResult({ type: "success", message: "Verification approved and credential issued successfully." });
            const res = await adminApi.getVerification(id, token);
            setData(res.verification);
        } catch (err: unknown) {
            setActionResult({ type: "error", message: err instanceof Error ? err.message : "Failed to approve" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!token || !rejectReason.trim()) return;
        setActionLoading(true);
        setActionResult(null);
        try {
            await adminApi.rejectVerification(id, rejectReason.trim(), token);
            setActionResult({ type: "success", message: "Verification rejected." });
            setShowRejectForm(false);
            const res = await adminApi.getVerification(id, token);
            setData(res.verification);
        } catch (err: unknown) {
            setActionResult({ type: "error", message: err instanceof Error ? err.message : "Failed to reject" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <DetailSkeleton />;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <svg className="w-12 h-12 text-red-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-white/40 text-sm">Verification not found</p>
                <button
                    onClick={() => router.push("/admin/verifications")}
                    className="text-xs text-violet-400 hover:text-violet-300"
                >
                    Back to list
                </button>
            </div>
        );
    }

    const v = data;
    const isPending = v.status === "pending_review";
    const isApproved = v.result === "passed";
    const isRejected = v.result === "failed" && v.status === "completed";
    const overallPct = v.confidence != null ? Math.round(v.confidence * 100) : null;

    const REJECTION_PRESETS = [
        "Document image too blurry or low quality",
        "Face does not match document photo",
        "Document appears to be fake or altered",
        "Liveness check not convincing",
        "Document is expired",
        "Unable to extract data from document",
    ];

    return (
        <div className="max-w-5xl">
            {/* ── Back button ── */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push("/admin/verifications")}
                className="group flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Verifications
            </motion.button>

            {/* ── Header card ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl mb-6 overflow-hidden"
            >
                {/* Status gradient bar */}
                <div className={`h-1 ${
                    isPending ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                    isApproved ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                    "bg-gradient-to-r from-red-500 to-pink-500"
                }`} />

                <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold">Verification Review</h2>
                                {isPending && (
                                    <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        Pending Review
                                    </span>
                                )}
                                {isApproved && (
                                    <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Approved
                                    </span>
                                )}
                                {isRejected && (
                                    <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Rejected
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/30 font-mono">{v.verificationId}</p>
                        </div>

                        {/* Overall score */}
                        {overallPct !== null && (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs text-white/40">Overall Score</p>
                                    <p className={`text-3xl font-bold font-mono ${
                                        overallPct >= 90 ? "text-emerald-400" :
                                        overallPct >= 70 ? "text-amber-400" : "text-red-400"
                                    }`}>
                                        {overallPct}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User info grid */}
                    {v.user && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Wallet", value: v.user.walletAddress, mono: true },
                                { label: "DID", value: v.user.did, mono: true },
                                { label: "Name", value: v.user.displayName },
                                { label: "Submitted", value: new Date(v.createdAt).toLocaleString() },
                            ].map((item) => (
                                <div key={item.label} className="bg-white/[0.03] rounded-xl px-3 py-2.5">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{item.label}</p>
                                    <p className={`text-sm truncate ${item.mono ? "font-mono text-xs" : ""}`}>
                                        {item.value || "\u2014"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── AI Results + Document info ── */}
            <div className="grid lg:grid-cols-5 gap-6 mb-6">

                {/* AI Results (wider) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-3 glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                        <h3 className="font-semibold">AI Analysis Results</h3>
                    </div>

                    {/* Circular gauges */}
                    <div className="flex items-start justify-around gap-4 mb-6 flex-wrap">
                        <CircularGauge
                            value={v.aiResults?.faceMatch?.confidence}
                            label="Face Match"
                            weight="40% weight"
                            passed={v.aiResults?.faceMatch?.passed}
                        />
                        <CircularGauge
                            value={v.aiResults?.liveness?.confidence}
                            label="Liveness"
                            weight="35% weight"
                            passed={v.aiResults?.liveness?.passed}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                    v.aiResults?.ocr?.passed ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                                }`}>
                                    <svg className={`w-8 h-8 ${v.aiResults?.ocr?.passed ? "text-emerald-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">OCR</p>
                                <p className="text-[10px] text-white/30">25% weight</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                v.aiResults?.ocr?.passed
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                                {v.aiResults?.ocr?.passed ? "Extracted" : "Failed"}
                            </span>
                        </div>
                    </div>

                    {/* Detail bars */}
                    <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        {v.aiResults?.ocr?.confidenceScores && (
                            <>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">OCR Confidence Breakdown</p>
                                {Object.entries(v.aiResults.ocr.confidenceScores)
                                    .filter(([, val]) => val != null)
                                    .map(([key, val]) => (
                                        <ConfidenceBar
                                            key={key}
                                            label={key.replace(/([A-Z])/g, " $1").trim()}
                                            value={val as number}
                                        />
                                    ))}
                            </>
                        )}

                        <div className="flex flex-wrap gap-3 pt-3 text-[11px] text-white/40">
                            <span>Model: {v.aiResults?.faceMatch?.model || "ArcFace"}</span>
                            <span className="text-white/10">|</span>
                            <span>Real face: {v.aiResults?.liveness?.isRealFace ? "Yes" : "No"}</span>
                            <span className="text-white/10">|</span>
                            <span>MRZ valid: {v.aiResults?.ocr?.mrzValid ? "Yes" : "None"}</span>
                            <span className="text-white/10">|</span>
                            <span>Doc valid: {v.aiResults?.ocr?.documentValid ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Document info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-2 mb-5">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <h3 className="font-semibold">Document</h3>
                    </div>

                    {v.document ? (
                        <div>
                            <InfoRow label="Type" value={v.document.documentType?.replace("_", " ")} />
                            <InfoRow label="File" value={v.document.fileName} />
                            <InfoRow label="Size" value={v.document.fileSize ? `${(v.document.fileSize / 1024).toFixed(1)} KB` : null} />
                            <InfoRow label="IPFS Hash" value={v.document.ipfsHash?.slice(0, 24) + "..."} mono />

                            {/* Extracted data */}
                            {v.document.extractedData && Object.values(v.document.extractedData).some((val: unknown) => val) && (
                                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Extracted Data</p>
                                    {Object.entries(v.document.extractedData)
                                        .filter(([, val]) => val)
                                        .map(([key, val]) => (
                                            <div key={key} className="flex justify-between items-center py-1.5 text-xs">
                                                <span className="text-white/40 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                                <span className="font-mono text-white/70">{String(val)}</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <p className="text-xs text-white/30">Document data unavailable</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ── Action result banner ── */}
            {actionResult && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                        actionResult.type === "success"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-red-500/5 border-red-500/20"
                    }`}
                >
                    {actionResult.type === "success" ? (
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    )}
                    <p className={`text-sm ${actionResult.type === "success" ? "text-emerald-300" : "text-red-300"}`}>
                        {actionResult.message}
                    </p>
                </motion.div>
            )}

            {/* ── Action panel (pending_review only) ── */}
            {isPending && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl overflow-hidden mb-6"
                >
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                            </svg>
                            <h3 className="font-semibold">Decision</h3>
                        </div>

                        {!showRejectForm ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="group flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <div className="w-4 h-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    )}
                                    {actionLoading ? "Processing..." : "Approve & Issue Credential"}
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="block text-xs text-white/40 mb-2">Rejection Reason</label>

                                {/* Preset reason chips */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {REJECTION_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setRejectReason(preset)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                                rejectReason === preset
                                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                                    : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/20"
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Or type a custom reason..."
                                    rows={2}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-violet-500/30 resize-none placeholder:text-white/20"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading || !rejectReason.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-all disabled:opacity-30 text-sm"
                                    >
                                        {actionLoading ? (
                                            <div className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                        {actionLoading ? "Processing..." : "Confirm Rejection"}
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                                        className="px-6 py-3 rounded-xl border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Errors / Notes ── */}
            {v.errors?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <h3 className="font-semibold text-red-400">Errors & Notes</h3>
                    </div>
                    <div className="space-y-2">
                        {v.errors.map((err: { step: string; message: string; timestamp: string }, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-sm">
                                <span className="text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">
                                    {err.step}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-red-300/80 text-xs">{err.message}</p>
                                    <p className="text-[10px] text-white/20 mt-1">
                                        {new Date(err.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
