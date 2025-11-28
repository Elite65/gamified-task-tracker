import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowRight, Loader, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            showToast('Invalid recovery link', { type: 'error' });
            navigate('/login');
        }
    }, [userId, secret, navigate, showToast]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('Passwords do not match', { type: 'error' });
            return;
        }
        if (password.length < 8) {
            showToast('Password must be at least 8 characters', { type: 'error' });
            return;
        }

        setLoading(true);
        try {
            if (userId && secret) {
                await account.updateRecovery(userId, secret, password, confirmPassword);
                setSuccess(true);
                showToast('Password reset successfully!', { type: 'success' });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to reset password', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-tech-bg p-4">
            <div className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-tech-primary/10 text-tech-primary mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Secure Access</h1>
                    <p className="text-gray-400">Establish new security credentials.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Update Credentials <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-xl text-green-400 flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8" />
                            <p className="font-bold">Password Updated</p>
                        </div>
                        <p className="text-sm text-gray-400">
                            Redirecting to login sequence...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
