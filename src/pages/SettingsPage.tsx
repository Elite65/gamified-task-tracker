import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Settings, RefreshCw, Save, AlertTriangle, LogOut, LogIn, Palette, Download, Smartphone, Laptop, ChevronDown, ChevronUp } from 'lucide-react';
import { UserStats } from '../types';
import { themes } from '../lib/themes';

export const SettingsPage: React.FC = () => {
    const { user, userStats, resetStats, setStats, updateProfile, logout, currentTheme, setTheme } = useGame();
    const [editedStats, setEditedStats] = useState<UserStats>(userStats);
    const [isEditingStats, setIsEditingStats] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    // Profile Editing State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // PWA Install State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isDownloadExpanded, setIsDownloadExpanded] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallPWA = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleStatChange = (skill: string, value: number) => {
        setEditedStats(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [skill]: {
                    ...prev.skills[skill],
                    value: Math.min(100, Math.max(0, value))
                }
            }
        }));
    };

    const handleSaveStats = () => {
        setStats(editedStats);
        setIsEditingStats(false);
    };

    const handleReset = () => {
        resetStats();
        setEditedStats(userStats); // Sync local state
        setConfirmReset(false);
    };

    const handleSaveProfile = async () => {
        if (profileName) {
            await updateProfile(profileName, avatarFile || undefined);
            setIsEditingProfile(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-3xl mx-auto text-tech-text pb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                    <Settings className="w-6 h-6 text-tech-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">System Settings</h1>
                    <p className="text-tech-text-secondary">Manage your profile and data.</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* --- 1. DOWNLOAD CENTER (NEW - Collapsible) --- */}
                <div className="bg-tech-surface border border-tech-border rounded-3xl overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setIsDownloadExpanded(!isDownloadExpanded)}
                        className="w-full p-8 flex items-center justify-between hover:bg-tech-surface-hover/50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-tech-bg rounded-xl border border-tech-border">
                                <Download className="w-6 h-6 text-tech-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Install Application
                                </h2>
                                <p className="text-sm text-tech-text-secondary">
                                    Get the native experience for Android & Desktop
                                </p>
                            </div>
                        </div>
                        {isDownloadExpanded ? (
                            <ChevronUp className="w-6 h-6 text-tech-text-secondary" />
                        ) : (
                            <ChevronDown className="w-6 h-6 text-tech-text-secondary" />
                        )}

                        {/* Background Decorator */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Download className="w-32 h-32" />
                        </div>
                    </button>

                    {isDownloadExpanded && (
                        <div className="p-8 pt-0 animate-in slide-in-from-top-4 fade-in duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                {/* Option 1: Desktop PWA */}
                                <div className="p-4 bg-tech-bg/50 border border-tech-border rounded-xl flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-tech-primary font-bold">
                                        <Laptop className="w-5 h-5" />
                                        <span>Desktop / PWA</span>
                                    </div>
                                    <p className="text-xs text-tech-text-secondary">
                                        Install as a standalone app on Windows, Mac, or Linux. Updates instantly.
                                    </p>
                                    <button
                                        onClick={handleInstallPWA}
                                        disabled={!deferredPrompt}
                                        className={`mt-auto w-full py-2 rounded-lg font-bold text-sm transition-all ${deferredPrompt
                                            ? 'bg-tech-primary text-black hover:bg-tech-primary/80'
                                            : 'bg-tech-border/20 text-tech-text-secondary border border-tech-border cursor-not-allowed'
                                            }`}
                                    >
                                        {deferredPrompt ? 'INSTALL APP' : 'INSTALLED / UNSUPPORTED'}
                                    </button>
                                </div>

                                {/* Option 2: Android APK */}
                                <div className="p-4 bg-tech-bg/50 border border-tech-border rounded-xl flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-green-400 font-bold">
                                        <Smartphone className="w-5 h-5" />
                                        <span>Android</span>
                                    </div>
                                    <p className="text-xs text-tech-text-secondary">
                                        Download the Native APK Wrapper. Supports home screen installation.
                                    </p>
                                    <a
                                        href="https://github.com/Elite65/gamified-task-tracker/releases/download/v1.0.0/Elite65.apk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-auto w-full py-2 bg-green-500/10 border border-green-500/50 text-green-400 hover:bg-green-500/20 rounded-lg font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        DOWNLOAD APK (v1.0)
                                    </a>
                                </div>

                                {/* Option 3: iOS */}
                                <div className="p-4 bg-tech-bg/50 border border-tech-border rounded-xl flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-gray-300 font-bold">
                                        <span className="text-xl"></span>
                                        <span>iOS / Apple</span>
                                    </div>
                                    <p className="text-xs text-tech-text-secondary">
                                        Apple does not support direct downloads. Use the browser features.
                                    </p>
                                    <div className="mt-auto p-2 bg-tech-surface-hover rounded text-xs text-center border border-tech-border/50">
                                        Tap <span className="font-bold">Share</span> <br />
                                        then <span className="font-bold">"Add to Home Screen"</span>
                                    </div>
                                </div>
                            </div>

                            {/* Debugging Tool */}
                            <div className="mt-4 pt-4 border-t border-tech-border flex justify-center">
                                <button
                                    onClick={() => {
                                        if ('serviceWorker' in navigator && 'Notification' in window) {
                                            Notification.requestPermission().then(perm => {
                                                if (perm === 'granted') {
                                                    navigator.serviceWorker.ready.then(reg => {
                                                        reg.showNotification("🚨 Test Notification", {
                                                            body: "If you see this, the system is working!",
                                                            icon: '/icon-192.png',
                                                            vibrate: [200, 100, 200]
                                                        } as any);
                                                    });
                                                } else {
                                                    alert("Permission denied! Check System Settings -> Apps -> Elite65 -> Notifications");
                                                }
                                            });
                                        } else {
                                            alert("Notifications not supported in this environment");
                                        }
                                    }}
                                    className="text-xs text-tech-text-secondary underline hover:text-tech-primary transition-colors"
                                >
                                    Test Notification System
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Appearance Section */}
                <div className="bg-tech-surface border border-tech-border rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Appearance
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme.id)}
                                className={`p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${currentTheme === theme.id
                                    ? 'border-tech-primary ring-1 ring-tech-primary'
                                    : 'border-tech-border hover:border-tech-primary/50'
                                    }`}
                                style={{ background: theme.colors.background }}
                            >
                                {/* Theme Preview */}
                                <div className="flex gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-full border border-tech-border/20" style={{ background: theme.colors.primary }}></div>
                                    <div className="w-6 h-6 rounded-full border border-tech-border/20" style={{ background: theme.colors.secondary }}></div>
                                    <div className="w-6 h-6 rounded-full border border-tech-border/20" style={{ background: theme.colors.surface }}></div>
                                </div>
                                <span className="font-bold block" style={{ color: theme.colors.text }}>{theme.name}</span>
                                {currentTheme === theme.id && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tech-primary"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Management Section */}
                <div className="bg-tech-surface border border-tech-border rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Stats Configuration
                        </h2>
                        {!isEditingStats ? (
                            <button
                                onClick={() => { setIsEditingStats(true); setEditedStats(userStats); }}
                                className="px-4 py-2 bg-tech-surface-hover hover:bg-tech-border rounded-lg text-sm font-bold transition-colors"
                            >
                                EDIT STATS
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditingStats(false)}
                                    className="px-4 py-2 hover:bg-tech-surface-hover rounded-lg text-sm transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSaveStats}
                                    className="flex items-center gap-2 px-4 py-2 bg-tech-primary text-black rounded-lg text-sm font-bold hover:bg-tech-primary/80 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    SAVE CHANGES
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Level & XP */}
                        <div className="space-y-4 p-4 bg-tech-bg/50 rounded-xl border border-tech-border/50">
                            <h3 className="font-mono text-tech-text-secondary text-xs uppercase">Core Metrics</h3>
                            <div>
                                <label className="block text-sm font-bold mb-1">Level</label>
                                <input
                                    type="number"
                                    disabled={!isEditingStats}
                                    value={isEditingStats ? editedStats.level : userStats.level}
                                    onChange={e => setEditedStats(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                    className="w-full bg-tech-bg border border-tech-border rounded p-2 disabled:opacity-50 text-tech-text"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">XP</label>
                                <input
                                    type="number"
                                    disabled={!isEditingStats}
                                    value={isEditingStats ? editedStats.xp : userStats.xp}
                                    onChange={e => setEditedStats(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                                    className="w-full bg-tech-bg border border-tech-border rounded p-2 disabled:opacity-50 text-tech-text"
                                />
                            </div>
                        </div>



                        {/* Skills */}
                        <div className="space-y-4 p-4 bg-tech-bg/50 rounded-xl border border-tech-border/50">
                            <h3 className="font-mono text-tech-text-secondary text-xs uppercase">Skill Matrix (0-100)</h3>
                            {Object.entries(userStats.skills).map(([skill, data]) => (
                                <div key={skill} className="flex items-center gap-4">
                                    <label className="w-24 text-sm font-medium text-tech-text-secondary">{skill}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        disabled={!isEditingStats}
                                        value={isEditingStats ? editedStats.skills[skill].value : data.value}
                                        onChange={e => handleStatChange(skill, parseInt(e.target.value))}
                                        className="flex-1 accent-tech-primary"
                                    />
                                    <span className="w-8 text-right text-sm font-mono text-tech-text">
                                        {isEditingStats ? Math.round(editedStats.skills[skill].value) : Math.round(data.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-8 pt-6 border-t border-tech-border/50">
                        <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Danger Zone
                        </h3>
                        <p className="text-sm text-tech-text-secondary mb-4">Irreversible actions regarding your progress data.</p>
                        {confirmReset ? (
                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
                                <p className="text-red-400 font-bold text-sm">ARE YOU SURE?</p>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-sm font-bold transition-colors"
                                >
                                    YES, WIPE EVERYTHING
                                </button>
                                <button
                                    onClick={() => setConfirmReset(false)}
                                    className="px-4 py-2 hover:bg-tech-surface-hover rounded-lg text-sm transition-colors"
                                >
                                    CANCEL
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmReset(true)}
                                className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors"
                            >
                                RESET ALL PROGRESS
                            </button>
                        )}
                    </div>
                </div>


                {/* Account Actions */}
                <div className="bg-tech-surface border border-tech-border rounded-3xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Account Actions
                    </h2>

                    <div className="flex flex-col gap-4">
                        {user ? (
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-tech-surface-hover hover:bg-tech-border border border-tech-border rounded-xl text-red-400 font-bold transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                LOGOUT
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-tech-primary text-black rounded-xl font-bold hover:bg-tech-primary/80 transition-colors"
                            >
                                <LogIn className="w-5 h-5" />
                                LOGIN / SYNC
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
