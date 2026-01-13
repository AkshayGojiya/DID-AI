"use client";

import Link from "next/link";
import { useState, useRef } from "react";

// Icons
const UploadIcon = () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const CameraIcon = () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const FaceIcon = () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const steps = [
    { id: 1, title: "Upload Document", icon: <UploadIcon />, description: "Upload your identity document" },
    { id: 2, title: "Take Selfie", icon: <CameraIcon />, description: "Capture a live photo of yourself" },
    { id: 3, title: "Liveness Check", icon: <FaceIcon />, description: "Complete the liveness verification" },
    { id: 4, title: "Review & Submit", icon: <CheckCircleIcon />, description: "Review and submit for verification" },
];

const documentTypes = [
    { id: "passport", name: "Passport", icon: "🛂" },
    { id: "driving_license", name: "Driving License", icon: "🚗" },
    { id: "national_id", name: "National ID Card", icon: "🪪" },
    { id: "other", name: "Other ID", icon: "📄" },
];

export default function VerifyPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [selfieCapture, setSelfieCapture] = useState(false);
    const [livenessComplete, setLivenessComplete] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return selectedDocType && uploadedFile;
            case 2: return selfieCapture;
            case 3: return livenessComplete;
            case 4: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen pt-24 px-6 pb-12">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                            <span className="text-xl font-bold gradient-text-animated">VerifyX</span>
                        </Link>

                        <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="gradient-text">Identity Verification</span>
                    </h1>
                    <p className="text-gray-400">Complete the verification process to get your decentralized identity credential</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-12 relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" />
                    <div
                        className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= step.id
                                        ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                                        : 'bg-white/10 text-gray-500'
                                    }`}
                            >
                                {currentStep > step.id ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="font-semibold">{step.id}</span>
                                )}
                            </div>
                            <span className={`mt-2 text-xs text-center hidden sm:block ${currentStep >= step.id ? 'text-white' : 'text-gray-500'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="glass-card p-8 rounded-2xl mb-8">
                    {/* Step 1: Document Upload */}
                    {currentStep === 1 && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                <UploadIcon />
                                Upload Identity Document
                            </h2>

                            {/* Document Type Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-400 mb-3">Select Document Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {documentTypes.map((doc) => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDocType(doc.id)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedDocType === doc.id
                                                    ? 'border-indigo-500 bg-indigo-500/10'
                                                    : 'border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{doc.icon}</div>
                                            <div className="text-sm font-medium">{doc.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-3">Upload Document</label>
                                <div
                                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : uploadedFile
                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                : 'border-white/20 hover:border-white/40'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />

                                    {uploadedFile ? (
                                        <div>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-medium text-emerald-400">{uploadedFile.name}</p>
                                            <p className="text-sm text-gray-400 mt-1">Click or drag to replace</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                                <UploadIcon />
                                            </div>
                                            <p className="text-lg font-medium">Drop your file here, or click to browse</p>
                                            <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, PDF up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Selfie Capture */}
                    {currentStep === 2 && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                <CameraIcon />
                                Take a Selfie
                            </h2>

                            <div className="text-center">
                                <div className="relative w-80 h-80 mx-auto mb-6 rounded-full overflow-hidden border-4 border-indigo-500/30">
                                    {selfieCapture ? (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                                            <svg className="w-24 h-24 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <CameraIcon />
                                        </div>
                                    )}

                                    {/* Face guide overlay */}
                                    {!selfieCapture && (
                                        <div className="absolute inset-8 border-2 border-dashed border-indigo-500/50 rounded-full" />
                                    )}
                                </div>

                                <p className="text-gray-400 mb-6">
                                    {selfieCapture
                                        ? "Great! Your photo looks good."
                                        : "Position your face within the circle and ensure good lighting."
                                    }
                                </p>

                                <button
                                    onClick={() => setSelfieCapture(!selfieCapture)}
                                    className={`px-8 py-3 rounded-full font-semibold transition-all ${selfieCapture
                                            ? 'bg-white/10 hover:bg-white/20'
                                            : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90'
                                        }`}
                                >
                                    {selfieCapture ? 'Retake Photo' : 'Capture Photo'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Liveness Check */}
                    {currentStep === 3 && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                <FaceIcon />
                                Liveness Verification
                            </h2>

                            <div className="text-center">
                                <div className="w-80 h-60 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    {livenessComplete ? (
                                        <div className="text-center">
                                            <svg className="w-20 h-20 mx-auto text-emerald-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-emerald-400 font-medium">Liveness Verified!</p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <FaceIcon />
                                            <p className="text-sm text-gray-400 mt-4">Camera preview will appear here</p>
                                        </div>
                                    )}
                                </div>

                                <div className="max-w-md mx-auto mb-6">
                                    <p className="text-gray-400 text-sm mb-4">
                                        {livenessComplete
                                            ? "Your liveness has been verified successfully."
                                            : "Follow the on-screen instructions to prove you're a real person."
                                        }
                                    </p>

                                    {!livenessComplete && (
                                        <div className="space-y-2 text-left">
                                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm">1</div>
                                                <span className="text-sm">Blink your eyes twice</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</div>
                                                <span className="text-sm text-gray-400">Turn your head slowly left</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">3</div>
                                                <span className="text-sm text-gray-400">Turn your head slowly right</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setLivenessComplete(!livenessComplete)}
                                    className={`px-8 py-3 rounded-full font-semibold transition-all ${livenessComplete
                                            ? 'bg-white/10 hover:bg-white/20'
                                            : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90'
                                        }`}
                                >
                                    {livenessComplete ? 'Redo Verification' : 'Start Liveness Check'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 4 && (
                        <div className="animate-slide-up">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                <CheckCircleIcon />
                                Review & Submit
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Document Uploaded</p>
                                            <p className="text-sm text-gray-400">{uploadedFile?.name || 'document.jpg'}</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 text-sm">Complete</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Selfie Captured</p>
                                            <p className="text-sm text-gray-400">Photo verified</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 text-sm">Complete</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Liveness Verified</p>
                                            <p className="text-sm text-gray-400">Anti-spoofing passed</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 text-sm">Complete</span>
                                </div>
                            </div>

                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mb-8">
                                <p className="text-sm text-gray-300">
                                    <strong className="text-indigo-400">Privacy Notice:</strong> Your documents will be encrypted and stored on IPFS.
                                    Only the verification hash will be stored on the blockchain. You maintain full control over your data.
                                </p>
                            </div>

                            <div className="text-center">
                                <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                                    Submit for Verification
                                    <ArrowRightIcon />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${currentStep === 1
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-white/10'
                            }`}
                    >
                        <ArrowLeftIcon />
                        Previous
                    </button>

                    {currentStep < 4 && (
                        <button
                            onClick={nextStep}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${canProceed()
                                    ? 'btn-primary'
                                    : 'bg-white/10 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            Next Step
                            <ArrowRightIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
