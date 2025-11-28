import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Calendar, Settings, CheckSquare, BookOpen, Clock, LogIn, LogOut } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useTime } from '../hooks/useTime';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useGame();
    const location = useLocation();
    const currentTime = useTime();

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-tech-bg text-white font-sans selection:bg-white selection:text-black overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 border-r border-tech-border bg-tech-surface/50 flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">
                        SL
                    </div>
                    <span className="font-bold text-lg">Student Life</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-white text-black font-medium shadow-lg shadow-white/5'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Clock Widget (Mini) */}
                <div className="mt-auto mb-6 p-4 rounded-xl bg-black/20 border border-tech-border">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                        <Clock className="w-3 h-3" />
                        <span>TIME</span>
                    </div>
                    <div className="text-2xl font-mono font-bold">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>

                {/* Sidebar Footer (Auth) */}
                <div className="pt-6 border-t border-tech-border">
                    {user ? (
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full px-2"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-bold">Logout</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-3 text-tech-primary hover:text-white transition-colors w-full px-2"
                        >
                            <LogIn className="w-5 h-5" />
                            <span className="font-bold">Login</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative pb-32 md:pb-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
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
