"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const steps = [
    { id: 1, name: "Upload Document", icon: "📄" },
    { id: 2, name: "Take Selfie", icon: "📸" },
    { id: 3, name: "Liveness Check", icon: "🔍" },
    { id: 4, name: "Review & Submit", icon: "✓" },
];

const documentTypes = [
    { id: "passport", name: "Passport", icon: "🛂" },
    { id: "driving_license", name: "Driving License", icon: "🚗" },
    { id: "national_id", name: "National ID", icon: "🪪" },
    { id: "residence_permit", name: "Residence Permit", icon: "🏠" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function VerifyPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selfieCapture, setSelfieCapture] = useState(false);
    const [livenessComplete, setLivenessComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canProceed = () => {
        switch (currentStep) {
            case 1: return selectedDocType && uploadedFile;
            case 2: return selfieCapture;
            case 3: return livenessComplete;
            case 4: return true;
            default: return false;
        }
    };

    const handleFileSelect = (file: File) => {
        setUploadedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        await new Promise((r) => setTimeout(r, 3000));
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Verify Your Identity</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        Complete the verification process in 4 simple steps
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative mb-12"
                >
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 relative">
                                <motion.div
                                    className="flex flex-col items-center relative z-10"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <motion.div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${currentStep >= step.id
                                                ? "bg-gradient-to-br from-violet-500 to-cyan-500"
                                                : "bg-white/10"
                                            }`}
                                        animate={{
                                            scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                                        }}
                                        transition={{ duration: 0.5, repeat: currentStep === step.id ? Infinity : 0, repeatDelay: 2 }}
                                    >
                                        {step.icon}
                                    </motion.div>
                                    <span className={`mt-3 text-sm font-medium ${currentStep >= step.id ? "text-white" : "text-white/40"
                                        }`}>
                                        {step.name}
                                    </span>
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <div className="absolute top-7 left-1/2 w-full h-0.5 bg-white/10">
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

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card p-8 rounded-3xl mb-8"
                    >
                        {/* Step 1: Upload Document */}
                        {currentStep === 1 && (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                                    Select & Upload Your Document
                                </motion.h2>

                                {/* Document Type Selection */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <label className="block text-sm text-white/60 mb-3">Document Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {documentTypes.map((docType) => (
                                            <motion.button
                                                key={docType.id}
                                                onClick={() => setSelectedDocType(docType.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 rounded-xl border-2 transition-all ${selectedDocType === docType.id
                                                        ? "border-violet-500 bg-violet-500/10"
                                                        : "border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="text-3xl mb-2">{docType.icon}</div>
                                                <div className="text-sm font-medium">{docType.name}</div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* File Upload */}
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm text-white/60 mb-3">Upload Document</label>
                                    <motion.div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        whileHover={{ scale: 1.01 }}
                                        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragOver
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
                                            accept="image/*,.pdf"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        />

                                        {uploadedFile ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl mb-4">
                                                    ✓
                                                </div>
                                                <p className="font-medium mb-1">{uploadedFile.name}</p>
                                                <p className="text-sm text-white/40">
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                                                    className="mt-4 text-sm text-red-400 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ y: [0, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-5xl mb-4"
                                                >
                                                    📤
                                                </motion.div>
                                                <p className="font-medium mb-2">Drag & drop your document here</p>
                                                <p className="text-sm text-white/40">or click to browse files</p>
                                                <p className="text-xs text-white/30 mt-4">
                                                    Supported formats: JPG, PNG, PDF • Max size: 10MB
                                                </p>
                                            </>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 2: Take Selfie */}
                        {currentStep === 2 && (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                                    Take a Selfie
                                </motion.h2>
                                <motion.p variants={itemVariants} className="text-white/60 mb-8">
                                    Position your face within the frame and ensure good lighting
                                </motion.p>

                                <motion.div
                                    variants={itemVariants}
                                    className="relative aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden bg-black/50 mb-8"
                                >
                                    {/* Camera placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {!selfieCapture ? (
                                            <div className="text-center">
                                                <motion.div
                                                    className="w-32 h-40 border-4 border-white/30 rounded-full mx-auto mb-4"
                                                    animate={{ borderColor: ["rgba(255,255,255,0.3)", "rgba(139,92,246,0.5)", "rgba(255,255,255,0.3)"] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                                <p className="text-white/50 text-sm">Position your face here</p>

                                                {/* Corner guides */}
                                                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-violet-500" />
                                                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-violet-500" />
                                                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-violet-500" />
                                                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-violet-500" />
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-center"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl mb-4 mx-auto">
                                                    📸
                                                </div>
                                                <p className="text-emerald-400 font-medium">Photo Captured!</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="text-center">
                                    <motion.button
                                        onClick={() => setSelfieCapture(!selfieCapture)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={selfieCapture ? "btn-secondary" : "btn-glow"}
                                    >
                                        {selfieCapture ? "Retake Photo" : "Capture Photo"}
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 3: Liveness Check */}
                        {currentStep === 3 && (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                                    Liveness Check
                                </motion.h2>
                                <motion.p variants={itemVariants} className="text-white/60 mb-8">
                                    Follow the instructions to prove you're a real person
                                </motion.p>

                                <motion.div
                                    variants={itemVariants}
                                    className="relative aspect-video max-w-lg mx-auto rounded-2xl overflow-hidden bg-black/50 mb-8"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {!livenessComplete ? (
                                            <div className="text-center">
                                                <motion.div
                                                    className="text-6xl mb-4"
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    👤
                                                </motion.div>
                                                <p className="text-white/70 font-medium mb-2">Preparing liveness check...</p>
                                                <p className="text-white/40 text-sm">Please wait</p>
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl mb-4 mx-auto"
                                                >
                                                    ✓
                                                </motion.div>
                                                <p className="text-emerald-400 font-medium">Liveness Verified!</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Instructions */}
                                <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { icon: "👁", text: "Blink twice" },
                                        { icon: "↪️", text: "Turn head left" },
                                        { icon: "↩️", text: "Turn head right" },
                                    ].map((instruction, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-xl text-center">
                                            <div className="text-2xl mb-2">{instruction.icon}</div>
                                            <p className="text-sm text-white/60">{instruction.text}</p>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div variants={itemVariants} className="text-center">
                                    <motion.button
                                        onClick={() => setLivenessComplete(!livenessComplete)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={livenessComplete ? "btn-secondary" : "btn-glow"}
                                    >
                                        {livenessComplete ? "Redo Check" : "Start Liveness Check"}
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {currentStep === 4 && (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6">
                                    Review & Submit
                                </motion.h2>
                                <motion.p variants={itemVariants} className="text-white/60 mb-8">
                                    Please review your submission before proceeding
                                </motion.p>

                                <motion.div variants={itemVariants} className="space-y-4 mb-8">
                                    {[
                                        { label: "Document Type", value: selectedDocType, status: "complete" },
                                        { label: "Document Upload", value: uploadedFile?.name, status: "complete" },
                                        { label: "Selfie Capture", value: "Photo captured", status: selfieCapture ? "complete" : "pending" },
                                        { label: "Liveness Check", value: "Verified", status: livenessComplete ? "complete" : "pending" },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                                        >
                                            <div>
                                                <p className="text-sm text-white/50">{item.label}</p>
                                                <p className="font-medium">{item.value}</p>
                                            </div>
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === "complete"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-amber-500/20 text-amber-400"
                                                }`}>
                                                {item.status === "complete" ? "✓" : "⏳"}
                                            </span>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <motion.div variants={itemVariants} className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-8">
                                    <p className="text-sm text-white/70">
                                        <strong>Privacy Notice:</strong> Your documents are encrypted and stored on IPFS.
                                        Only credential hashes are stored on the blockchain. You maintain full control
                                        over your data.
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} className="text-center">
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isProcessing}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-glow text-lg px-10 py-4"
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="spinner" /> Processing...
                                            </span>
                                        ) : (
                                            "Submit for Verification"
                                        )}
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center"
                >
                    <motion.button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </motion.button>

                    {currentStep < 4 && (
                        <motion.button
                            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                            disabled={!canProceed()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Step
                        </motion.button>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
