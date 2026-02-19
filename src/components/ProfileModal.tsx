import React, { useState, useEffect } from 'react';
import { X, Camera, Save, Edit2, Trophy, Star, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { avatars, storage, BUCKET_ID } from '../lib/appwrite';
import { ImageCropper } from './ImageCropper';
import { EditSkillsModal } from './EditSkillsModal';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, userStats, updateProfile } = useGame();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');
    const [editBanner, setEditBanner] = useState<File | null>(null);
    const [previewBannerUrl, setPreviewBannerUrl] = useState<string>('');
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string>('');
    const [showSkillEditor, setShowSkillEditor] = useState(false);

    // Cropping State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [croppingType, setCroppingType] = useState<'avatar' | 'banner' | null>(null);

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setEditName(user.name);
            setEditAvatar(null);
            setPreviewUrl('');
            setEditBanner(null);
            setPreviewBannerUrl('');
            setIsEditing(false);
            setCroppingImage(null);
            setCroppingType(null);

            // Fetch current avatar URL
            if (user.prefs?.avatarId) {
                const url = storage.getFileView(BUCKET_ID, user.prefs.avatarId);
                setCurrentAvatarUrl(url.toString());
            } else {
                const url = avatars.getInitials(user.name);
                setCurrentAvatarUrl(url.toString());
            }

            // Fetch current banner URL
            if (user.prefs?.bannerId) {
                const url = storage.getFileView(BUCKET_ID, user.prefs.bannerId);
                setCurrentBannerUrl(url.toString());
            } else {
                setCurrentBannerUrl('');
            }
        }
    }, [isOpen]); // Only run when modal opens

    if (!isOpen || !user) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setCroppingImage(url);
            setCroppingType('avatar');
            // Reset input value to allow selecting same file again
            e.target.value = '';
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setCroppingImage(url);
            setCroppingType('banner');
            // Reset input value
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File([croppedBlob], 'cropped_image.jpg', { type: 'image/jpeg' });
        const url = URL.createObjectURL(croppedBlob);

        if (croppingType === 'avatar') {
            setEditAvatar(file);
            setPreviewUrl(url);
        } else if (croppingType === 'banner') {
            setEditBanner(file);
            setPreviewBannerUrl(url);
        }

        setCroppingImage(null);
        setCroppingType(null);
    };

    const handleSave = async () => {
        try {
            await updateProfile(editName, editAvatar || undefined, editBanner || undefined);
            setIsEditing(false);
        } catch (e) {
            console.error('ProfileModal: Save failed', e);
        }
        // URL cleanup is handled by useEffect re-running or component unmounting
    };

    // Calculate progress to next level
    const xpProgress = (userStats.xp / userStats.nextLevelXp) * 100;

    return (
        <>
            {croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    aspectRatio={croppingType === 'avatar' ? 1 : 5.25} // 1:1 for avatar, 5.25:1 for banner (matches h-32 w-2xl)
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setCroppingImage(null);
                        setCroppingType(null);
                    }}
                />
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 text-tech-text">
                <div className="bg-tech-surface border border-tech-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-tech-primary/10">

                    {/* Header / Cover */}
                    <div className="relative h-32 bg-tech-surface-hover overflow-hidden group">
                        {(previewBannerUrl || currentBannerUrl) ? (
                            <img src={previewBannerUrl || currentBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-tech-primary/20 via-purple-500/20 to-blue-500/20" />
                        )}

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {isEditing && (
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Camera className="w-6 h-6 text-white" />
                                <span className="ml-2 text-white font-bold">Change Banner</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                            </label>
                        )}
                    </div>

                    {/* Profile Content */}
                    <div className="px-8 pb-32 -mt-16 flex-1 overflow-y-auto custom-scrollbar relative z-10">

                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl border-4 border-tech-surface bg-tech-bg overflow-hidden shadow-xl">
                                    <img
                                        src={previewUrl || currentAvatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer rounded-3xl border-4 border-transparent transition-colors hover:bg-black/70">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                                <div className="absolute -bottom-3 -right-3 bg-tech-surface border border-tech-border p-2 rounded-xl shadow-lg flex flex-col items-center min-w-[60px]">
                                    <span className="text-[10px] text-tech-text-secondary font-bold uppercase">Level</span>
                                    <span className="text-xl font-bold text-tech-primary">{userStats.level}</span>
                                </div>
                            </div>

                            <div className="flex-1 pt-16 md:pt-16 mt-2 w-full">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="text-3xl font-bold bg-tech-bg border border-tech-border rounded-lg px-3 py-1 w-full focus:outline-none focus:border-tech-primary text-tech-text"
                                                placeholder="Your Name"
                                            />
                                        ) : (
                                            <h2 className="text-3xl font-bold">{user.name}</h2>
                                        )}
                                        <p className="text-tech-text-secondary flex items-center gap-2 mt-1">
                                            <Trophy className="w-4 h-4 text-yellow-500" />
                                            Total XP: {userStats.xp} / {userStats.nextLevelXp}
                                        </p>
                                    </div>

                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-2 hover:bg-tech-surface-hover rounded-lg text-tech-text-secondary hover:text-tech-text transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 hover:bg-tech-surface-hover rounded-lg text-sm font-bold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="px-4 py-2 bg-tech-primary text-black rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-tech-primary/80"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* XP Bar */}
                                <div className="mt-6">
                                    <div className="flex justify-between text-xs font-bold text-tech-text-secondary mb-1">
                                        <span>PROGRESS TO LEVEL {userStats.level + 1}</span>
                                        <span>{Math.round(xpProgress)}%</span>
                                    </div>
                                    <div className="h-2 bg-tech-surface-hover rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-tech-primary to-purple-500 transition-all duration-500"
                                            style={{ width: `${xpProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills Grid */}
                        <div className="mt-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-tech-primary" />
                                    Skill Mastery
                                </h3>
                                <button
                                    onClick={() => setShowSkillEditor(true)}
                                    className="text-xs text-tech-primary hover:underline flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Manage Skills
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(userStats.skills).map(([skillName, skillData]) => (
                                    <div key={skillName} className="bg-tech-bg/50 border border-tech-border/50 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-tech-surface flex items-center justify-center border border-tech-border">
                                            <Star className="w-5 h-5 text-tech-text-secondary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold">{skillName}</span>
                                                <span className="text-xs font-mono text-tech-primary">Lvl {skillData.level}</span>
                                            </div>
                                            <div className="h-1.5 bg-tech-surface-hover rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-tech-secondary"
                                                    style={{ width: `${Math.min(100, skillData.value)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <EditSkillsModal
                isOpen={showSkillEditor}
                onClose={() => setShowSkillEditor(false)}
                currentSkills={userStats.skills}
                onSave={useGame().updateSkills}
            />
        </>
    );
};
