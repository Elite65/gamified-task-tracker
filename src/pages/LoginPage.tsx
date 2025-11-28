import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { useToast } from '../context/ToastContext';
import { LogIn, ArrowRight, Loader } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await account.createEmailPasswordSession(email, password);
            showToast('Welcome back!', { type: 'success' });
            navigate('/');
            // Force reload to refresh context state (simple way to handle auth change)
            window.location.reload();
        } catch (error: any) {
            showToast(error.message || 'Login failed', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-tech-bg p-4">
            <div className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-tech-primary/10 text-tech-primary mb-4">
                        <LogIn className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">System Login</h1>
                    <p className="text-gray-400">Access your synchronized mission data.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                            placeholder="agent@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-xs text-tech-primary hover:text-white transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Login <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-white font-bold hover:underline">
                        Initialize Identity
                    </Link>
                </div>
            </div>
        </div>
    );
};
