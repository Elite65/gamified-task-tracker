import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Settings, RefreshCw, Save, AlertTriangle, LogOut, LogIn } from 'lucide-react';
import { UserStats } from '../types';

export const SettingsPage: React.FC = () => {
    const { user, userStats, resetStats, setStats, logout } = useGame();
    const [editedStats, setEditedStats] = useState<UserStats>(userStats);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

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

    const handleSave = () => {
        setStats(editedStats);
        setIsEditing(false);
    };

    const handleReset = () => {
        resetStats();
        setEditedStats(userStats); // Sync local state
        setConfirmReset(false);
    };

    return (
        <div className="h-full flex flex-col max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                    <Settings className="w-6 h-6 text-tech-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">System Settings</h1>
                    <p className="text-gray-400">Manage your profile and data.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Stats Management Section */}
                <div className="bg-tech-surface border border-tech-border rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Stats Configuration
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => { setIsEditing(true); setEditedStats(userStats); }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
                            >
                                EDIT STATS
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSave}
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
                        <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-tech-border/50">
                            <h3 className="font-mono text-gray-400 text-xs uppercase">Core Metrics</h3>
                            <div>
                                <label className="block text-sm font-bold mb-1">Level</label>
                                <input
                                    type="number"
                                    disabled={!isEditing}
                                    value={isEditing ? editedStats.level : userStats.level}
                                    onChange={e => setEditedStats(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                    className="w-full bg-black/30 border border-tech-border rounded p-2 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">XP</label>
                                <input
                                    type="number"
                                    disabled={!isEditing}
                                    value={isEditing ? editedStats.xp : userStats.xp}
                                    onChange={e => setEditedStats(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                                    className="w-full bg-black/30 border border-tech-border rounded p-2 disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-tech-border/50">
                            <h3 className="font-mono text-gray-400 text-xs uppercase">Skill Matrix (0-100)</h3>
                            {Object.entries(userStats.skills).map(([skill, data]) => (
                                <div key={skill} className="flex items-center gap-4">
                                    <label className="w-24 text-sm font-medium text-gray-300">{skill}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        disabled={!isEditing}
                                        value={isEditing ? editedStats.skills[skill].value : data.value}
                                        onChange={e => handleStatChange(skill, parseInt(e.target.value))}
                                        className="flex-1 accent-tech-primary"
                                    />
                                    <span className="w-8 text-right text-sm font-mono">
                                        {isEditing ? Math.round(editedStats.skills[skill].value) : Math.round(data.value)}
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
                        <p className="text-sm text-gray-500 mb-4">Irreversible actions regarding your progress data.</p>
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
                                    className="px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors"
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

                ```javascript
                import React, {useState} from 'react';
                import {useGame} from '../context/GameContext';
                import {Settings, RefreshCw, Save, AlertTriangle, LogOut, LogIn} from 'lucide-react';
                import {UserStats} from '../types';
                import {Link} from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const {userStats, resetStats, setStats, logout, user} = useGame();
                const [editedStats, setEditedStats] = useState<UserStats>(userStats);
                    const [isEditing, setIsEditing] = useState(false);
                    const [confirmReset, setConfirmReset] = useState(false);

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

    const handleSave = () => {
                        setStats(editedStats);
                    setIsEditing(false);
    };

    const handleReset = () => {
                        resetStats();
                    setEditedStats(userStats); // Sync local state
                    setConfirmReset(false);
    };

                    return (
                    <div className="h-full flex flex-col max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-tech-surface rounded-xl border border-tech-border">
                                <Settings className="w-6 h-6 text-tech-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">System Settings</h1>
                                <p className="text-gray-400">Manage your profile and data.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Stats Management Section */}
                            <div className="bg-tech-surface border border-tech-border rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5" />
                                        Stats Configuration
                                    </h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => { setIsEditing(true); setEditedStats(userStats); }}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            EDIT STATS
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                onClick={handleSave}
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
                                    <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-tech-border/50">
                                        <h3 className="font-mono text-gray-400 text-xs uppercase">Core Metrics</h3>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Level</label>
                                            <input
                                                type="number"
                                                disabled={!isEditing}
                                                value={isEditing ? editedStats.level : userStats.level}
                                                onChange={e => setEditedStats(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                                className="w-full bg-black/30 border border-tech-border rounded p-2 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">XP</label>
                                            <input
                                                type="number"
                                                disabled={!isEditing}
                                                value={isEditing ? editedStats.xp : userStats.xp}
                                                onChange={e => setEditedStats(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                                                className="w-full bg-black/30 border border-tech-border rounded p-2 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-tech-border/50">
                                        <h3 className="font-mono text-gray-400 text-xs uppercase">Skill Matrix (0-100)</h3>
                                        {Object.entries(userStats.skills).map(([skill, data]) => (
                                            <div key={skill} className="flex items-center gap-4">
                                                <label className="w-24 text-sm font-medium text-gray-300">{skill}</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    disabled={!isEditing}
                                                    value={isEditing ? editedStats.skills[skill].value : data.value}
                                                    onChange={e => handleStatChange(skill, parseInt(e.target.value))}
                                                    className="flex-1 accent-tech-primary"
                                                />
                                                <span className="w-8 text-right text-sm font-mono">
                                                    {isEditing ? Math.round(editedStats.skills[skill].value) : Math.round(data.value)}
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
                                    <p className="text-sm text-gray-500 mb-4">Irreversible actions regarding your progress data.</p>
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
                                                className="px-4 py-2 hover:bg-white/10 rounded-lg text-sm transition-colors"
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
                                            className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-red-400 font-bold transition-colors"
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
                    ```
