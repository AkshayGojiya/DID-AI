"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/verify", label: "Verify" },
    { href: "/credentials", label: "Credentials" },
    { href: "/scan", label: "Scan QR" },
    { href: "/activity", label: "Activity" },
    { href: "/settings", label: "Settings" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get Web3 context
    const { address, isConnected, isConnecting, connectWallet, disconnectWallet, error } = useWeb3();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Format wallet address for display
    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-50 w-full max-w-full transition-all duration-500 ${isScrolled ? "glass-nav shadow-lg shadow-black/20" : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-6 py-3 sm:py-4 w-full">
                    <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
                            <motion.div
                                whileHover={{ rotate: 12, scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center relative overflow-hidden"
                            >
                                <span className="text-white font-bold text-base sm:text-lg relative z-10">V</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            </motion.div>
                            <span className="text-lg sm:text-xl font-bold gradient-text-animated">VerifyX</span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === link.href
                                        ? "text-white"
                                        : "text-white/60 hover:text-white"
                                        }`}
                                >
                                    {pathname === link.href && (
                                        <motion.div
                                            layoutId="navbar-active"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                            {/* Wallet Address Display */}
                            {isConnected && address && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs sm:text-sm text-white/80 whitespace-nowrap">
                                        {formatAddress(address)}
                                    </span>
                                </div>
                            )}

                            {/* Connect/Disconnect Wallet Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isConnected ? disconnectWallet : connectWallet}
                                disabled={isConnecting}
                                className={`hidden md:flex items-center gap-2 text-xs sm:text-sm py-2 px-4 sm:px-5 whitespace-nowrap ${isConnected ? 'btn-secondary' : 'btn-primary'
                                    } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isConnecting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Connecting...
                                    </>
                                ) : isConnected ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Disconnect
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                        Connect Wallet
                                    </>
                                )}
                            </motion.button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 mx-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200"
                    >
                        {error}
                    </motion.div>
                )}
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-0 right-0 top-[56px] sm:top-[64px] z-40 lg:hidden w-full max-w-full overflow-hidden"
                    >
                        <div className="mx-4 sm:mx-4 p-4 sm:p-4 glass-card bg-black/40 backdrop-blur rounded-xl sm:rounded-2xl max-h-[calc(100vh-80px)] overflow-y-auto">
                            <div className="flex flex-col gap-2">
                                {/* Wallet Status (Mobile) */}
                                {isConnected && address && (
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-sm text-white/80">{formatAddress(address)}</span>
                                        </div>
                                    </div>
                                )}

                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`block px-4 py-3 rounded-xl transition-colors ${pathname === link.href
                                                ? "bg-white/10 text-white"
                                                : "text-white/60 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}

                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navLinks.length * 0.05 }}
                                    onClick={isConnected ? disconnectWallet : connectWallet}
                                    disabled={isConnecting}
                                    className={`mt-2 text-center text-sm sm:text-base py-2.5 sm:py-3 ${isConnected ? 'btn-secondary' : 'btn-primary'
                                        } ${isConnecting ? 'opacity-50' : ''}`}
                                >
                                    {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
