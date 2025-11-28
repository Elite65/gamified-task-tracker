import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { useToast } from '../context/ToastContext';
import { UserPlus, ArrowRight, Loader } from 'lucide-react';
import { ID } from 'appwrite';
import { INITIAL_STATS } from '../types';

export const SignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Account
            const userId = ID.unique();
            await account.create(userId, email, password, name);

            // 2. Login immediately
            await account.createEmailPasswordSession(email, password);

            // 3. Initialize User Stats in DB (Try/Catch in case DB isn't set up yet)
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.USER_STATS,
                    userId, // Use User ID as Document ID for 1:1 mapping
                    {
                        ...INITIAL_STATS,
                        skills: JSON.stringify(INITIAL_STATS.skills) // Appwrite doesn't support nested JSON objects easily, stringify for safety
                    }
                );
            } catch (dbError) {
                console.warn('Could not initialize stats in DB. DB might not exist yet.', dbError);
            }

            showToast('Identity Initialized!', { type: 'success' });
            navigate('/');
            window.location.reload();
        } catch (error: any) {
            showToast(error.message || 'Signup failed', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-tech-bg p-4">
            <div className="w-full max-w-md bg-tech-surface border border-tech-border rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-tech-primary/10 text-tech-primary mb-4">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">New Identity</h1>
                    <p className="text-gray-400">Begin your journey.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-black/20 border border-tech-border rounded-xl p-3 focus:border-white outline-none transition-colors"
                            placeholder="Agent Name"
                            required
                        />
                    </div>
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
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Initialize <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-bold hover:underline">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
