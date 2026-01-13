"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const settingsSections = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "privacy", label: "Privacy", icon: "👁" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "advanced", label: "Advanced", icon: "⚙️" },
];

export default function SettingsPage() {
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
        <div className="min-h-screen pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Settings</span>
                    </h1>
                    <p className="text-white/60 text-lg">
                        Manage your account preferences and security settings
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card rounded-2xl p-2 sticky top-24">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <span className="text-xl">{section.icon}</span>
                                    <span className="font-medium">{section.label}</span>
                                </button>
                            ))}
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
                            <div className="space-y-6">
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-6">Account Information</h2>

                                    {/* Profile */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold">
                                            V
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">VerifyX User</h3>
                                            <p className="text-sm text-white/50">Member since January 2024</p>
                                            <button className="mt-2 text-sm text-violet-400 hover:underline">
                                                Update Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Wallet */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="text-sm text-white/40 mb-1">Connected Wallet</p>
                                                <p className="font-mono">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
                                            </div>
                                            <button className="btn-secondary text-sm py-2 px-4">Disconnect</button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="text-sm text-white/40 mb-1">Decentralized Identity</p>
                                                <p className="font-mono text-sm">did:ethr:0x742d35Cc6634C0532925a3b844Bc454e4438f44e</p>
                                            </div>
                                            <button className="text-violet-400 text-sm hover:underline">Copy</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="glass-card rounded-2xl p-6 border border-red-500/20">
                                    <h2 className="text-xl font-semibold mb-2 text-red-400">Danger Zone</h2>
                                    <p className="text-sm text-white/50 mb-4">
                                        Irreversible actions that affect your account
                                    </p>
                                    <div className="flex gap-4">
                                        <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-sm hover:bg-red-500/20 transition-colors">
                                            Revoke All Credentials
                                        </button>
                                        <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-sm hover:bg-red-500/20 transition-colors">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        {activeSection === "security" && (
                            <div className="space-y-6">
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                                    <div className="space-y-4">
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

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="font-medium mb-1">Auto-Lock Timeout</p>
                                                <p className="text-sm text-white/50">Automatically lock after inactivity</p>
                                            </div>
                                            <select
                                                value={settings.autoLockTimeout}
                                                onChange={(e) => setSettings((s) => ({ ...s, autoLockTimeout: e.target.value }))}
                                                className="bg-[rgba(255, 255, 255, 0.03)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
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

                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-6">Active Sessions</h2>
                                    <div className="space-y-3">
                                        {[
                                            { device: "Chrome on Windows", location: "Mumbai, India", current: true },
                                            { device: "Safari on iPhone", location: "Mumbai, India", current: false },
                                        ].map((session, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                        💻
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {session.device}
                                                            {session.current && (
                                                                <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-white/50">{session.location}</p>
                                                    </div>
                                                </div>
                                                {!session.current && (
                                                    <button className="text-sm text-red-400 hover:underline">Revoke</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy Section */}
                        {activeSection === "privacy" && (
                            <div className="space-y-6">
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>

                                    <div className="space-y-4">
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

                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-4">Data Export</h2>
                                    <p className="text-sm text-white/50 mb-4">
                                        Download a copy of all your data stored on VerifyX
                                    </p>
                                    <button className="btn-secondary">Request Data Export</button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === "notifications" && (
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

                                <div className="space-y-4">
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
                            <div className="glass-card rounded-2xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Appearance</h2>

                                <div className="space-y-4">
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
                            <div className="space-y-6">
                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-6">Advanced Settings</h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="font-medium mb-1">Network</p>
                                                <p className="text-sm text-white/50">Select blockchain network</p>
                                            </div>
                                            <select
                                                className="bg-[#0a0a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                                style={{ backgroundColor: '#0a0a1a' }}
                                            >
                                                <option className="bg-[#0a0a1a] text-white">Ethereum Mainnet</option>
                                                <option className="bg-[#0a0a1a] text-white">Polygon</option>
                                                <option className="bg-[#0a0a1a] text-white">Sepolia Testnet</option>
                                                <option className="bg-[#0a0a1a] text-white">Local Hardhat</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <p className="font-medium mb-1">IPFS Gateway</p>
                                                <p className="text-sm text-white/50">Custom IPFS gateway URL</p>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://ipfs.io"
                                                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm w-48"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold mb-4">Developer Options</h2>
                                    <div className="space-y-4">
                                        <button className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors">
                                            <p className="font-medium mb-1">View Console Logs</p>
                                            <p className="text-sm text-white/50">Debug application issues</p>
                                        </button>
                                        <button className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors">
                                            <p className="font-medium mb-1">Clear Local Storage</p>
                                            <p className="text-sm text-white/50">Reset cached data</p>
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
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
                <p className="font-medium mb-1">{label}</p>
                <p className="text-sm text-white/50">{description}</p>
            </div>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-violet-500" : "bg-white/20"
                    }`}
            >
                <motion.div
                    layout
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </motion.button>
        </div>
    );
}
