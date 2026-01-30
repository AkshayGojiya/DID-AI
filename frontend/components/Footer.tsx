"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "/#features" },
            { label: "How it Works", href: "/#how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "Security", href: "/security" },
        ],
        resources: [
            { label: "Documentation", href: "/docs" },
            { label: "API Reference", href: "/docs/api" },
            { label: "Tutorials", href: "/docs/tutorials" },
            { label: "Support", href: "/support" },
        ],
        company: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Careers", href: "/careers" },
            { label: "Contact", href: "/contact" },
        ],
        legal: [
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Cookies", href: "/cookies" },
        ],
    };

    const socialLinks = [
        { label: "Twitter", href: "https://twitter.com/verifyx", icon: "𝕏" },
        { label: "Discord", href: "https://discord.gg/verifyx", icon: "D" },
        { label: "GitHub", href: "https://github.com/verifyx", icon: "G" },
    ];

    return (
        <footer className="relative pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 border-t border-white/5">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-3 md:col-span-1 mb-4 sm:mb-0">
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                <span className="text-white font-bold text-base sm:text-lg">V</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold gradient-text">VerifyX</span>
                        </Link>
                        <p className="text-xs sm:text-sm text-white/50 mb-4 sm:mb-6 max-w-xs">
                            Decentralized identity verification for the modern web. Secure, private, user-owned.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-2 sm:gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-violet-500/50 transition-colors text-sm sm:text-base"
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-white">Product</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-white">Resources</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="hidden sm:block">
                        <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-white">Company</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="hidden sm:block">
                        <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4 text-white">Legal</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Mobile only: Company & Legal combined */}
                <div className="grid grid-cols-2 gap-6 mb-8 sm:hidden">
                    <div>
                        <h4 className="font-semibold text-xs mb-3 text-white">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs mb-3 text-white">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-xs text-white/50 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-white/40 text-center md:text-left">
                        &copy; {currentYear} VerifyX. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
