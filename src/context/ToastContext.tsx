import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
    onUndo?: () => void;
}

interface ToastContextType {
    showToast: (message: string, options?: { type?: 'success' | 'info' | 'error'; onUndo?: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, options?: { type?: 'success' | 'info' | 'error'; onUndo?: () => void }) => {
        const id = crypto.randomUUID();
        const newToast: Toast = {
            id,
            message,
            type: options?.type || 'info',
            onUndo: options?.onUndo,
        };

        setToasts(prev => [...prev, newToast]);

        // Auto dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto min-w-[300px] bg-tech-surface border border-tech-border p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-400' :
                                        toast.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                                    }`} />
                                <span className="text-sm font-medium">{toast.message}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {toast.onUndo && (
                                    <button
                                        onClick={() => {
                                            toast.onUndo?.();
                                            removeToast(toast.id);
                                        }}
                                        className="text-xs font-bold text-tech-primary hover:underline"
                                    >
                                        UNDO
                                    </button>
                                )}
                                <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
