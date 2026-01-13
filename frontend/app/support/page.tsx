"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const supportCategories = [
    {
        id: "getting-started",
        icon: "🚀",
        title: "Getting Started",
        description: "New to VerifyX? Start here",
        articles: [
            "How to connect your wallet",
            "Understanding decentralized identity",
            "First-time verification guide",
        ],
    },
    {
        id: "verification",
        icon: "✓",
        title: "Verification Issues",
        description: "Help with verification process",
        articles: [
            "Document upload troubleshooting",
            "Face verification not working",
            "Liveness check keeps failing",
        ],
    },
    {
        id: "credentials",
        icon: "🪪",
        title: "Credentials",
        description: "Managing your verified credentials",
        articles: [
            "How to share credentials",
            "Understanding selective disclosure",
            "Revoking a credential",
        ],
    },
    {
        id: "wallet",
        icon: "💼",
        title: "Wallet & Blockchain",
        description: "Web3 wallet and transaction help",
        articles: [
            "Connecting MetaMask",
            "Understanding gas fees",
            "Transaction failed",
        ],
    },
    {
        id: "security",
        icon: "🔒",
        title: "Security & Privacy",
        description: "Keeping your identity safe",
        articles: [
            "How is my data protected?",
            "Two-factor authentication",
            "Reporting suspicious activity",
        ],
    },
    {
        id: "billing",
        icon: "💳",
        title: "Billing & Subscriptions",
        description: "Payment and plan management",
        articles: [
            "Upgrading your plan",
            "Refund policy",
            "Canceling subscription",
        ],
    },
];

const popularArticles = [
    { title: "How to verify your identity", views: "12.5k views" },
    { title: "Connecting MetaMask wallet", views: "8.2k views" },
    { title: "Understanding credential sharing", views: "6.8k views" },
    { title: "Troubleshooting liveness check", views: "5.4k views" },
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="gradient-text">How can we help?</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                        Search our knowledge base or browse categories below
                    </p>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative max-w-xl mx-auto"
                    >
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-glass w-full pl-14 py-4 text-lg"
                        />
                        <svg
                            className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </motion.div>
                </motion.div>

                {/* Support Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {supportCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => setSelectedCategory(
                                    selectedCategory === category.id ? null : category.id
                                )}
                                className="glass-card-hover p-6 rounded-2xl cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl"
                                    >
                                        {category.icon}
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{category.title}</h3>
                                        <p className="text-sm text-white/50">{category.description}</p>
                                    </div>
                                </div>

                                {/* Expanded Articles */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: selectedCategory === category.id ? "auto" : 0,
                                        opacity: selectedCategory === category.id ? 1 : 0,
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                        {category.articles.map((article) => (
                                            <Link
                                                key={article}
                                                href="#"
                                                className="block p-2 hover:bg-white/5 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
                                            >
                                                {article}
                                            </Link>
                                        ))}
                                        <Link
                                            href="#"
                                            className="block text-sm text-violet-400 hover:underline pt-2"
                                        >
                                            View all articles →
                                        </Link>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Popular Articles */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-16"
                >
                    <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="grid md:grid-cols-2 gap-4">
                            {popularArticles.map((article, index) => (
                                <motion.a
                                    key={article.title}
                                    href="#"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-medium">{article.title}</span>
                                    <span className="text-sm text-white/40">{article.views}</span>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Contact Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-2 gap-8"
                >
                    <div className="glass-card p-8 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-2xl">
                                💬
                            </div>
                            <h3 className="text-xl font-semibold">Live Chat</h3>
                        </div>
                        <p className="text-white/60 mb-6">
                            Chat with our support team in real-time. Average response time: 2 minutes.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full"
                        >
                            Start Chat
                        </motion.button>
                    </div>

                    <div className="glass-card p-8 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl">
                                📧
                            </div>
                            <h3 className="text-xl font-semibold">Email Support</h3>
                        </div>
                        <p className="text-white/60 mb-6">
                            Send us an email and we'll get back to you within 24 hours.
                        </p>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href="/contact" className="btn-secondary w-full block text-center">
                                Contact Us
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Community */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
                    <p className="text-white/60 mb-6">
                        Connect with other users and get help from the community
                    </p>
                    <div className="flex justify-center gap-4">
                        <motion.a
                            href="https://discord.gg/verifyx"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-[#5865F2] rounded-xl font-medium flex items-center gap-2"
                        >
                            <span>Discord</span>
                        </motion.a>
                        <motion.a
                            href="https://twitter.com/verifyx"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-white/10 rounded-xl font-medium flex items-center gap-2"
                        >
                            <span>𝕏 Twitter</span>
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
