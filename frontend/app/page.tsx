"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Icons as components
const ShieldIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const FingerprintIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
);

const BlockchainIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const QRCodeIcon = () => (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const features = [
    {
        icon: <ShieldIcon />,
        title: "AI-Powered Verification",
        description: "Advanced face recognition and liveness detection to ensure authentic identity verification.",
        gradient: "from-violet-500 to-purple-500",
    },
    {
        icon: <BlockchainIcon />,
        title: "Blockchain Secured",
        description: "Immutable credential storage on blockchain. Your identity proof is tamper-proof and permanent.",
        gradient: "from-cyan-500 to-blue-500",
    },
    {
        icon: <FingerprintIcon />,
        title: "Self-Sovereign Identity",
        description: "You own and control your identity. No centralized database, no data exploitation.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: <LockIcon />,
        title: "Privacy First",
        description: "Zero personal data stored on-chain. End-to-end encryption for all your documents.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: <SparklesIcon />,
        title: "Smart OCR",
        description: "Automatic extraction of document data using advanced OCR technology.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: <QRCodeIcon />,
        title: "Instant Sharing",
        description: "Share verified credentials via QR codes. Selective disclosure of your identity attributes.",
        gradient: "from-violet-500 to-indigo-500",
    },
];

const stats = [
    { value: "99.9%", label: "Verification Accuracy" },
    { value: "<2s", label: "Verification Time" },
    { value: "100%", label: "User Controlled" },
    { value: "0", label: "Data Breaches" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 px-4 sm:px-6">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </div>

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
                    className="max-w-7xl mx-auto text-center relative z-10"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                    >
                        <motion.span
                            className="w-2 h-2 rounded-full bg-emerald-400"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm text-white/70">Powered by AI & Blockchain</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 sm:mb-8 px-2"
                    >
                        <span className="block">Your Identity,</span>
                        <span className="gradient-text-animated">Your Control</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4"
                    >
                        Revolutionary decentralized identity verification powered by cutting-edge AI
                        and secured by blockchain technology. Own your identity. Share with confidence.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-14 md:mb-16"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="/verify" className="btn-glow flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto justify-center">
                                Start Verification
                                <ArrowRightIcon />
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="#how-it-works" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
                                Learn More
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto px-4"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="text-center"
                            >
                                <motion.div
                                    className="stat-number"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-sm text-white/40">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {/* <span className="text-xs text-white/40 uppercase tracking-widest">Scroll</span> */}
                    <div className="relative flex flex-col items-center">
                        {[0, 1, 2].map((i) => (
                            <motion.svg
                                key={i}
                                className="w-5 h-5 text-violet-400/60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{
                                    y: [0, 6, 0],
                                    opacity: [0.2, 1, 0.2],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                style={{ marginTop: i === 0 ? 0 : -8 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16 md:mb-20"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                            <span className="gradient-text">Powerful Features</span>
                        </h2>
                        <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Built with the latest technologies to provide secure, fast, and user-friendly
                            identity verification.
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="feature-card group cursor-pointer"
                            >
                                {/* Icon */}
                                <motion.div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {feature.icon}
                                </motion.div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-3 group-hover:text-violet-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16 md:mb-20"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                            <span className="gradient-text">How It Works</span>
                        </h2>
                        <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto px-4">
                            Simple, secure, and seamless identity verification in just a few steps.
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { step: "01", title: "Connect Wallet", desc: "Link your MetaMask or any Web3 wallet to get started", icon: "🔗" },
                            { step: "02", title: "Upload Documents", desc: "Securely upload your identity documents for verification", icon: "📄" },
                            { step: "03", title: "AI Verification", desc: "Our AI verifies your face and documents in real-time", icon: "🤖" },
                            { step: "04", title: "Get Verified", desc: "Receive blockchain-backed credentials you fully control", icon: "✓" },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative group"
                            >
                                {/* Connection Line */}
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent" />
                                )}

                                <motion.div
                                    className="glass-card p-6 rounded-2xl text-center group-hover:border-violet-500/30 transition-all duration-300"
                                    whileHover={{ y: -5 }}
                                >
                                    <motion.div
                                        className="text-4xl mb-4"
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                    <div className="text-3xl font-bold gradient-text mb-2">{item.step}</div>
                                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                    <p className="text-white/40 text-sm">{item.desc}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="glass-card p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl text-center relative overflow-hidden">
                        {/* Background Glow */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />

                        <div className="relative z-10">
                            <motion.h2
                                className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 px-2"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Ready to Take Control of <br className="hidden sm:block" />
                                <span className="gradient-text-animated">Your Digital Identity?</span>
                            </motion.h2>
                            <motion.p
                                className="text-white/50 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto px-4"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                Join thousands of users who trust VerifyX for secure,
                                decentralized identity verification.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/verify" className="btn-glow inline-flex items-center gap-2 text-lg px-8 py-4">
                                    Get Started Free
                                    <ArrowRightIcon />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
