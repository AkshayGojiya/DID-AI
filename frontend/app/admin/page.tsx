"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { adminApi } from "@/lib/api";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────── */

interface Stats {
    totalVerifications: number;
    pendingReview: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    totalUsers: number;
    verifiedUsers: number;
    totalCredentials: number;
    totalDocuments: number;
}

interface ChartDay {
    _id: string;
    total: number;
    passed: number;
    failed: number;
    pending: number;
}

/* ── SVG Icons ─────────────────────────────────────────── */

const VerificationIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const PendingIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ApprovedIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RejectedIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);

const VerifiedUserIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const CredentialIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

/* ── Skeleton loader ───────────────────────────────────── */

function SkeletonCard() {
    return (
        <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="w-16 h-4 rounded skeleton" />
            </div>
            <div className="w-20 h-8 rounded skeleton mb-1" />
            <div className="w-24 h-3 rounded skeleton" />
        </div>
    );
}

/* ── Main component ────────────────────────────────────── */

export default function AdminDashboard() {
    const { token } = useWeb3();
    const [stats, setStats] = useState<Stats | null>(null);
    const [chart, setChart] = useState<ChartDay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        adminApi.getStats(token)
            .then((data: { stats: Stats; chart: ChartDay[] }) => {
                setStats(data.stats);
                setChart(data.chart || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div>
                <div className="mb-8">
                    <div className="w-40 h-7 rounded skeleton mb-2" />
                    <div className="w-64 h-4 rounded skeleton" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <svg className="w-12 h-12 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-white/40">Failed to load dashboard data</p>
            </div>
        );
    }

    const statCards = [
        { label: "Total Verifications", value: stats.totalVerifications, icon: <VerificationIcon />, gradient: "from-violet-500 to-purple-600", iconBg: "bg-violet-500/15 text-violet-400" },
        { label: "Pending Review",      value: stats.pendingReview,      icon: <PendingIcon />,      gradient: "from-amber-500 to-orange-600",  iconBg: "bg-amber-500/15 text-amber-400",  highlight: stats.pendingReview > 0 },
        { label: "Approved (Month)",     value: stats.approvedThisMonth,  icon: <ApprovedIcon />,     gradient: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/15 text-emerald-400" },
        { label: "Rejected (Month)",     value: stats.rejectedThisMonth,  icon: <RejectedIcon />,     gradient: "from-red-500 to-pink-600",      iconBg: "bg-red-500/15 text-red-400" },
        { label: "Total Users",          value: stats.totalUsers,         icon: <UsersIcon />,         gradient: "from-blue-500 to-cyan-600",     iconBg: "bg-blue-500/15 text-blue-400" },
        { label: "Verified Users",       value: stats.verifiedUsers,      icon: <VerifiedUserIcon />, gradient: "from-teal-500 to-emerald-600",  iconBg: "bg-teal-500/15 text-teal-400" },
        { label: "Active Credentials",   value: stats.totalCredentials,   icon: <CredentialIcon />,   gradient: "from-indigo-500 to-violet-600", iconBg: "bg-indigo-500/15 text-indigo-400" },
        { label: "Documents Stored",     value: stats.totalDocuments,     icon: <DocumentIcon />,     gradient: "from-pink-500 to-rose-600",     iconBg: "bg-pink-500/15 text-pink-400" },
    ];

    const chartMax = Math.max(...chart.map(d => d.total), 1);

    return (
        <div>
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                <p className="text-sm text-white/40">System overview and verification analytics</p>
            </motion.div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        className={`group glass-card p-5 rounded-2xl transition-all duration-300 hover:border-white/20 ${
                            card.highlight ? "ring-1 ring-amber-500/30" : ""
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                                {card.icon}
                            </div>
                            {card.highlight && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    Needs action
                                </span>
                            )}
                        </div>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent leading-none mb-1`}>
                            {card.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-white/40">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── Pending review CTA ── */}
            {stats.pendingReview > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mb-8"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 p-5">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />

                        <div className="relative flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                                    <PendingIcon />
                                </div>
                                <div>
                                    <p className="font-semibold text-amber-200">
                                        {stats.pendingReview} verification{stats.pendingReview !== 1 ? "s" : ""} awaiting review
                                    </p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        These scored between 70-90% and need your manual approval
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/admin/verifications?status=pending_review"
                                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                            >
                                Review Now
                                <ArrowRightIcon />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Chart ── */}
            {chart.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold">Verification Trend</h3>
                            <p className="text-xs text-white/40 mt-0.5">Last 7 days activity</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                Passed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                                Failed
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                                Pending
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {chart.map((day, i) => {
                            const barHeight = Math.max((day.total / chartMax) * 100, 8);
                            const passedPct = day.total > 0 ? (day.passed / day.total) * 100 : 0;
                            const failedPct = day.total > 0 ? (day.failed / day.total) * 100 : 0;

                            return (
                                <motion.div
                                    key={day._id}
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                                    style={{ transformOrigin: "bottom" }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    {/* Bar */}
                                    <div className="w-full flex flex-col items-center justify-end h-32">
                                        <div
                                            className="group relative w-full max-w-[40px] rounded-lg overflow-hidden cursor-default transition-all hover:scale-105"
                                            style={{ height: `${barHeight}%` }}
                                        >
                                            {/* Stacked bar segments */}
                                            <div className="absolute inset-0 flex flex-col-reverse">
                                                <div className="bg-emerald-500/80" style={{ height: `${passedPct}%` }} />
                                                <div className="bg-red-500/80" style={{ height: `${failedPct}%` }} />
                                                <div className="bg-amber-500/80 flex-1" />
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <span className="text-emerald-400">{day.passed}P</span>
                                                {" / "}
                                                <span className="text-red-400">{day.failed}F</span>
                                                {" / "}
                                                <span className="text-amber-400">{day.pending}W</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <span className="text-[11px] text-white/30 font-medium">
                                        {new Date(day._id).toLocaleDateString("en", { weekday: "short" })}
                                    </span>
                                    <span className="text-xs font-semibold text-white/60">{day.total}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
