import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, Settings, CheckSquare, BookOpen, Clock, LogIn, LogOut, Camera, X, Repeat, BarChart2 } from 'lucide-react';
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
        { icon: Repeat, label: 'Habits', path: '/habits' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: BarChart2, label: 'Data', path: '/stats' },
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
        <div
            className="flex h-[100dvh] text-tech-text font-sans selection:bg-tech-primary selection:text-black overflow-hidden transform-gpu"
            style={{ background: 'var(--color-bg)' }}
        >
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
            <aside className="hidden md:flex w-64 border-r border-tech-border bg-tech-surface flex-col z-20 h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 pb-0">
                    <ProfileSection />
                </div>

                <nav className="flex-1 space-y-2 p-6">
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

                <div className="p-6 mt-auto">
                    {/* Clock Widget (Mini) */}
                    <div className="mb-4 p-4 rounded-2xl bg-black/5 border border-tech-border/50">
                        <div className="flex items-center gap-2 text-tech-text-secondary text-xs mb-2 font-bold tracking-wider">
                            <Clock className="w-3 h-3" />
                            <span>TIME</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-tech-text">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-tech-text-secondary mt-1 font-medium uppercase">
                            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Sidebar Footer (Auth) */}
                    <div className="pt-4 border-t border-tech-border/50">
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
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative flex flex-col bg-tech-bg">

                {/* Global Banner */}
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

                {/* Mobile Header Removed to clear space for Modals. 
                    Profile access moved to Bottom Nav. 
                    Clock/Date can be added to Dashboard content if needed.
                */}

                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-48 md:pb-0 relative z-10">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation (Mobile) */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-tech-surface/95 backdrop-blur-xl border border-tech-border rounded-2xl px-2 py-2 flex justify-between items-end z-[90] shadow-2xl safe-area-bottom">

                {/* 1. Dashboard */}
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-tech-primary/10' : ''}`}>
                        <LayoutGrid className="w-6 h-6" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

                {/* 2. Tasks */}
                <Link
                    to="/tasks"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/tasks' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/tasks' ? 'bg-tech-primary/10' : ''}`}>
                        <CheckSquare className="w-6 h-6" strokeWidth={location.pathname === '/tasks' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/tasks' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

                {/* 3. Habits */}
                <Link
                    to="/habits"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/habits' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/habits' ? 'bg-tech-primary/10' : ''}`}>
                        <Repeat className="w-6 h-6" strokeWidth={location.pathname === '/habits' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/habits' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

                {/* 4. CENTER: Profile & Time */}
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex flex-col items-center gap-1 flex-1 relative -top-6"
                >
                    <div className="w-14 h-14 rounded-full p-1 bg-tech-bg border border-tech-border shadow-xl flex items-center justify-center relative z-10 transition-transform active:scale-95">
                        <div className="w-full h-full rounded-full overflow-hidden border border-white/10">
                            {user && avatarUrl ? (
                                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-tech-surface-hover flex items-center justify-center text-sm font-bold text-white">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Time Display Badge */}
                    <div className="bg-tech-surface border border-tech-border px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-tech-primary shadow-sm -mt-2 z-20">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('AM', '').replace('PM', '')}
                    </div>
                </button>

                {/* 5. Courses */}
                <Link
                    to="/courses"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/courses' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/courses' ? 'bg-tech-primary/10' : ''}`}>
                        <BookOpen className="w-6 h-6" strokeWidth={location.pathname === '/courses' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/courses' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

                {/* 6. Data */}
                <Link
                    to="/stats"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/stats' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/stats' ? 'bg-tech-primary/10' : ''}`}>
                        <BarChart2 className="w-6 h-6" strokeWidth={location.pathname === '/stats' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/stats' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

                {/* 5. Settings */}
                <Link
                    to="/settings"
                    className={`flex flex-col items-center gap-1 flex-1 ${location.pathname === '/settings' ? 'text-tech-primary' : 'text-gray-500'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-tech-primary/10' : ''}`}>
                        <Settings className="w-6 h-6" strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
                    </div>
                    {location.pathname === '/settings' && <span className="w-1 h-1 bg-tech-primary rounded-full mb-1" />}
                </Link>

            </nav>
        </div>
    );
};
