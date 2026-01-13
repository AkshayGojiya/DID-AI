"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Icons
const QRIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    </svg>
);

const ShareIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// Mock credentials data
const credentials = [
    {
        id: "cred-001",
        type: "Identity Verification",
        status: "verified",
        issuedDate: "2024-01-10",
        expiryDate: "2025-01-10",
        issuer: "VerifyX",
        attributes: {
            fullName: true,
            dateOfBirth: true,
            nationality: true,
            documentNumber: true,
            address: false,
        },
        hash: "0x7a2d...f44e",
        txHash: "0xabc123...def456",
    },
    {
        id: "cred-002",
        type: "Document Verification",
        status: "verified",
        issuedDate: "2024-01-12",
        expiryDate: "2025-01-12",
        issuer: "VerifyX",
        attributes: {
            documentType: true,
            documentId: true,
            issuingAuthority: true,
            validityPeriod: true,
        },
        hash: "0x3b4c...e55a",
        txHash: "0xdef789...ghi012",
    },
];

const selectableAttributes = [
    { id: "fullName", label: "Full Name", description: "Your legal name as on documents" },
    { id: "dateOfBirth", label: "Date of Birth", description: "Your date of birth" },
    { id: "nationality", label: "Nationality", description: "Your country of citizenship" },
    { id: "documentNumber", label: "Document Number", description: "ID document number" },
    { id: "address", label: "Address", description: "Your residential address" },
    { id: "email", label: "Email", description: "Your verified email address" },
    { id: "phone", label: "Phone", description: "Your verified phone number" },
];

export default function CredentialsPage() {
    const [selectedCredential, setSelectedCredential] = useState(credentials[0]);
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>(["fullName", "nationality"]);
    const [showQRModal, setShowQRModal] = useState(false);

    const toggleAttribute = (attrId: string) => {
        setSelectedAttributes(prev =>
            prev.includes(attrId)
                ? prev.filter(id => id !== attrId)
                : [...prev, attrId]
        );
    };

    const qrData = JSON.stringify({
        did: "did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        credentialId: selectedCredential.id,
        attributes: selectedAttributes,
        timestamp: Date.now(),
        signature: "mock_signature_here",
    });

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

                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/dashboard" className="nav-link">Dashboard</Link>
                            <Link href="/verify" className="nav-link">Verify</Link>
                            <Link href="/credentials" className="nav-link text-white">Credentials</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-sm">0x742d...f44e</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="gradient-text">Your Credentials</span>
                    </h1>
                    <p className="text-gray-400">Manage and share your verified credentials with selective disclosure</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Credentials List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Verified Credentials</h3>

                        {credentials.map((cred) => (
                            <button
                                key={cred.id}
                                onClick={() => setSelectedCredential(cred)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedCredential.id === cred.id
                                        ? 'glass-card border-indigo-500/50'
                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium">{cred.type}</h4>
                                    <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">Issued: {cred.issuedDate}</p>
                                <p className="text-xs text-gray-500 mt-1">Expires: {cred.expiryDate}</p>
                            </button>
                        ))}

                        <Link
                            href="/verify"
                            className="block w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 text-center transition-all duration-300"
                        >
                            <span className="text-gray-400">+ Add New Credential</span>
                        </Link>
                    </div>

                    {/* Credential Details & QR Generation */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6 rounded-2xl mb-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">{selectedCredential.type}</h2>
                                    <p className="text-gray-400 text-sm">
                                        Credential ID: <code className="bg-white/5 px-2 py-1 rounded">{selectedCredential.id}</code>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View on blockchain">
                                        <EyeIcon />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download">
                                        <DownloadIcon />
                                    </button>
                                </div>
                            </div>

                            {/* Credential Info */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Issuer</p>
                                    <p className="font-medium">{selectedCredential.issuer}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="font-medium text-emerald-400">Active</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Issued Date</p>
                                    <p className="font-medium">{selectedCredential.issuedDate}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                                    <p className="font-medium">{selectedCredential.expiryDate}</p>
                                </div>
                            </div>

                            {/* Blockchain Info */}
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <p className="text-xs text-indigo-400 mb-2">Blockchain Verification</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Credential Hash:</span>
                                    <code className="text-indigo-300">{selectedCredential.hash}</code>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-400">Transaction:</span>
                                    <code className="text-indigo-300">{selectedCredential.txHash}</code>
                                </div>
                            </div>
                        </div>

                        {/* Selective Disclosure */}
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-1">Selective Disclosure</h3>
                                    <p className="text-gray-400 text-sm">Choose which attributes to share</p>
                                </div>
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <QRIcon />
                                    Generate QR
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3">
                                {selectableAttributes.map((attr) => (
                                    <button
                                        key={attr.id}
                                        onClick={() => toggleAttribute(attr.id)}
                                        className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 text-left ${selectedAttributes.includes(attr.id)
                                                ? 'bg-indigo-500/20 border border-indigo-500/50'
                                                : 'bg-white/5 border border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedAttributes.includes(attr.id)
                                                ? 'bg-indigo-500'
                                                : 'bg-white/10'
                                            }`}>
                                            {selectedAttributes.includes(attr.id) && <CheckIcon />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{attr.label}</p>
                                            <p className="text-xs text-gray-500">{attr.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <p className="text-sm text-amber-300">
                                    <strong>Tip:</strong> Only select the attributes you need to share.
                                    Your other data remains private and is never exposed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowQRModal(false)}
                    />

                    <div className="relative glass-card p-8 rounded-2xl max-w-md w-full animate-scale-in">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-semibold mb-2 text-center">Share Your Credentials</h3>
                        <p className="text-gray-400 text-sm text-center mb-6">
                            Scan this QR code to verify the selected attributes
                        </p>

                        <div className="bg-white p-4 rounded-xl mb-6">
                            <QRCodeSVG
                                value={qrData}
                                size={280}
                                level="H"
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-2">Sharing the following attributes:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedAttributes.map((attr) => (
                                    <span key={attr} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                                        {selectableAttributes.find(a => a.id === attr)?.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                <DownloadIcon />
                                Download
                            </button>
                            <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                                <ShareIcon />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
