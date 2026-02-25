"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";

const settingsSections = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "privacy", label: "Privacy", icon: "👁" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "advanced", label: "Advanced", icon: "⚙️" },
];

export default function SettingsPage() {
    const { address, disconnectWallet, isAuthenticated } = useWeb3();
    const did = address ? `did:ethr:${address}` : "—";
    const [activeSection, setActiveSection] = useState("account");
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        activityAlerts: true,
        marketingEmails: false,
        twoFactorAuth: true,
        biometricAuth: false,
        showWalletAddress: true,
        autoLockTimeout: "15",
        dataSharing: false,
        analytics: true,
        darkMode: true,
        compactView: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
        }));
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8 md:mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">
                        <span className="gradient-text">Settings</span>
                    </h1>
                    <p className="text-white/60 text-sm sm:text-base md:text-lg">
                        Manage your account preferences and security settings
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    {/* Sidebar - Horizontal on mobile, vertical on desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card rounded-xl sm:rounded-2xl p-2 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24">
                            <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                                {settingsSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-left transition-all whitespace-nowrap lg:whitespace-normal lg:w-full ${activeSection === section.id
                                            ? "bg-white/10 text-white"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <span className="text-lg sm:text-xl">{section.icon}</span>
                                        <span className="font-medium text-sm sm:text-base">{section.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {/* Account Section */}
                        {activeSection === "account" && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Account Information</h2>

                                    {/* Profile */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0">
                                            V
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold mb-1">VerifyX User</h3>
                                            <p className="text-xs sm:text-sm text-white/50">Member since January 2024</p>
                                            <button className="mt-2 text-xs sm:text-sm text-violet-400 hover:underline">
                                                Update Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Wallet */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm text-white/40 mb-1">Connected Wallet</p>
                                                <p className="font-mono text-xs sm:text-sm break-all">
                                                    {address ?? "Not connected"}
                                                </p>
                                            </div>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={disconnectWallet}
                                                    className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4 flex-shrink-0 w-full sm:w-auto text-center"
                                                >
                                                    Disconnect
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm text-white/40 mb-1">Decentralized Identity</p>
                                                <p className="font-mono text-xs break-all">{did}</p>
                                            </div>
                                            {address && (
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(did)}
                                                    className="text-violet-400 text-xs sm:text-sm hover:underline flex-shrink-0"
                                                >
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-500/20">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-2 text-red-400">Danger Zone</h2>
                                    <p className="text-xs sm:text-sm text-white/50 mb-4">
                                        Irreversible actions that affect your account
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <button className="px-3 sm:px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-red-500/20 transition-colors">
                                            Revoke All Credentials
                                        </button>
                                        <button className="px-3 sm:px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg sm:rounded-xl text-xs sm:text-sm hover:bg-red-500/20 transition-colors">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === "security" && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Security Settings</h2>

                                    <div className="space-y-3 sm:space-y-4">
                                        <SettingToggle
                                            label="Two-Factor Authentication"
                                            description="Require signature verification for sensitive actions"
                                            enabled={settings.twoFactorAuth}
                                            onToggle={() => toggleSetting("twoFactorAuth")}
                                        />

                                        <SettingToggle
                                            label="Biometric Authentication"
                                            description="Use fingerprint or face ID when available"
                                            enabled={settings.biometricAuth}
                                            onToggle={() => toggleSetting("biometricAuth")}
                                        />

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                            <div>
                                                <p className="font-medium text-sm sm:text-base mb-1">Auto-Lock Timeout</p>
                                                <p className="text-xs sm:text-sm text-white/50">Automatically lock after inactivity</p>
                                            </div>
                                            <select
                                                value={settings.autoLockTimeout}
                                                onChange={(e) => setSettings((s) => ({ ...s, autoLockTimeout: e.target.value }))}
                                                className="bg-[#0a0a1a] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white w-full sm:w-auto"
                                            >
                                                <option value="5" className="bg-[#0a0a1a] text-white">5 minutes</option>
                                                <option value="15" className="bg-[#0a0a1a] text-white">15 minutes</option>
                                                <option value="30" className="bg-[#0a0a1a] text-white">30 minutes</option>
                                                <option value="60" className="bg-[#0a0a1a] text-white">1 hour</option>
                                                <option value="never" className="bg-[#0a0a1a] text-white">Never</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Active Sessions</h2>
                                    <div className="space-y-3">
                                        {[
                                            { device: "Chrome on Windows", location: "Mumbai, India", current: true },
                                            { device: "Safari on iPhone", location: "Mumbai, India", current: false },
                                        ].map((session, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                                                        💻
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm sm:text-base flex flex-wrap items-center gap-2">
                                                            {session.device}
                                                            {session.current && (
                                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-white/50">{session.location}</p>
                                                    </div>
                                                </div>
                                                {!session.current && (
                                                    <button className="text-xs sm:text-sm text-red-400 hover:underline self-end sm:self-center">Revoke</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy Section */}
                        {activeSection === "privacy" && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Privacy Settings</h2>

                                    <div className="space-y-3 sm:space-y-4">
                                        <SettingToggle
                                            label="Show Wallet Address"
                                            description="Display your wallet address in your profile"
                                            enabled={settings.showWalletAddress}
                                            onToggle={() => toggleSetting("showWalletAddress")}
                                        />

                                        <SettingToggle
                                            label="Data Sharing"
                                            description="Allow anonymous data sharing for service improvement"
                                            enabled={settings.dataSharing}
                                            onToggle={() => toggleSetting("dataSharing")}
                                        />

                                        <SettingToggle
                                            label="Analytics"
                                            description="Help us improve by sending usage analytics"
                                            enabled={settings.analytics}
                                            onToggle={() => toggleSetting("analytics")}
                                        />
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Data Export</h2>
                                    <p className="text-xs sm:text-sm text-white/50 mb-4">
                                        Download a copy of all your data stored on VerifyX
                                    </p>
                                    <button className="btn-secondary text-sm w-full sm:w-auto">Request Data Export</button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === "notifications" && (
                            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Notification Preferences</h2>

                                <div className="space-y-3 sm:space-y-4">
                                    <SettingToggle
                                        label="Email Notifications"
                                        description="Receive important updates via email"
                                        enabled={settings.emailNotifications}
                                        onToggle={() => toggleSetting("emailNotifications")}
                                    />

                                    <SettingToggle
                                        label="Push Notifications"
                                        description="Get real-time browser notifications"
                                        enabled={settings.pushNotifications}
                                        onToggle={() => toggleSetting("pushNotifications")}
                                    />

                                    <SettingToggle
                                        label="Activity Alerts"
                                        description="Notify when someone verifies your credentials"
                                        enabled={settings.activityAlerts}
                                        onToggle={() => toggleSetting("activityAlerts")}
                                    />

                                    <SettingToggle
                                        label="Marketing Emails"
                                        description="Receive news and product updates"
                                        enabled={settings.marketingEmails}
                                        onToggle={() => toggleSetting("marketingEmails")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Appearance Section */}
                        {activeSection === "appearance" && (
                            <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Appearance</h2>

                                <div className="space-y-3 sm:space-y-4">
                                    <SettingToggle
                                        label="Dark Mode"
                                        description="Use dark theme (recommended)"
                                        enabled={settings.darkMode}
                                        onToggle={() => toggleSetting("darkMode")}
                                    />

                                    <SettingToggle
                                        label="Compact View"
                                        description="Show more content with smaller spacing"
                                        enabled={settings.compactView}
                                        onToggle={() => toggleSetting("compactView")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Advanced Section */}
                        {activeSection === "advanced" && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Advanced Settings</h2>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                            <div>
                                                <p className="font-medium text-sm sm:text-base mb-1">Network</p>
                                                <p className="text-xs sm:text-sm text-white/50">Select blockchain network</p>
                                            </div>
                                            <select
                                                className="bg-[#0a0a1a] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white w-full sm:w-auto"
                                            >
                                                <option className="bg-[#0a0a1a] text-white">Ethereum Mainnet</option>
                                                <option className="bg-[#0a0a1a] text-white">Polygon</option>
                                                <option className="bg-[#0a0a1a] text-white">Sepolia Testnet</option>
                                                <option className="bg-[#0a0a1a] text-white">Local Hardhat</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
                                            <div>
                                                <p className="font-medium text-sm sm:text-base mb-1">IPFS Gateway</p>
                                                <p className="text-xs sm:text-sm text-white/50">Custom IPFS gateway URL</p>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://ipfs.io"
                                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm w-full sm:w-48"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Developer Options</h2>
                                    <div className="space-y-3 sm:space-y-4">
                                        <button className="w-full p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl text-left hover:bg-white/10 transition-colors">
                                            <p className="font-medium text-sm sm:text-base mb-1">View Console Logs</p>
                                            <p className="text-xs sm:text-sm text-white/50">Debug application issues</p>
                                        </button>
                                        <button className="w-full p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl text-left hover:bg-white/10 transition-colors">
                                            <p className="font-medium text-sm sm:text-base mb-1">Clear Local Storage</p>
                                            <p className="text-xs sm:text-sm text-white/50">Reset cached data</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function SettingToggle({
    label,
    description,
    enabled,
    onToggle,
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl gap-3">
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">{label}</p>
                <p className="text-xs sm:text-sm text-white/50">{description}</p>
            </div>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className={`relative w-11 sm:w-12 h-6 sm:h-7 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-violet-500" : "bg-white/20"
                    }`}
            >
                <motion.div
                    layout
                    className="absolute top-1 left-1 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full"
                    animate={{ x: enabled ? 18 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </motion.button>
        </div>
    );
}
