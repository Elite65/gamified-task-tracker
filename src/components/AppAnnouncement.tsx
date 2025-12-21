import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const AppAnnouncement: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const ANNOUNCEMENT_KEY = 'elite65_announce_android_v1';

    useEffect(() => {
        // Check if user has already seen this announcement
        const hasSeen = localStorage.getItem(ANNOUNCEMENT_KEY);
        if (!hasSeen) {
            // Small delay to not overwhelm on immediate load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    };

    const handleGoToSettings = () => {
        handleDismiss();
        navigate('/settings');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-tech-surface border border-tech-border p-6 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Decorator */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-tech-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-tech-bg rounded-2xl border border-tech-border inline-flex">
                                <Smartphone className="w-8 h-8 text-tech-primary" />
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="p-2 hover:bg-tech-bg rounded-full transition-colors text-tech-text-secondary"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold mb-2 text-tech-text relative z-10">
                            Mobile App Live!
                        </h2>
                        <p className="text-tech-text-secondary mb-6 relative z-10">
                            Experience Elite65 natively on Android. Cleaner interface, full-screen mode, and better performance.
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-tech-bg border border-tech-border hover:bg-tech-border/50 transition-colors text-tech-text-secondary"
                            >
                                LATER
                            </button>
                            <button
                                onClick={handleGoToSettings}
                                className="flex-[2] py-3 px-4 rounded-xl font-bold text-sm bg-tech-primary text-black hover:bg-tech-primary/80 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                GET IT NOW
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
