"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useWeb3 } from "@/contexts/Web3Context";
import { aiApi, verificationsApi } from "@/lib/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface LivenessChallenge {
    type: string;
    instruction: string;
}

interface VerificationResults {
    docUpload:    { success: boolean; document?: any; error?: string } | null;
    faceVerify:   { success: boolean; verification?: any; error?: string } | null;
    ocr:          { success: boolean; extracted_data?: any; mrz_found?: boolean; error?: string } | null;
    liveness:     { success: boolean; liveness?: any; error?: string } | null;
    overall:      boolean;
    credentialId?: string;
    error?:       string;
    pendingReview?: boolean;
    verificationId?: string;
    reasons?: string[];
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const STEPS = [
    { id: 1, name: "Upload Document", icon: "📄" },
    { id: 2, name: "Take Selfie",     icon: "📸" },
    { id: 3, name: "Liveness Check",  icon: "🔍" },
    { id: 4, name: "Results",         icon: "✓"  },
];

const DOCUMENT_TYPES = [
    { id: "passport",        name: "Passport",        icon: "🛂" },
    { id: "driving_license", name: "Driving License", icon: "🚗" },
    { id: "national_id",     name: "National ID",     icon: "🪪" },
];

const WEBCAM_CONSTRAINTS: MediaTrackConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = pct >= 75 ? "from-emerald-500 to-emerald-400"
                : pct >= 50 ? "from-yellow-500 to-yellow-400"
                :             "from-red-500 to-red-400";
    return (
        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-2 rounded-full bg-gradient-to-r ${color}`}
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function VerifyPage() {
    const { token, isAuthenticated } = useWeb3();

    // ── Navigation ──
    const [currentStep, setCurrentStep] = useState(1);

    // ── Step 1: Document ──
    const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
    const [uploadedFile,    setUploadedFile]    = useState<File | null>(null);
    const [docBase64,       setDocBase64]       = useState<string | null>(null);
    const [isDragOver,      setIsDragOver]      = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Step 2: Selfie ──
    const selfieRef = useRef<Webcam>(null);
    const [selfieBase64,     setSelfieBase64]     = useState<string | null>(null);
    const [selfieWebcamOn,   setSelfieWebcamOn]   = useState(false);
    const [selfieWebcamErr,  setSelfieWebcamErr]  = useState<string | null>(null);

    // ── Step 3: Liveness ──
    const livenessRef = useRef<Webcam>(null);
    const [challenge,          setChallenge]          = useState<LivenessChallenge | null>(null);
    const [challengeLoading,   setChallengeLoading]   = useState(false);
    const [livenessCountdown,  setLivenessCountdown]  = useState<number | null>(null);
    const [isCapturing,        setIsCapturing]        = useState(false);
    const [livenessResult,     setLivenessResult]     = useState<any>(null);
    const [livenessError,      setLivenessError]      = useState<string | null>(null);
    const captureTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ── Step 4: Processing & Results ──
    const [isProcessing,   setIsProcessing]   = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [results,        setResults]        = useState<VerificationResults | null>(null);

    // ─────────────────────────────────────────
    // Step 1 handlers
    // ─────────────────────────────────────────

    const handleFileSelect = async (file: File) => {
        setUploadedFile(file);
        try {
            const b64 = await fileToBase64(file);
            setDocBase64(b64);
        } catch {
            setDocBase64(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    // ─────────────────────────────────────────
    // Step 2 handlers
    // ─────────────────────────────────────────

    const captureSelfie = () => {
        const shot = selfieRef.current?.getScreenshot();
        if (shot) setSelfieBase64(shot);
    };

    // ─────────────────────────────────────────
    // Step 3 handlers
    // ─────────────────────────────────────────

    // Fetch a challenge when entering step 3
    useEffect(() => {
        if (currentStep !== 3 || challenge) return;
        setChallengeLoading(true);
        aiApi.getChallenge()
            .then(d => setChallenge(d.challenge))
            .catch(() => setChallenge({ type: "blink", instruction: "Please blink your eyes twice slowly" }))
            .finally(() => setChallengeLoading(false));
    }, [currentStep, challenge]);

    // Cleanup on unmount
    useEffect(() => () => {
        if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    }, []);

    const startLiveness = useCallback(() => {
        if (!challenge || isCapturing) return;

        setLivenessResult(null);
        setLivenessError(null);
        setIsCapturing(true);
        setLivenessCountdown(5);

        const frames: string[] = [];
        const DURATION = 5000;   // 5 seconds
        const FPS      = 3;       // ~3 fps
        const INTERVAL = 1000 / FPS;

        // Capture frames at ~3fps
        const frameTimer = setInterval(() => {
            const shot = livenessRef.current?.getScreenshot();
            if (shot) frames.push(shot);
        }, INTERVAL);

        // Countdown
        let remaining = 5;
        const countdownTimer = setInterval(() => {
            remaining--;
            setLivenessCountdown(remaining > 0 ? remaining : null);
            if (remaining <= 0) clearInterval(countdownTimer);
        }, 1000);

        // After DURATION: stop capturing + call AI
        captureTimerRef.current = setTimeout(async () => {
            clearInterval(frameTimer);
            setIsCapturing(false);

            if (frames.length < 3) {
                setLivenessError("Too few frames captured. Please allow camera access and try again.");
                return;
            }

            try {
                const result = await aiApi.detectLiveness(frames, challenge.type);
                setLivenessResult(result);
            } catch (err: any) {
                setLivenessError(err.message || "Liveness detection failed. Please try again.");
            }
        }, DURATION);
    }, [challenge, isCapturing]);

    const retryLiveness = () => {
        setLivenessResult(null);
        setLivenessError(null);
        setLivenessCountdown(null);
        // Re-fetch a new challenge
        setChallenge(null);
    };

    // ─────────────────────────────────────────
    // Step 4: Submit
    // ─────────────────────────────────────────

    const handleSubmit = async () => {
        if (!uploadedFile || !selfieBase64 || !selectedDocType || !token) return;

        setIsProcessing(true);
        setCurrentStep(4);
        const r: VerificationResults = {
            docUpload:  null,
            faceVerify: null,
            ocr:        null,
            liveness:   livenessResult ? { success: true, liveness: livenessResult.liveness } : null,
            overall:    false,
        };

        try {
            // Build a single FormData and send everything to the backend.
            // The backend handles: IPFS upload, face verify, OCR, scoring, and credential issuance.
            setProcessingStep("Submitting verification to server...");

            const formData = new FormData();
            formData.append("document", uploadedFile);
            formData.append("documentType", selectedDocType);
            formData.append("selfieImage", selfieBase64);

            // Include liveness frames if captured (for server-side re-verification)
            if (livenessResult?.frames) {
                formData.append("livenessFrames", JSON.stringify(livenessResult.frames));
            }
            if (livenessResult?.liveness?.challenge_type) {
                formData.append("challengeType", livenessResult.liveness.challenge_type);
            }

            setProcessingStep("Verifying identity (face, liveness, document)...");
            const result = await verificationsApi.submit(formData, token);

            // Map backend response to our result shape
            if (result.status === "approved") {
                r.overall = true;
                r.credentialId = result.credential?.credentialId;
                r.faceVerify = { success: true, verification: { match: true, confidence: result.confidence } };
                r.docUpload = { success: true };
            } else if (result.status === "pending_review") {
                r.overall = false;
                r.faceVerify = { success: true, verification: { match: true, confidence: result.confidence } };
                r.docUpload = { success: true };
                r.pendingReview = true;
                r.verificationId = result.verificationId;
            } else {
                // rejected
                r.overall = false;
                r.error = result.message || "Verification failed";
                r.reasons = result.reasons;
            }
        } catch (err: any) {
            r.error = err.message;
        } finally {
            setResults(r);
            setIsProcessing(false);
            setProcessingStep("");
        }
    };

    // ─────────────────────────────────────────
    // canProceed guard
    // ─────────────────────────────────────────

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return !!selectedDocType && !!uploadedFile;
            case 2: return !!selfieBase64;
            case 3: return livenessResult?.liveness?.is_live === true
                       || livenessResult?.liveness?.challenge_completed === true;
            default: return false;
        }
    };

    // ─────────────────────────────────────────
    // Not authenticated guard
    // ─────────────────────────────────────────

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass-card p-10 rounded-2xl max-w-md"
                >
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                    <p className="text-white/60">
                        Please connect your MetaMask wallet and sign in before starting the
                        identity verification process.
                    </p>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────

    return (
        <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                        <span className="gradient-text">Verify Your Identity</span>
                    </h1>
                    <p className="text-white/60 text-base sm:text-lg">
                        Complete {STEPS.length} steps to receive your decentralized credential
                    </p>
                </motion.div>

                {/* ── Progress ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative mb-8 sm:mb-10"
                >
                    <div className="flex justify-between items-center">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex-1 relative">
                                <div className="flex flex-col items-center relative z-10">
                                    <motion.div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all ${
                                            currentStep >= step.id
                                                ? "bg-gradient-to-br from-violet-500 to-cyan-500"
                                                : "bg-white/10"
                                        }`}
                                        animate={{ scale: currentStep === step.id ? [1, 1.1, 1] : 1 }}
                                        transition={{ duration: 0.5, repeat: currentStep === step.id ? Infinity : 0, repeatDelay: 2 }}
                                    >
                                        {step.icon}
                                    </motion.div>
                                    <span className={`mt-2 text-xs sm:text-sm font-medium text-center ${
                                        currentStep >= step.id ? "text-white" : "text-white/40"
                                    }`}>
                                        <span className="hidden sm:inline">{step.name}</span>
                                        <span className="sm:hidden">{step.name.split(" ")[0]}</span>
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className="absolute top-5 sm:top-6 left-1/2 w-full h-0.5 bg-white/10">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Step Content ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card p-5 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl mb-6"
                    >

