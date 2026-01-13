"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="gradient-text">Get in Touch</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        Have questions about VerifyX? We'd love to hear from you.
                        Send us a message and we'll respond as soon as possible.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-12 rounded-3xl text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl"
                                >
                                    ✓
                                </motion.div>
                                <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
                                <p className="text-white/60 mb-8">
                                    Thank you for reaching out. We'll get back to you within 24 hours.
                                </p>
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: "", email: "", subject: "", message: "" });
                                    }}
                                    className="btn-secondary"
                                >
                                    Send Another Message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl">
                                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-glass"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-glass"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Subject
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="input-glass"
                                            required
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="support">Technical Support</option>
                                            <option value="sales">Sales & Pricing</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="input-glass min-h-[150px] resize-none"
                                            placeholder="Tell us how we can help..."
                                            required
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full btn-glow disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="spinner" />
                                                Sending...
                                            </span>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        )}
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass-card p-8 rounded-3xl">
                            <h2 className="text-2xl font-bold mb-6">Other Ways to Reach Us</h2>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: "📧",
                                        title: "Email",
                                        value: "hello@verifyx.io",
                                        link: "mailto:hello@verifyx.io",
                                    },
                                    {
                                        icon: "💬",
                                        title: "Discord",
                                        value: "Join our community",
                                        link: "https://discord.gg/verifyx",
                                    },
                                    {
                                        icon: "𝕏",
                                        title: "Twitter",
                                        value: "@VerifyX",
                                        link: "https://twitter.com/verifyx",
                                    },
                                    {
                                        icon: "📍",
                                        title: "Location",
                                        value: "San Francisco, CA",
                                        link: null,
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white/50">{item.title}</p>
                                            {item.link ? (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium hover:text-violet-400 transition-colors"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="font-medium">{item.value}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Link */}
                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-2">Looking for answers?</h3>
                            <p className="text-white/60 text-sm mb-4">
                                Check out our documentation and FAQ for quick answers.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/docs" className="btn-secondary text-sm py-2 px-4">
                                    Documentation
                                </Link>
                                <Link href="/pricing#faq" className="btn-secondary text-sm py-2 px-4">
                                    FAQ
                                </Link>
                            </div>
                        </div>

                        {/* Support Hours */}
                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-4">Support Hours</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/60">Monday - Friday</span>
                                    <span>9:00 AM - 6:00 PM PST</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Saturday</span>
                                    <span>10:00 AM - 4:00 PM PST</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Sunday</span>
                                    <span className="text-white/40">Closed</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
