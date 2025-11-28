import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowRight, Loader, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // The redirect URL should point to the reset password page
            const redirectUrl = `${window.location.origin}/reset-password`;
            await account.createRecovery(email, redirectUrl);
            setSubmitted(true);
            showToast('Recovery email sent!', { type: 'success' });
        } catch (error: any) {
            showToast(error.message || 'Failed to send recovery email', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-tech-bg p-4">
            <div className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-tech-primary/10 text-tech-primary mb-4">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Recovery Protocol</h1>
                    <p className="text-gray-400">Initiate identity restoration sequence.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleResetRequest} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                                placeholder="agent@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Send Recovery Link <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-xl text-green-400">
                            <p className="font-bold">Transmission Successful</p>
                            <p className="text-sm mt-1">Check your inbox for the recovery link.</p>
                        </div>
                        <p className="text-sm text-gray-400">
                            If you don't see it, check your spam folder or try again.
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
