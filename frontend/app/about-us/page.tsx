"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const team = [
    { name: "Alex Chen", role: "CEO & Co-Founder", avatar: "👨‍💼", bio: "Former identity lead at Google" },
    { name: "Sarah Kim", role: "CTO & Co-Founder", avatar: "👩‍💻", bio: "Ex-Ethereum core developer" },
    { name: "Marcus Johnson", role: "Head of AI", avatar: "🧑‍🔬", bio: "PhD in Computer Vision from MIT" },
    { name: "Elena Rodriguez", role: "Head of Security", avatar: "👩‍🔒", bio: "Former security lead at Coinbase" },
];

const milestones = [
    { year: "2023", title: "Founded", description: "VerifyX was born from a vision of user-owned identity" },
    { year: "2023", title: "Seed Funding", description: "Raised $5M from top Web3 investors" },
    { year: "2024", title: "Beta Launch", description: "Launched beta with 10,000 early users" },
    { year: "2024", title: "Mainnet", description: "Full production launch on Ethereum mainnet" },
];

const values = [
    { icon: "🔐", title: "Privacy First", description: "Your data belongs to you. We never sell or share your information." },
    { icon: "🌍", title: "Decentralization", description: "No single point of failure. Your identity exists on the blockchain." },
    { icon: "🤝", title: "Trust", description: "Building trust through transparency and open-source code." },
    { icon: "⚡", title: "Innovation", description: "Pushing the boundaries of identity technology." },
];

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <div ref={containerRef} className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-32 px-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        <span className="text-sm text-white/70">Building the future of identity</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8">
                        <span className="gradient-text-animated">About VerifyX</span>
                    </h1>

                    <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to give everyone control over their digital identity.
                        No more repeated KYC. No more data breaches. Just secure, user-owned identity.
                    </p>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                    style={{ y }}
                    className="absolute top-20 right-[10%] w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 animate-float"
                />
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
                    className="absolute bottom-20 left-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-white/10 animate-float-delayed"
                />
            </section>

            {/* Mission Section */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid lg:grid-cols-2 gap-16 items-center"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                <span className="gradient-text">Our Mission</span>
                            </h2>
                            <p className="text-white/60 text-lg leading-relaxed mb-6">
                                Traditional identity systems are broken. Your data is scattered across
                                countless databases, vulnerable to breaches, and controlled by corporations.
                            </p>
                            <p className="text-white/60 text-lg leading-relaxed mb-8">
                                We believe in a world where you are the sole owner of your identity.
                                Where verification is instant, privacy is guaranteed, and trust is
                                built on cryptographic proofs—not corporate promises.
                            </p>
                            <Link href="/verify" className="btn-glow inline-flex items-center gap-2">
                                Get Started
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="glass-card rounded-3xl p-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: "100K+", label: "Users Verified" },
                                        { value: "500K+", label: "Credentials Issued" },
                                        { value: "99.9%", label: "Uptime" },
                                        { value: "0", label: "Data Breaches" },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="text-center p-4"
                                        >
                                            <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                            <div className="text-sm text-white/50">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="gradient-text">Our Values</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card-hover p-6 rounded-2xl text-center"
                            >
                                <div className="text-4xl mb-4">{value.icon}</div>
                                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-white/50">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="gradient-text">Our Journey</span>
                        </h2>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-cyan-500 to-violet-500" />

                        {milestones.map((milestone, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className={`relative flex items-center gap-8 mb-12 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                                    }`}
                            >
                                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                                    <div className="inline-block glass-card p-6 rounded-2xl">
                                        <span className="text-sm text-violet-400 font-medium">{milestone.year}</span>
                                        <h3 className="text-xl font-semibold mt-1 mb-2">{milestone.title}</h3>
                                        <p className="text-sm text-white/50">{milestone.description}</p>
                                    </div>
                                </div>

                                {/* Center dot */}
                                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-4 border-[#030014] z-10" />

                                <div className="flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="gradient-text">Meet the Team</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            World-class experts building the future of identity
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, i) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card-hover p-6 rounded-2xl text-center group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-4xl"
                                >
                                    {member.avatar}
                                </motion.div>
                                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                                <p className="text-sm text-violet-400 mb-2">{member.role}</p>
                                <p className="text-xs text-white/40">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="glass-card p-12 md:p-16 rounded-3xl text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Want to Join Us?
                            </h2>
                            <p className="text-white/60 mb-8 max-w-xl mx-auto">
                                We're always looking for talented people who share our vision.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/careers" className="btn-primary">
                                    View Open Positions
                                </Link>
                                <Link href="/contact" className="btn-secondary">
                                    Get in Touch
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
