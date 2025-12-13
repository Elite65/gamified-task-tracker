import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, Settings, CheckSquare, BookOpen, Clock, LogIn, LogOut, Camera, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useTime } from '../hooks/useTime';
import { avatars, storage, BUCKET_ID } from '../lib/appwrite';
import { ProfileModal } from './ProfileModal';
import { ImageCropper } from './ImageCropper';
import { themes } from '../lib/themes';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, updateGlobalBanner, resetGlobalBanner, currentTheme } = useGame();
    const location = useLocation();
    const currentTime = useTime();
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Global Banner State
    const [globalBannerUrl, setGlobalBannerUrl] = useState<string>('');
    const [isHoveringBanner, setIsHoveringBanner] = useState(false);
    const [croppingBanner, setCroppingBanner] = useState<string | null>(null);

    const activeTheme = themes.find(t => t.id === currentTheme) || themes[0];
    const defaultBanner = activeTheme.defaultBanner || '/default-banner.png';

    useEffect(() => {
        if (user) {
            if (user.prefs?.avatarId) {
                const url = storage.getFileView(BUCKET_ID, user.prefs.avatarId);
                setAvatarUrl(url.toString());
            } else {
                const url = avatars.getInitials(user.name);
                setAvatarUrl(url.toString());
            }

            if (user.prefs?.globalBannerId) {
                const url = storage.getFileView(BUCKET_ID, user.prefs.globalBannerId);
                setGlobalBannerUrl(url.toString());
            } else {
                setGlobalBannerUrl('');
            }
        } else {
            setAvatarUrl('');
            setGlobalBannerUrl('');
        }
    }, [user]);

    const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setCroppingBanner(url);
            e.target.value = '';
        }
    };

    const handleBannerCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], 'global_banner.jpg', { type: 'image/jpeg' });
        await updateGlobalBanner(file);
        setCroppingBanner(null);
    };

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const ProfileSection = () => (
        <button
            onClick={() => user && setIsProfileOpen(true)}
            className="flex items-center gap-3 px-2 hover:bg-white/5 rounded-xl transition-colors py-2 w-full text-left"
        >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center text-black font-bold shrink-0 border border-white/10">
                {user ? (
                    avatarUrl ? (
                        <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                    )
                ) : (
                    <span>SL</span>
                )}
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-lg truncate leading-tight">
                    {user ? user.name : 'Student Life'}
                </span>
                {user && <span className="text-xs text-gray-500 font-mono">Level {user.prefs?.level || 1}</span>}
            </div>
        </button>
    );

    return (
        <div className="flex h-screen bg-tech-bg text-tech-text font-sans selection:bg-tech-primary selection:text-black overflow-hidden">
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {croppingBanner && (
                <ImageCropper
                    imageSrc={croppingBanner || ''}
                    aspectRatio={4} // Wide banner
                    onCropComplete={handleBannerCropComplete}
                    onCancel={() => setCroppingBanner(null)}
                />
            )}

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 border-r border-tech-border bg-tech-surface flex-col p-6 z-20">
                <div className="mb-10">
                    <ProfileSection />
                </div>

                <nav className="flex-1 space-y-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-tech-primary text-black shadow-lg shadow-tech-primary/10'
                                    : 'text-tech-text-secondary hover:bg-tech-surface-hover hover:text-tech-text'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Clock Widget (Mini) */}
                <div className="mt-auto mb-8 p-6 rounded-2xl bg-tech-bg border border-tech-border/50">
                    <div className="flex items-center gap-2 text-tech-text-secondary text-xs mb-2 font-bold tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>TIME</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-tech-text">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-tech-text-secondary mt-1 font-medium">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Sidebar Footer (Auth) */}
                <div className="pt-6 border-t border-tech-border/50">
                    {user ? (
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors w-full px-2 font-bold"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-3 text-tech-primary hover:text-tech-text transition-colors w-full px-2 font-bold"
                        >
                            <LogIn className="w-5 h-5" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative flex flex-col bg-tech-bg">

                {/* Global Banner */}
                {user && (
                    <div
                        className="relative w-full aspect-[1024/329] max-h-[450px] min-h-[150px] shrink-0 group transition-all duration-500 bg-tech-surface"
                        onMouseEnter={() => setIsHoveringBanner(true)}
                        onMouseLeave={() => setIsHoveringBanner(false)}
                    >
                        {globalBannerUrl ? (
                            <img src={globalBannerUrl} alt="Cover" className="w-full h-full object-cover object-center" />
                        ) : (
                            // Default Banner
                            <img src={defaultBanner} alt="Default Cover" className="w-full h-full object-cover object-center" />
                        )}

                        {/* Banner Controls */}
                        <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-200 ${isHoveringBanner ? 'opacity-100' : 'opacity-0'}`}>

                            {globalBannerUrl && (
                                <button
                                    onClick={resetGlobalBanner}
                                    className="bg-black/60 hover:bg-red-500/80 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm transition-colors border border-white/10 flex items-center gap-2"
                                >
                                    <X className="w-3 h-3" />
                                    Remove
                                </button>
                            )}

                            <label className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-2 backdrop-blur-sm transition-colors border border-white/10">
                                <Camera className="w-3 h-3" />
                                Change Cover
                                <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
                            </label>
                        </div>
                    </div>
                )}

                {/* Mobile Header (Overlay or Below?) - Keeping it below banner for now, but sticky */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-tech-border bg-tech-surface/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="max-w-[200px]">
                        <ProfileSection />
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-mono font-bold leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-gray-500">
                            {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-32 md:pb-0 relative z-10">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-tech-surface border-t border-tech-border px-6 py-4 flex justify-between items-center z-50 safe-area-bottom">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-gray-500'}`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white text-black' : ''}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