                        {/* ─── STEP 1: Document Upload ─── */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-5">
                                    Select & Upload Your Document
                                </h2>

                                {/* Document type selector */}
                                <div className="mb-6">
                                    <label className="block text-sm text-white/60 mb-3">Document Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {DOCUMENT_TYPES.map((doc) => (
                                            <motion.button
                                                key={doc.id}
                                                onClick={() => setSelectedDocType(doc.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    selectedDocType === doc.id
                                                        ? "border-violet-500 bg-violet-500/10"
                                                        : "border-white/10 hover:border-white/20"
                                                }`}
                                            >
                                                <div className="text-3xl mb-2">{doc.icon}</div>
                                                <div className="text-xs sm:text-sm font-medium">{doc.name}</div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* File upload */}
                                <div>
                                    <label className="block text-sm text-white/60 mb-3">Upload Document Photo</label>
                                    <motion.div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        whileHover={{ scale: 1.005 }}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                            isDragOver
                                                ? "border-violet-500 bg-violet-500/10"
                                                : uploadedFile
                                                    ? "border-emerald-500/50 bg-emerald-500/5"
                                                    : "border-white/10 hover:border-white/20"
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp,.pdf"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        />

                                        {uploadedFile ? (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                                {docBase64 && (
                                                    <img
                                                        src={docBase64}
                                                        alt="Document preview"
                                                        className="w-48 h-32 object-cover rounded-xl mb-4 border border-white/10"
                                                    />
                                                )}
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl mb-3">
                                                    ✓
                                                </div>
                                                <p className="font-medium mb-1">{uploadedFile.name}</p>
                                                <p className="text-sm text-white/40">
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setDocBase64(null); }}
                                                    className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    Remove & re-upload
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ y: [0, -8, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-5xl mb-4"
                                                >
                                                    📤
                                                </motion.div>
                                                <p className="font-medium mb-1">Drag & drop your document here</p>
                                                <p className="text-sm text-white/40">or click to browse</p>
                                                <p className="text-xs text-white/25 mt-3">
                                                    JPG, PNG, WebP, PDF • Max 10 MB
                                                </p>
                                            </>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 2: Selfie ─── */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">Take a Selfie</h2>
                                <p className="text-white/60 mb-6 text-sm">
                                    Position your face in the frame. Ensure good lighting and look directly at the camera.
                                </p>

                                <div className="relative max-w-sm mx-auto mb-6">
                                    {selfieBase64 ? (
                                        /* Preview captured photo */
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                                            <img
                                                src={selfieBase64}
                                                alt="Captured selfie"
                                                className="w-full rounded-2xl border-2 border-emerald-500/40"
                                            />
                                            <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full">
                                                ✓ Captured
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* Live webcam */
                                        <div className="relative rounded-2xl overflow-hidden bg-black/60">
                                            {selfieWebcamErr ? (
                                                <div className="aspect-[4/3] flex items-center justify-center text-center p-6">
                                                    <div>
                                                        <div className="text-4xl mb-3">📷</div>
                                                        <p className="text-red-400 font-medium mb-2">Camera access denied</p>
                                                        <p className="text-white/40 text-sm">{selfieWebcamErr}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Webcam
                                                        ref={selfieRef}
                                                        audio={false}
                                                        screenshotFormat="image/jpeg"
                                                        videoConstraints={WEBCAM_CONSTRAINTS}
                                                        onUserMedia={() => setSelfieWebcamOn(true)}
                                                        onUserMediaError={(e) => setSelfieWebcamErr(String(e))}
                                                        className="w-full rounded-2xl"
                                                        mirrored
                                                    />
                                                    {/* Face guide overlay */}
                                                    {selfieWebcamOn && (
                                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                            <div className="w-48 h-56 border-2 border-violet-400/60 rounded-full" />
                                                            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-violet-400" />
                                                            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-violet-400" />
                                                            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-violet-400" />
                                                            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-violet-400" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    {selfieBase64 ? (
                                        <motion.button
                                            onClick={() => { setSelfieBase64(null); setSelfieWebcamOn(false); }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-secondary"
                                        >
                                            Retake Photo
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={captureSelfie}
                                            disabled={!selfieWebcamOn}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {selfieWebcamOn ? "Capture Photo" : "Loading camera..."}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 3: Liveness Check ─── */}
                        {currentStep === 3 && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">Liveness Check</h2>
                                <p className="text-white/60 mb-6 text-sm">
                                    Prove you&apos;re a real person — not a photo or screen.
                                </p>

                                {/* Challenge instruction */}
                                {challengeLoading ? (
                                    <div className="text-center py-4 text-white/60">Loading challenge...</div>
                                ) : challenge && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-5 p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-3"
                                    >
                                        <span className="text-2xl">🎯</span>
                                        <div>
                                            <p className="text-xs text-violet-300 uppercase tracking-wide mb-0.5">Your Challenge</p>
                                            <p className="font-medium">{challenge.instruction}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Webcam */}
                                <div className="relative max-w-sm mx-auto mb-5">
                                    <div className="relative rounded-2xl overflow-hidden bg-black/60">
                                        <Webcam
                                            ref={livenessRef}
                                            audio={false}
                                            screenshotFormat="image/jpeg"
                                            videoConstraints={WEBCAM_CONSTRAINTS}
                                            className="w-full rounded-2xl"
                                            mirrored
                                        />

                                        {/* Countdown overlay */}
                                        {isCapturing && livenessCountdown !== null && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <motion.div
                                                    key={livenessCountdown}
                                                    initial={{ scale: 1.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="text-7xl font-bold text-white drop-shadow-lg"
                                                >
                                                    {livenessCountdown}
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Analyzing overlay */}
                                        {!isCapturing && !livenessResult && !livenessError && livenessCountdown === null && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <div className="text-center">
                                                    <svg className="w-10 h-10 animate-spin text-violet-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    <p className="text-white text-sm">Analyzing...</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Recording indicator */}
                                        {isCapturing && (
                                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-xs text-white">Recording</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Result display */}
                                {livenessResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mb-5 p-4 rounded-xl border ${
                                            livenessResult.liveness?.is_live
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-red-500/10 border-red-500/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">
                                                {livenessResult.liveness?.is_live ? "✅" : "❌"}
                                            </span>
                                            <div>
                                                <p className="font-semibold">
                                                    {livenessResult.liveness?.is_live ? "Liveness Verified!" : "Liveness Check Failed"}
                                                </p>
                                                <p className="text-xs text-white/60">
                                                    Confidence: {Math.round((livenessResult.liveness?.confidence ?? 0) * 100)}%
                                                    &nbsp;·&nbsp;
                                                    Frames with face: {livenessResult.frames_with_face}/{livenessResult.frames_analyzed}
                                                </p>
                                            </div>
                                        </div>
                                        {!livenessResult.liveness?.is_live && (
                                            <p className="text-sm text-white/60">
                                                {livenessResult.liveness?.challenge_completed
                                                    ? "Challenge completed but anti-spoofing check failed."
                                                    : "Challenge not completed. Please follow the instruction carefully."}
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {livenessError && (
                                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                                        {livenessError}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex justify-center gap-3">
                                    {livenessResult || livenessError ? (
                                        <motion.button
                                            onClick={retryLiveness}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-secondary"
                                        >
                                            Try Again
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            onClick={startLiveness}
                                            disabled={isCapturing || !challenge}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {isCapturing ? "Recording... perform the challenge now" : "Start Recording (5s)"}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 4: Results ─── */}
                        {currentStep === 4 && (
                            <div>
                                {isProcessing ? (
                                    /* Processing screen */
                                    <div className="text-center py-10">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 mx-auto mb-6"
                                        />
                                        <h2 className="text-xl font-bold mb-2">Processing Verification</h2>
                                        <p className="text-white/60 text-sm">{processingStep || "Please wait..."}</p>
                                        <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                                            {["Uploading document to IPFS", "Verifying face match", "Extracting document data"].map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                                                    <svg className="w-4 h-4 animate-spin text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : results ? (
                                    /* Results screen */
                                    <div>
                                        {/* Overall verdict */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`text-center mb-7 p-6 rounded-2xl border ${
                                                results.overall
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : results.pendingReview
                                                        ? "bg-amber-500/10 border-amber-500/30"
                                                        : "bg-red-500/10 border-red-500/30"
                                            }`}
                                        >
                                            <div className="text-5xl mb-3">
                                                {results.overall ? "🎉" : results.pendingReview ? "⏳" : "❌"}
                                            </div>
                                            <h2 className="text-2xl font-bold mb-1">
                                                {results.overall
                                                    ? "Verification Passed!"
                                                    : results.pendingReview
                                                        ? "Submitted for Review"
                                                        : "Verification Failed"}
                                            </h2>
                                            <p className="text-white/60 text-sm">
                                                {results.overall
                                                    ? "Your identity has been verified. Credential issued to your DID."
                                                    : results.pendingReview
                                                        ? "Your verification is under admin review. You'll see the result on your dashboard."
                                                        : results.reasons?.length
                                                            ? results.reasons.join(". ") + "."
                                                            : "One or more checks did not pass. Review the details below."}
                                            </p>
                                            {results.verificationId && (
                                                <p className="text-xs text-white/40 mt-2 font-mono">
                                                    ID: {results.verificationId}
                                                </p>
                                            )}
                                        </motion.div>

                                        <div className="space-y-4">
                                            {/* Face verification */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="p-4 bg-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium flex items-center gap-2">
                                                        <span>👤</span> Face Match
                                                    </span>
                                                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                                        results.faceVerify?.verification?.match
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {results.faceVerify?.verification?.match ? "✓ Match" : "✗ No Match"}
                                                    </span>
                                                </div>
                                                {results.faceVerify?.verification && (
                                                    <>
                                                        <p className="text-xs text-white/50 mb-1">
                                                            Confidence: {Math.round(results.faceVerify.verification.confidence * 100)}%
                                                            &nbsp;·&nbsp; Model: {results.faceVerify.verification.model}
                                                        </p>
                                                        <ConfidenceBar value={results.faceVerify.verification.confidence} />
                                                    </>
                                                )}
                                                {results.faceVerify?.error && (
                                                    <p className="text-xs text-red-400 mt-1">{results.faceVerify.error}</p>
                                                )}
                                            </motion.div>

                                            {/* Liveness */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="p-4 bg-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium flex items-center gap-2">
                                                        <span>🔍</span> Liveness
                                                    </span>
                                                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                                        results.liveness?.liveness?.is_live
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                        {results.liveness?.liveness?.is_live ? "✓ Live" : "✗ Failed"}
                                                    </span>
                                                </div>
                                                {results.liveness?.liveness && (
                                                    <>
                                                        <p className="text-xs text-white/50 mb-1">
                                                            Challenge: {results.liveness.liveness.challenge_type}
                                                            &nbsp;·&nbsp;
                                                            Confidence: {Math.round(results.liveness.liveness.confidence * 100)}%
                                                        </p>
                                                        <ConfidenceBar value={results.liveness.liveness.confidence} />
                                                    </>
                                                )}
                                            </motion.div>

                                            {/* OCR */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="p-4 bg-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-medium flex items-center gap-2">
                                                        <span>📄</span> Document Data
                                                    </span>
                                                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                                        results.ocr?.mrz_found
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-yellow-500/20 text-yellow-400"
                                                    }`}>
                                                        {results.ocr?.mrz_found ? "✓ MRZ Found" : "No MRZ"}
                                                    </span>
                                                </div>
                                                {results.ocr?.extracted_data && Object.keys(results.ocr.extracted_data).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(results.ocr.extracted_data)
                                                            .filter(([, v]) => v)
                                                            .map(([k, v]) => (
                                                                <div key={k}>
                                                                    <p className="text-xs text-white/40 capitalize">
                                                                        {k.replace(/_/g, " ")}
                                                                    </p>
                                                                    <p className="text-sm font-mono">{String(v)}</p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-white/40">
                                                        {results.ocr?.error ?? "No structured data extracted"}
                                                    </p>
                                                )}
                                            </motion.div>

                                            {/* IPFS upload */}
                                            {results.docUpload && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="p-4 bg-white/5 rounded-xl"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium flex items-center gap-2">
                                                            <span>🔒</span> Encrypted Storage
                                                        </span>
                                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                                                            results.docUpload.success
                                                                ? "bg-emerald-500/20 text-emerald-400"
                                                                : "bg-red-500/20 text-red-400"
                                                        }`}>
                                                            {results.docUpload.success ? "✓ Stored" : "✗ Failed"}
                                                        </span>
                                                    </div>
                                                    {results.docUpload.document?.ipfsHash && (
                                                        <p className="text-xs text-white/40 font-mono mt-1 break-all">
                                                            IPFS: {results.docUpload.document.ipfsHash}
                                                        </p>
                                                    )}
                                                    {results.docUpload.error && (
                                                        <p className="text-xs text-red-400 mt-1">{results.docUpload.error}</p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Issued credential */}
                                        {results.credentialId && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="p-4 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/30 rounded-xl"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span>🆔</span>
                                                    <span className="font-medium text-violet-300">Credential Issued</span>
                                                </div>
                                                <p className="text-xs text-white/50 font-mono break-all">
                                                    {results.credentialId}
                                                </p>
                                                <p className="text-xs text-white/40 mt-1">
                                                    View it in your{" "}
                                                    <a href="/credentials" className="text-violet-400 hover:underline">
                                                        Credentials
                                                    </a>{" "}
                                                    page.
                                                </p>
                                            </motion.div>
                                        )}

                                        {/* Retry button */}
                                        {!results.overall && !results.pendingReview && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="mt-6 text-center"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setResults(null);
                                                        setCurrentStep(1);
                                                        setUploadedFile(null);
                                                        setDocBase64(null);
                                                        setSelfieBase64(null);
                                                        setLivenessResult(null);
                                                        setChallenge(null);
                                                        setSelectedDocType(null);
                                                    }}
                                                    className="btn-secondary text-sm"
                                                >
                                                    Start Over
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>

                {/* ── Navigation buttons ── */}
                {currentStep < 4 && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-between items-center gap-3"
                    >
                        <motion.button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed text-sm px-5 py-2.5"
                        >
                            ← Back
                        </motion.button>

                        {currentStep < 3 ? (
                            <motion.button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!canProceed()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm px-5 py-2.5"
                            >
                                Next Step →
                            </motion.button>
                        ) : (
                            /* Step 3: Submit triggers processing */
                            <motion.button
                                onClick={handleSubmit}
                                disabled={!canProceed()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-glow disabled:opacity-30 disabled:cursor-not-allowed text-sm px-6 py-2.5"
                            >
                                Submit for Verification →
                            </motion.button>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
