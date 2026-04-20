"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";

/* ── SVG Icons ─────────────────────────────────────────── */

const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
);

const VerifyIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-16 h-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/admin/verifications", label: "Verifications", icon: <VerifyIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { token, isAuthenticated, address } = useWeb3();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setIsAdmin(false);
            return;
        }
        authApi.me(token)
            .then((data: { user?: { role?: string } }) => {
                setIsAdmin(data.user?.role === "admin");
            })
            .catch(() => setIsAdmin(false));
    }, [isAuthenticated, token]);

    /* ── Loading state ───────── */
    if (isAdmin === null) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-sm text-white/40">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    /* ── Access denied ───────── */
    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-card p-12 rounded-3xl max-w-md relative overflow-hidden"
                >
                    {/* Decorative glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex justify-center mb-6">
                            <LockIcon />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Admin Access Required</h2>
                        <p className="text-white/50 mb-8 text-sm leading-relaxed">
                            You don&apos;t have admin permissions. Please connect with an authorized admin wallet to access this panel.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="btn-primary text-sm px-6 py-3"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ── Admin panel layout ───────── */
    return (
        <div className="min-h-screen pt-[72px]">
            <div className="flex">
                {/* ── Desktop Sidebar ── */}
                <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-72px)] border-r border-white/[0.06] bg-[#030014]/50 backdrop-blur-xl sticky top-[72px] self-start">
                    {/* Brand */}
                    <div className="px-5 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                <ShieldIcon />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-wide">Admin Panel</h1>
                                <p className="text-[10px] text-white/30 font-mono">
                                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Nav links */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {adminLinks.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href !== "/admin" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                                        isActive
                                            ? "text-white bg-white/[0.08]"
                                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="admin-sidebar-active"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                        />
                                    )}
                                    <span className={`transition-colors ${isActive ? "text-violet-400" : "text-white/40 group-hover:text-white/60"}`}>
                                        {link.icon}
                                    </span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer badge */}
                    <div className="px-5 pb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs text-white/60">System Online</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Mobile top bar ── */}
                <div className="lg:hidden fixed top-[72px] left-0 right-0 z-30 bg-[#030014]/90 backdrop-blur-xl border-b border-white/[0.06]">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold">Admin</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile dropdown nav */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden border-t border-white/[0.06]"
                            >
                                <div className="px-4 py-3 space-y-1">
                                    {adminLinks.map((link) => {
                                        const isActive = pathname === link.href ||
                                            (link.href !== "/admin" && pathname.startsWith(link.href));
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                                    isActive
                                                        ? "text-white bg-white/[0.08]"
                                                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                                                }`}
                                            >
                                                <span className={isActive ? "text-violet-400" : "text-white/40"}>
                                                    {link.icon}
                                                </span>
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Main content area ── */}
                <main className="flex-1 min-h-[calc(100vh-72px)] lg:mt-0 mt-[56px]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
