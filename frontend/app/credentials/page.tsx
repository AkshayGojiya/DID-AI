"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useWeb3 } from "@/contexts/Web3Context";
import { credentialsApi } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface Credential {
    id: string;
    credentialId: string;
    type: string;
    issuer: { did: string; name: string };
    issuedAt: string;
    expiresAt: string;
    status: string;
    hash: string;
    blockchain: { stored: boolean; txHash: string | null };
    claims: Record<string, any>;
    includedClaims: string[];
    usage: { shareCount: number; verifyCount: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCredType(t: string) {
    return t.replace(/([A-Z])/g, " $1").trim();
}

const CLAIM_LABELS: Record<string, string> = {
    fullName:       "Full Name",
    dateOfBirth:    "Date of Birth",
    nationality:    "Nationality",
    documentType:   "Document Type",
    documentNumber: "Document Number",
    isOver18:       "Over 18",
    isOver21:       "Over 21",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function CredentialsPage() {
    const { token, isAuthenticated } = useWeb3();

    const [credentials, setCredentials]     = useState<Credential[]>([]);
    const [selectedCred, setSelectedCred]   = useState<Credential | null>(null);
    const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
    const [showQRModal, setShowQRModal]     = useState(false);
    const [loading, setLoading]             = useState(true);
    const [revoking, setRevoking]           = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const fetchCredentials = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res  = await credentialsApi.list(token);
            const list = res.credentials ?? [];
            setCredentials(list);
            if (list.length > 0) setSelectedCred(list[0]);
        } catch {
            // swallow
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

    const toggleClaim = (key: string) =>
        setSelectedClaims(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );

    const generateShareData = () => {
        if (!selectedCred) return "{}";
        const shared: Record<string, any> = {};
        selectedClaims.forEach(k => {
            if (selectedCred.claims[k] != null) shared[k] = selectedCred.claims[k];
        });
        return JSON.stringify({
            credentialId:   selectedCred.credentialId,
            credentialType: selectedCred.type,
            issuer:         selectedCred.issuer,
            hash:           selectedCred.hash,
            claims:         shared,
            timestamp:      new Date().toISOString(),
        });
    };

    const handleRevoke = async () => {
        if (!selectedCred || !token) return;
        setRevoking(true);
        try {
            await credentialsApi.revoke(selectedCred.id, "User requested revocation", token);
            await fetchCredentials();
            setConfirmRevoke(false);
        } catch (err: any) {
            alert(err?.message ?? "Failed to revoke credential");
        } finally {
            setRevoking(false);
        }
    };

    // ── Auth guard ─────────────────────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-2xl text-center max-w-md"
                >
                    <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-white/50 mb-6 text-sm">
                        Connect and sign in with MetaMask to view your credentials.
                    </p>
                    <Link href="/" className="btn-primary inline-block">Go to Home</Link>
                </motion.div>
            </div>
        );
    }

    // ── Available claims for selected credential ───────────────────────────
    const availableClaims = selectedCred
        ? selectedCred.includedClaims.filter(k => selectedCred.claims[k] != null)
        : [];

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Your Credentials</span>
                    </h1>
                    <p className="text-white/60 text-lg">Manage, view, and share your verified credentials</p>
                </motion.div>

                {/* Loading skeleton */}
                {loading ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-3">
                            {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
                        </div>
                        <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl animate-pulse" />
                    </div>
                ) : credentials.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-12 rounded-2xl text-center"
                    >
                        <div className="text-6xl mb-4">🆔</div>
                        <h2 className="text-2xl font-bold mb-3">No Credentials Yet</h2>
                        <p className="text-white/50 mb-6">
                            Complete a verification to earn your first verifiable credential.
                        </p>
                        <Link href="/verify" className="btn-primary inline-block">Start Verification</Link>
                    </motion.div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Credentials list */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="glass-card p-4 rounded-2xl">
                                <h3 className="font-semibold text-lg mb-4 px-2">All Credentials</h3>
                                <div className="space-y-2">
                                    {credentials.map(cred => (
                                        <motion.button
                                            key={cred.id}
                                            onClick={() => {
                                                setSelectedCred(cred);
                                                setSelectedClaims([]);
                                                setConfirmRevoke(false);
                                            }}
                                            whileHover={{ x: 4 }}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${
                                                selectedCred?.id === cred.id
                                                    ? "bg-violet-500/20 border border-violet-500/30"
                                                    : "bg-white/5 hover:bg-white/10"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                                                    cred.status === "active"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}>
                                                    {cred.status === "active" ? "✓" : "✕"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{formatCredType(cred.type)}</p>
                                                    <p className="text-xs text-white/40">
                                                        {new Date(cred.issuedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                                <Link
                                    href="/verify"
                                    className="block mt-4 text-center text-sm text-violet-400 hover:text-violet-300 p-3 bg-violet-500/10 rounded-xl transition-colors"
                                >
                                    + Add New Credential
                                </Link>
                            </div>
                        </motion.div>

                        {/* Credential detail */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2"
                        >
                            <AnimatePresence mode="wait">
                                {selectedCred && (
                                    <motion.div
                                        key={selectedCred.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="glass-card p-8 rounded-2xl"
                                    >
                                        {/* Credential header */}
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-2xl font-bold">{formatCredType(selectedCred.type)}</h2>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        selectedCred.status === "active"
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {selectedCred.status.charAt(0).toUpperCase() + selectedCred.status.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/50">
                                                    Issued by {selectedCred.issuer.name} on{" "}
                                                    {new Date(selectedCred.issuedAt).toLocaleDateString()}
                                                    {" · "}Expires {new Date(selectedCred.expiresAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <motion.button
                                                onClick={() => selectedClaims.length > 0 && setShowQRModal(true)}
                                                disabled={selectedClaims.length === 0 || selectedCred.status !== "active"}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={selectedClaims.length === 0 ? "Select claims first" : "Generate QR"}
                                            >
                                                Generate QR
                                            </motion.button>
                                        </div>

                                        {/* Blockchain info */}
                                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Credential Hash</p>
                                                <p className="font-mono text-xs break-all text-white/80">
                                                    {selectedCred.hash || "—"}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Blockchain Tx</p>
                                                <p className="font-mono text-xs break-all text-white/80">
                                                    {selectedCred.blockchain.txHash || "Not yet anchored"}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Times Shared</p>
                                                <p className="font-semibold">{selectedCred.usage.shareCount}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Times Verified</p>
                                                <p className="font-semibold">{selectedCred.usage.verifyCount}</p>
                                            </div>
                                        </div>

                                        {/* Selective disclosure */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Selective Disclosure</h3>
                                                <p className="text-sm text-white/50">
                                                    {selectedClaims.length} of {availableClaims.length} selected
                                                </p>
                                            </div>
                                            <p className="text-sm text-white/50 mb-4">
                                                Choose which attributes to include in the QR code.
                                            </p>

                                            {availableClaims.length === 0 ? (
                                                <p className="text-sm text-white/40 p-4 bg-white/5 rounded-xl">
                                                    No claim data available for this credential.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {availableClaims.map((key, index) => (
                                                        <motion.div
                                                            key={key}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            onClick={() => toggleClaim(key)}
                                                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                                                                selectedClaims.includes(key)
                                                                    ? "bg-violet-500/20 border border-violet-500/30"
                                                                    : "bg-white/5 hover:bg-white/10"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                                    selectedClaims.includes(key)
                                                                        ? "bg-violet-500 text-white"
                                                                        : "bg-white/10"
                                                                }`}>
                                                                    {selectedClaims.includes(key) && "✓"}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{CLAIM_LABELS[key] ?? key}</p>
                                                                    <p className="text-sm text-white/40">
                                                                        {String(selectedCred.claims[key])}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            {selectedCred.blockchain.txHash && (
                                                <motion.a
                                                    href={`https://etherscan.io/tx/${selectedCred.blockchain.txHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    whileHover={{ scale: 1.02 }}
                                                    className="px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                                >
                                                    View on Etherscan
                                                </motion.a>
                                            )}
                                            {selectedCred.status === "active" && (
                                                confirmRevoke ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-red-400">Confirm revoke?</span>
                                                        <motion.button
                                                            onClick={handleRevoke}
                                                            disabled={revoking}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-4 py-2 bg-red-500/20 rounded-xl text-sm text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                        >
                                                            {revoking ? "Revoking…" : "Yes, Revoke"}
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => setConfirmRevoke(false)}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-4 py-2 bg-white/5 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            Cancel
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <motion.button
                                                        onClick={() => setConfirmRevoke(true)}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="px-4 py-2 bg-red-500/10 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        Revoke Credential
                                                    </motion.button>
                                                )
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && selectedCred && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setShowQRModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card p-8 rounded-3xl max-w-md w-full"
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-2">Share Credential</h3>
                                <p className="text-white/50 text-sm mb-6">
                                    Scan this QR code to verify the selected attributes
                                </p>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className="bg-white p-6 rounded-2xl inline-block mb-6"
                                >
                                    <QRCodeSVG value={generateShareData()} size={200} level="H" includeMargin />
                                </motion.div>

                                <div className="text-left mb-6 p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-white/40 mb-2">Sharing attributes:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedClaims.map(key => (
                                            <span
                                                key={key}
                                                className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs"
                                            >
                                                {CLAIM_LABELS[key] ?? key}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowQRModal(false)}
                                    className="w-full btn-secondary"
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
