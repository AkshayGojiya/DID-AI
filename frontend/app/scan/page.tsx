"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { credentialsApi } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface ScannedCredential {
    credentialId: string;
    credentialType: string;
    issuer: { did: string; name: string };
    subject: { did: string };
    issuedAt: string;
    expiresAt: string;
    status: string;
    claims: Record<string, any>;
    blockchain: { stored: boolean; txHash: string | null };
}

interface ScanResult {
    success: boolean;
    verified: boolean;
    credential?: ScannedCredential;
    error?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

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

export default function ScanPage() {
    const videoRef   = useRef<HTMLVideoElement>(null);
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const streamRef  = useRef<MediaStream | null>(null);
    const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isScanning, setIsScanning]     = useState(false);
    const [scanResult, setScanResult]     = useState<ScanResult | null>(null);
    const [error, setError]               = useState<string | null>(null);
    const [cameraError, setCameraError]   = useState<string | null>(null);

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    // ── Start camera + QR polling ──────────────────────────────────────────
    const handleStartScan = useCallback(async () => {
        setError(null);
        setCameraError(null);
        setScanResult(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera not supported in this browser.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsScanning(true);
            startPolling();
        } catch (err: any) {
            if (err.name === "NotAllowedError") {
                setCameraError("Camera permission denied. Please allow camera access and try again.");
            } else {
                setCameraError(`Camera error: ${err.message}`);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const startPolling = () => {
        // Poll every 150 ms for QR codes
        timerRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;
            const video  = videoRef.current;
            const canvas = canvasRef.current;

            if (video.readyState < video.HAVE_ENOUGH_DATA) return;

            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Dynamic import to keep bundle lean
            const jsQR = (await import("jsqr")).default;
            const code  = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code?.data) {
                stopCamera();
                await verifyQRData(code.data);
            }
        }, 150);
    };

    // ── Parse & verify the scanned QR payload ─────────────────────────────
    const verifyQRData = async (raw: string) => {
        try {
            const parsed = JSON.parse(raw);
            const hash   = parsed.hash as string | undefined;

            if (!hash) {
                setScanResult({ success: false, verified: false, error: "Invalid QR code — no credential hash found." });
                return;
            }

            const res = await credentialsApi.verifyByHash(hash);
            setScanResult({
                success:    res.success,
                verified:   res.verified,
                credential: res.credential as ScannedCredential | undefined,
            });
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                setScanResult({ success: false, verified: false, error: "QR code does not contain valid VerifyX credential data." });
            } else {
                setScanResult({ success: false, verified: false, error: err?.message ?? "Verification failed." });
            }
        }
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        setCameraError(null);
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            {/* Hidden canvas used for QR decoding */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Scan & Verify</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-xl mx-auto">
                        Scan a VerifyX credential QR code to verify it on the blockchain instantly
                    </p>
                </motion.div>

                {/* Scanner card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-3xl p-8 mb-8"
                >
                    <AnimatePresence mode="wait">
                        {/* ── Scanner view ── */}
                        {!scanResult ? (
                            <motion.div
                                key="scanner"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                {/* Camera / placeholder */}
                                <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden bg-black/60 mb-8">
                                    {/* Live video */}
                                    <video
                                        ref={videoRef}
                                        className={`absolute inset-0 w-full h-full object-cover ${isScanning ? "block" : "hidden"}`}
                                        playsInline
                                        muted
                                    />

                                    {/* Scanning overlay */}
                                    {isScanning && (
                                        <>
                                            <motion.div
                                                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent z-10"
                                                initial={{ top: "0%" }}
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                            />
                                            {/* Corner markers */}
                                            <div className="absolute top-4 left-4  w-10 h-10 border-l-2 border-t-2 border-violet-500 z-10" />
                                            <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-violet-500 z-10" />
                                            <div className="absolute bottom-4 left-4  w-10 h-10 border-l-2 border-b-2 border-violet-500 z-10" />
                                            <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-violet-500 z-10" />
                                            <p className="absolute bottom-8 left-0 right-0 text-center text-white/70 text-sm z-10">
                                                Point at a VerifyX QR code
                                            </p>
                                        </>
                                    )}

                                    {/* Idle placeholder */}
                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <svg className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                                </svg>
                                            </div>
                                            <p className="text-white/40 text-sm">Camera will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {/* Camera error */}
                                {cameraError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
                                    >
                                        {cameraError}
                                    </motion.div>
                                )}

                                {/* Controls */}
                                {isScanning ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={stopCamera}
                                        className="btn-secondary text-lg px-10 py-4"
                                    >
                                        Stop Scanning
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleStartScan}
                                        className="btn-glow text-lg px-10 py-4 flex items-center gap-3 mx-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
                                        </svg>
                                        Start Scanning
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                        /* ── Result view ── */
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {scanResult.verified && scanResult.credential ? (
                                    /* ── Verified ── */
                                    <div>
                                        <div className="text-center mb-8">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", bounce: 0.5 }}
                                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                                            >
                                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Credential Verified!</h2>
                                            <p className="text-white/60">This credential is valid and has been verified</p>
                                        </div>

                                        {/* Credential details */}
                                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Subject DID</p>
                                                <p className="font-mono text-xs text-white/80 break-all">
                                                    {scanResult.credential.subject?.did || "—"}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Credential Type</p>
                                                <p className="font-medium">
                                                    {scanResult.credential.credentialType?.replace(/([A-Z])/g, " $1").trim()}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Issuer</p>
                                                <p className="font-medium">{scanResult.credential.issuer?.name || "VerifyX"}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl">
                                                <p className="text-xs text-white/40 mb-1">Expires</p>
                                                <p className="font-medium">
                                                    {scanResult.credential.expiresAt
                                                        ? new Date(scanResult.credential.expiresAt).toLocaleDateString()
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Shared claims */}
                                        {Object.keys(scanResult.credential.claims ?? {}).length > 0 && (
                                            <div className="mb-8">
                                                <p className="text-sm text-white/40 mb-3">Shared Attributes</p>
                                                <div className="grid gap-2">
                                                    {Object.entries(scanResult.credential.claims).map(([k, v]) => (
                                                        <div key={k} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <span className="text-sm text-white/60">{CLAIM_LABELS[k] ?? k}</span>
                                                            <span className="text-sm font-medium">{String(v)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Blockchain badge */}
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-emerald-400">Verified by VerifyX</p>
                                                    <p className="text-xs text-white/40">
                                                        {scanResult.credential.blockchain?.stored
                                                            ? "Credential hash confirmed on blockchain"
                                                            : "Credential verified in database"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleReset}
                                                className="btn-secondary"
                                            >
                                                Scan Another
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Invalid / Error ── */
                                    <div className="text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center"
                                        >
                                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
                                        <p className="text-white/60 mb-8">
                                            {scanResult.error || "This credential could not be verified or has been revoked."}
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleReset}
                                            className="btn-secondary"
                                        >
                                            Try Again
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Info cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: "🔒", title: "Privacy Protected",   description: "Only the shared attributes are revealed — your full data stays private" },
                        { icon: "⚡", title: "Instant Verification", description: "Verification happens in real-time against the VerifyX credential registry"  },
                        { icon: "✓", title: "Tamper Proof",         description: "Credentials are cryptographically signed and cannot be forged or modified"   },
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass-card-hover p-6 rounded-2xl text-center"
                        >
                            <div className="text-3xl mb-3">{card.icon}</div>
                            <h3 className="font-semibold mb-2">{card.title}</h3>
                            <p className="text-sm text-white/50">{card.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
