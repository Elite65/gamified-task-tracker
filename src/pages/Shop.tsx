import React from 'react';
import { useGame } from '../context/GameContext';
import { themes } from '../lib/themes';
import { Coins, Check, ShoppingCart, Lock, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const Shop = () => {
    const { userStats, buyItem, currentTheme, setTheme } = useGame();

    const handlePurchase = async (themeId: string, price: number) => {
        const success = await buyItem(themeId, price);
        if (success) {
            // Optional: Auto-equip on buy? logic not enforced here, let user choose.
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in" style={{ paddingBottom: '100px' }}>

            {/* Header / Wallet */}
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-amber-500" />
                        THE ARMORY
                    </h1>
                    <p className="text-zinc-400 mt-1">Acquire new visual protocols and enhancements.</p>
                </div>

                <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <Coins className="w-6 h-6 text-amber-400" />
                    <span className="text-2xl font-bold text-amber-100">{userStats.credits || 0}</span>
                    <span className="text-sm text-amber-500/80 font-medium tracking-wider">CREDITS</span>
                </div>
            </div>

            {/* Themes Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-zinc-100">Visual Themes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map((theme) => {
                        const isOwned = userStats.inventory?.includes(theme.id) || theme.price === 0;
                        const isEquipped = currentTheme === theme.id;
                        const canAfford = (userStats.credits || 0) >= theme.price;

                        return (
                            <motion.div
                                key={theme.id}
                                whileHover={{ scale: 1.02 }}
                                className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-300 ${isEquipped
                                        ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                        : 'border-zinc-800 hover:border-zinc-700'
                                    } bg-zinc-900/80`}
                            >
                                {/* Preview Banner / Header */}
                                <div className="h-32 w-full relative overflow-hidden">
                                    {/* Use theme preview or fallback gradient constructed from theme colors */}
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{
                                            background: theme.colors.background.includes('url') ? theme.colors.background : `linear-gradient(45deg, ${theme.colors.background}, ${theme.colors.surface})`
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

                                    <div className="absolute bottom-4 left-4">
                                        <h3 className="text-xl font-bold text-white">{theme.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            {Object.values(theme.colors).slice(4, 7).map((c, i) => (
                                                <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Body / Actions */}
                                <div className="p-5 flex justify-between items-center">
                                    <div className="text-sm">
                                        {isOwned ? (
                                            <span className="text-green-400 font-medium flex items-center gap-1">
                                                <Check className="w-4 h-4" /> OWNED
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
                                                <Coins className="w-4 h-4" />
                                                {theme.price}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {isEquipped ? (
                                            <button disabled className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-bold border border-green-500/20 cursor-default">
                                                EQUIPPED
                                            </button>
                                        ) : isOwned ? (
                                            <button
                                                onClick={() => setTheme(theme.id)}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700"
                                            >
                                                EQUIP
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePurchase(theme.id, theme.price)}
                                                disabled={!canAfford}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${canAfford
                                                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                                                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                {canAfford ? 'UNLOCK' : <><Lock className="w-3 h-3" /> LOCKED</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Shop;
