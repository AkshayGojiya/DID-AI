"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const pricingPlans = [
    {
        name: "Free",
        price: "0",
        period: "forever",
        description: "Perfect for individuals getting started",
        features: [
            "1 Identity Verification",
            "Basic Credentials",
            "QR Code Sharing",
            "Community Support",
            "Standard AI Verification",
        ],
        limitations: [
            "Limited to 5 shares/month",
            "No API access",
        ],
        cta: "Get Started",
        popular: false,
    },
    {
        name: "Pro",
        price: "9.99",
        period: "/month",
        description: "For professionals and small teams",
        features: [
            "Unlimited Verifications",
            "Advanced Credentials",
            "Unlimited QR Sharing",
            "Priority Support",
            "Advanced AI Features",
            "API Access",
            "Custom Branding",
            "Analytics Dashboard",
        ],
        limitations: [],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For organizations with advanced needs",
        features: [
            "Everything in Pro",
            "Dedicated Support",
            "Custom Integrations",
            "SLA Guarantee",
            "On-premise Option",
            "Compliance Reports",
            "Team Management",
            "White-label Solution",
        ],
        limitations: [],
        cta: "Contact Sales",
        popular: false,
    },
];

const faq = [
    {
        question: "How does the verification process work?",
        answer: "Our AI-powered system verifies your identity through document scanning, face matching, and liveness detection. The verified credentials are then stored on the blockchain.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes! Your personal data is encrypted and stored on IPFS. Only hashes are stored on-chain. You maintain full control over who can access your information.",
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Absolutely. You can cancel your subscription at any time. Your credentials will remain valid even after cancellation.",
    },
    {
        question: "What blockchains are supported?",
        answer: "We currently support Ethereum mainnet and Polygon. More chains are coming soon including Arbitrum and Optimism.",
    },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        <span className="gradient-text">Simple, Transparent Pricing</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                        Choose the plan that works best for you. All plans include our core
                        decentralized identity features.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 p-1.5 glass rounded-full">
                        <button
                            onClick={() => setBillingCycle("monthly")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly"
                                    ? "bg-violet-500 text-white"
                                    : "text-white/60 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle("annual")}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === "annual"
                                    ? "bg-violet-500 text-white"
                                    : "text-white/60 hover:text-white"
                                }`}
                        >
                            Annual
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative glass-card rounded-3xl p-8 ${plan.popular ? "ring-2 ring-violet-500" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                <p className="text-sm text-white/50 mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">
                                        {plan.price === "Custom" ? "" : "$"}
                                        {billingCycle === "annual" && plan.price !== "Custom" && plan.price !== "0"
                                            ? (parseFloat(plan.price) * 0.8).toFixed(2)
                                            : plan.price}
                                    </span>
                                    <span className="text-white/50">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                                            ✓
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                                {plan.limitations.map((limitation) => (
                                    <li key={limitation} className="flex items-center gap-3 text-sm text-white/40">
                                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                            -
                                        </span>
                                        {limitation}
                                    </li>
                                ))}
                            </ul>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full py-3 rounded-xl font-medium transition-all ${plan.popular
                                        ? "btn-glow"
                                        : "bg-white/10 hover:bg-white/20"
                                    }`}
                            >
                                {plan.cta}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center mb-12">
                        <span className="gradient-text">Frequently Asked Questions</span>
                    </h2>

                    <div className="space-y-4">
                        {faq.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="font-medium">{item.question}</span>
                                    <motion.span
                                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                                        className="text-white/50"
                                    >
                                        ▼
                                    </motion.span>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openFaq === index ? "auto" : 0,
                                        opacity: openFaq === index ? 1 : 0,
                                    }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-5 pb-5 text-white/60">{item.answer}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-24"
                >
                    <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-white/60 mb-6">
                        Our team is here to help you find the right plan.
                    </p>
                    <Link href="/contact" className="btn-secondary">
                        Contact Sales
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
