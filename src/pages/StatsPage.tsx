import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useTime } from '../hooks/useTime';
import { themes } from '../lib/themes';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, ReferenceLine, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Activity, TrendingUp, Target, Hexagon, Layers, Zap, Flame, CalendarClock, Info, Clock } from 'lucide-react';
import { HexSkillGraph } from '../components/HexSkillGraph';
import { ContributionHeatmap } from '../components/ContributionHeatmap';

// Upgraded ChartInfo to support Title + Rich Content + Positioning + Alignment
export const ChartInfo: React.FC<{ title: string; children: React.ReactNode; placement?: 'top' | 'bottom'; align?: 'center' | 'right' }> = ({ title, children, placement = 'top', align = 'center' }) => (
    <div className="group/info relative flex items-center ml-2 z-10">
        <Info className="w-4 h-4 text-gray-500 hover:text-white cursor-help transition-colors" />
        <div className={`absolute w-72 p-4 rounded-xl bg-black/95 border border-white/10 text-xs text-gray-300 shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 backdrop-blur-md ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
            }`}>
            <div className="font-bold text-white mb-2 uppercase tracking-wider border-b border-white/10 pb-1">{title}</div>
            <div className="space-y-2 leading-relaxed">
                {children}
            </div>
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-8 border-transparent ${placement === 'top' ? 'top-full border-t-black/95' : 'bottom-full border-b-black/95'
                } ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0.5 mr-[3px]'
                }`}></div>
        </div>
    </div>
);

export const StatsPage: React.FC = () => {
    // Re-enabled useTime for smooth, controlled "breathing" animation
    const { tasks, habits, habitLogs, userStats, currentTheme } = useGame();
    const currentTime = useTime();

    // 1. Get Active Theme Colors
    const activeTheme = themes.find(t => t.id === currentTheme) || themes[0];
    const { primary, secondary, text, textSecondary, surface, border, background } = activeTheme.colors;

    // Helper to determine if theme is "light" (for visibility adjustments)
    const isLightTheme = ['soft-autumn', 'spring-shower', 'frigid-winter'].includes(currentTheme);

    // --- Graph Visibility Overrides (Strictly for Charts, leaving UI themes untouched) ---
    const { graphPrimary, graphSecondary, graphStrokeWidth, graphFillOpacity } = useMemo(() => {
        const p = activeTheme.colors.primary;
        const s = activeTheme.colors.secondary;
        const defaultWidth = isLightTheme ? 3 : 2;
        const defaultOpacity = 0.2;

        switch (currentTheme) {
            case 'frigid-winter': // Fix similar blues (Steel vs Ice Blue)
                return { graphPrimary: '#455A64', graphSecondary: '#29B6F6', graphStrokeWidth: 3, graphFillOpacity: 0.4 };
            case 'forest-flow': // Fix invisible dark green (Use Neon Green)
                return { graphPrimary: p, graphSecondary: '#22C55E', graphStrokeWidth: defaultWidth, graphFillOpacity: defaultOpacity };
            case 'cold-nights': // Fix invisible dark blue (Use Cyan)
                return { graphPrimary: '#FFFFFF', graphSecondary: '#818CF8', graphStrokeWidth: 3, graphFillOpacity: 0.5 }; // White, Thick, High Opacity
            case 'eclipse-skies': // Fix invisible dark purple (Use Bright Lavender)
                return { graphPrimary: '#D8B4FE', graphSecondary: '#E879F9', graphStrokeWidth: 3, graphFillOpacity: defaultOpacity };
            case 'soft-autumn': // Fix Tan on Tan (Use Dark Brown)
                return { graphPrimary: '#5D4037', graphSecondary: '#A1887F', graphStrokeWidth: 3, graphFillOpacity: defaultOpacity };
            default:
                return { graphPrimary: p, graphSecondary: s, graphStrokeWidth: defaultWidth, graphFillOpacity: defaultOpacity };
        }
    }, [currentTheme, activeTheme, isLightTheme]);

    const chartOpacity = isLightTheme ? 0.5 : 0.2; // More transparent to prevent occlusion
    const strokeWidth = isLightTheme ? 3 : 2;

    // --- Data Prep ---

    // 1. Task Status (Donut)
    // Memoized to prevent unnecessary re-calcs, but Status doesn't animate so it's fine.
    const statusData = useMemo(() => [
        { name: 'To Do', value: tasks.filter(t => t.status === 'YET_TO_START').length, color: textSecondary },
        { name: 'Started', value: tasks.filter(t => t.status === 'STARTED').length, color: secondary },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: primary },
        { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, color: '#4ade80' },
    ].filter(d => d.value > 0), [tasks, textSecondary, secondary, primary]);

    // 2. Difficulty (Bar)
    const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3, 'EPIC': 4 };
    const difficultyData = useMemo(() => Object.entries(
        tasks.reduce((acc, task) => {
            acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    )
        .sort(([a], [b]) => difficultyOrder[a as keyof typeof difficultyOrder] - difficultyOrder[b as keyof typeof difficultyOrder])
        .map(([name, value]) => ({ name, value })), [tasks]);

    // 3. Skill/Tag Frequency (Training Focus)
    const skillData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            if (t.skills) {
                t.skills.forEach(s => {
                    counts[s] = (counts[s] || 0) + 1;
                });
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10
    }, [tasks]);

    // 4. Chronotype (Time of Day)
    const chronotypeData = useMemo(() => {
        const buckets = { 'Morning': 0, 'Afternoon': 0, 'Evening': 0, 'Night': 0 };

        tasks.forEach(t => {
            if (t.status === 'COMPLETED') {
                const ts = (t as any).$updatedAt || (t as any).$createdAt || t.createdAt;
                const date = new Date(ts);
                const hour = date.getHours();

                if (hour >= 5 && hour < 12) buckets['Morning']++;
                else if (hour >= 12 && hour < 17) buckets['Afternoon']++;
                else if (hour >= 17 && hour < 22) buckets['Evening']++;
                else buckets['Night']++;
            }
        });

        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }, [tasks]);

    // 5. XP / Activity Trend (Wave) - STRICT REAL DATA
    const evolutionData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            // Format YYYY-MM-DD
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

            // 1. Real Habit XP for this day
            const dailyLogs = habitLogs.filter(l => l.date === dateStr);
            const dailyHabitScore = dailyLogs.length * 10;

            // 2. Real Task XP for this day (using $updatedAt as proxy for completion time)
            let dailyTaskXP = 0;
            const xpValues = { 'EASY': 10, 'MEDIUM': 25, 'HARD': 50, 'EPIC': 100 };

            tasks.forEach(t => {
                if (t.status === 'COMPLETED') {
                    // Check if $updatedAt matches this date. Appwrite ISO string: "2023-12-18T..."
                    // Cast to any because $updatedAt comes from DB but isn't on strict Task type
                    const updatedAt = (t as any).$updatedAt || (t as any).$createdAt;
                    if (updatedAt && updatedAt.substring(0, 10) === dateStr) {
                        dailyTaskXP += (xpValues[t.difficulty] || 10);
                    }
                }
            });

            return {
                name: dayLabel,
                xp: dailyTaskXP, // Raw XP gained that day
                habits: dailyHabitScore,
            };
        });
    }, [userStats.xp, habitLogs, tasks]);

    // Helper: Calculate Streak based on logs
    // Helper: Calculate Streak based on logs
    const calculateStreak = (habitId: string, goalAmount: number, logs: typeof habitLogs) => {
        // Filter logs generally for this habit
        const habitLogsForId = logs.filter(l => l.habitId === habitId);

        // Filter logs that MEET THE GOAL
        // Note: logs should be unique by date based on context logic, but if not, logic holds for 'best entry' or we'd need to sum. 
        // Assuming strict 'value' replaces previous.
        const validLogs = habitLogsForId.filter(l => l.value >= goalAmount);

        if (validLogs.length === 0) return 0;

        // Sort logs descending
        const sortedDates = [...new Set(validLogs.map(l => l.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if there's a log for today or yesterday to keep streak alive
        const latestLogDate = new Date(sortedDates[0]);
        latestLogDate.setHours(0, 0, 0, 0);

        const diffDays = (today.getTime() - latestLogDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays > 1) return 0; // Streak broken if no valid log today or yesterday

        // Count backwards
        for (let i = 0; i < sortedDates.length; i++) {
            const current = new Date(sortedDates[i]);
            current.setHours(0, 0, 0, 0);

            const expected = new Date(latestLogDate);
            expected.setDate(expected.getDate() - i);
            expected.setHours(0, 0, 0, 0);

            if (current.getTime() === expected.getTime()) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    // 4. Habit Streaks (All Habits, Sorted by Streak)
    const streakData = useMemo(() => habits
        .map(h => ({ name: h.title, streak: calculateStreak(h.id, h.goalAmount, habitLogs) })) // Pass goalAmount
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 6) // Show top 6
        , [habits, habitLogs]);

    // 5. Weekly Focus (Activity by Day of Week) - REAL DATA FROM LOGS
    const weeklyFocusData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts = Array(7).fill(0);

        const getLocalDay = (dateStr: string) => {
            // Parse YYYY-MM-DD as local, not UTC
            if (!dateStr) return -1;
            const parts = dateStr.split('-');
            if (parts.length < 3) return new Date(dateStr).getDay(); // Fallback

            // Create date using local year, month, day
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return d.getDay();
        };

        habitLogs.forEach(log => {
            const dayIndex = getLocalDay(log.date);
            if (dayIndex >= 0) {
                counts[dayIndex]++;
            }
        });

        // Also count Tasks
        tasks.forEach(t => {
            if (t.status === 'COMPLETED') {
                const ts = (t as any).$updatedAt || (t as any).$createdAt || t.createdAt;
                const d = new Date(ts);
                if (!isNaN(d.getTime())) {
                    counts[d.getDay()]++;
                }
            }
        });

        // Show real data (even if 0s)
        return days.map((day, idx) => ({
            name: day,
            value: counts[idx]
        }));
    }, [habitLogs, tasks]);


    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: background, borderColor: border, color: text }} className="border p-3 rounded-xl shadow-2xl bg-opacity-95 backdrop-blur-md z-50">
                    <p className="font-bold mb-2 uppercase text-xs tracking-wider border-b pb-1" style={{ borderColor: border }}>{label}</p>
                    {payload.map((p: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke }}></span>
                            <span style={{ color: textSecondary }}>{p.name}:</span>
                            <span className="font-mono font-bold" style={{ color: text }}>{p.value.toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-24 md:pb-0 animate-in fade-in duration-700 h-full overflow-y-auto custom-scrollbar p-2">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 tracking-tight" style={{ color: text }}>
                        <Zap className="w-10 h-10 fill-current" style={{ color: primary, filter: `drop-shadow(0 0 10px ${primary})` }} />
                        ANALYTICS
                    </h1>
                    <p style={{ color: textSecondary }} className="mt-1 font-medium tracking-wide">PERFORMANCE METRICS</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-lg border backdrop-blur-sm shadow-lg" style={{ borderColor: border, backgroundColor: `${surface}90` }}>
                        <div className="text-xs uppercase font-bold text-right opacity-70" style={{ color: textSecondary }}>Total XP</div>
                        <div className="text-2xl font-mono font-black text-right" style={{ color: primary, textShadow: `0 0 20px ${primary}40` }}>
                            {userStats.xp.toLocaleString()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. Main Evolution Wave Chart (Span 8) */}
                <div className="lg:col-span-8 rounded-3xl border relative group shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    {/* Glass/Glow Background Effect - Stronger for visibility */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: primary }}></div>
                    </div>

                    <div className="p-6 h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: text }}>
                                <TrendingUp className="w-5 h-5" />
                                Activity Wave
                                <ChartInfo title="Live Performance Feed" placement="bottom">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-bold text-[10px] uppercase opacity-70 mb-1">How To Read</p>
                                            <p>This wave visualizes your performance flow over the last 7 days. Higher peaks mean higher productivity.</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[10px] uppercase opacity-70 mb-1">Metrics</p>
                                            <p><strong style={{ color: primary }}>Primary Line (XP):</strong> Shows raw output and task completions.</p>
                                            <p><strong style={{ color: secondary }}>Secondary Line (Habits):</strong> Shows consistency and routine adherence.</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[10px] uppercase opacity-70 mb-1">XP Rewards</p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] opacity-90">
                                                <div className="flex justify-between"><span>Easy</span><span className="font-mono font-bold">10 XP</span></div>
                                                <div className="flex justify-between"><span>Medium</span><span className="font-mono font-bold">25 XP</span></div>
                                                <div className="flex justify-between"><span>Hard</span><span className="font-mono font-bold">50 XP</span></div>
                                                <div className="flex justify-between"><span>Epic</span><span className="font-mono font-bold">100 XP</span></div>
                                                <div className="flex justify-between col-span-2 mt-1 pt-1 border-t border-white/10">
                                                    <span>Habit Log</span><span className="font-mono font-bold text-tech-secondary">5 XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ChartInfo>
                            </h3>
                            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest" style={{ color: textSecondary }}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: graphPrimary, boxShadow: `0 0 10px ${graphPrimary}` }}></span> XP Flow
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: graphSecondary, boxShadow: `0 0 10px ${graphSecondary}` }}></span> Habit Pulse
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                        {/* Use Graph Specific Colors */}
                                        <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={graphPrimary} stopOpacity={chartOpacity} />
                                            <stop offset="100%" stopColor={graphPrimary} stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={graphSecondary} stopOpacity={chartOpacity} />
                                            <stop offset="100%" stopColor={graphSecondary} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} strokeOpacity={0.5} />
                                    <XAxis dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 10, fontWeight: 'bold' }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {/* Layers: XP first (background), Habits second (foreground) to prevent occlusion */}
                                    <Area
                                        type="monotone"
                                        dataKey="xp"
                                        stroke={graphPrimary}
                                        fill="url(#gradientPrimary)"
                                        strokeWidth={strokeWidth}
                                        filter="url(#glow)"
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="habits"
                                        stroke={graphSecondary}
                                        fill="url(#gradientSecondary)"
                                        strokeWidth={strokeWidth}
                                        filter="url(#glow)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 2. Mission Status Ring (Span 4) */}
                <div className="lg:col-span-4 rounded-3xl border p-6 flex flex-col relative overflow-hidden shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: text }}>
                        <Target className="w-5 h-5" style={{ color: primary }} />
                        Mission Status
                        <ChartInfo title="Quest Status" placement="bottom" align="right">
                            <p>A breakdown of all your active quests.</p>
                            <p><strong className="text-white">Segments:</strong> Ratio of To Do vs In Progress vs Completed.</p>
                            <p className="text-green-400 mt-1">Goal: Keep 'In Progress' manageable to avoid burnout.</p>
                        </ChartInfo>
                    </h3>

                    <div className="flex-1 relative min-h-[300px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke={surface} // Add stroke for contrast against other segments
                                                strokeWidth={2}
                                                style={{ filter: `drop-shadow(0 0 3px ${entry.color})` }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-50 font-medium" style={{ color: textSecondary }}>No Data Available</div>
                        )}

                        {/* Center Metric */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl font-black tracking-tighter" style={{ color: text, textShadow: `0 0 20px ${surface}` }}>
                                {tasks.length}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: textSecondary }}>Total Missions</span>
                        </div>
                    </div>
                </div>

                {/* --- NEW ROW: Additional Graphs --- */}

                {/* 3. Habit streaks (Span 6) */}
                <div className="lg:col-span-6 rounded-3xl border p-6 min-h-[300px] flex flex-col shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <Flame className="w-5 h-5 text-orange-500" />
                        Top Habit Streaks
                        <ChartInfo title="Consistency Leaderboard">
                            <p>Leaderboard of your best performing habits.</p>
                            <p><strong className="text-[#fb923c]">Top Bar (Orange):</strong> The habit with your longest consecutive streak.</p>
                            <p className="mt-1">Useful for identifying your strongest consistencies.</p>
                        </ChartInfo>
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={streakData}
                                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                                barSize={24}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false} strokeOpacity={0.2} />
                                <XAxis type="number" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: primary, opacity: 0.1, radius: 4 }} />
                                <Bar dataKey="streak" radius={[0, 4, 4, 0]} fill={primary}>
                                    {streakData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 0 ? '#fb923c' : primary} // Highlight top rank
                                            style={{ filter: `drop-shadow(0 0 4px ${index === 0 ? '#fb923c' : primary})` }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Weekly Focus (Span 6) */}
                <div className="lg:col-span-6 rounded-3xl border p-6 min-h-[300px] flex flex-col shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <CalendarClock className="w-5 h-5" style={{ color: secondary }} />
                        Weekly Focus
                        <ChartInfo title="Activity Histogram" align="right">
                            <p>Visualizes your activity by day of the week.</p>
                            <p><strong className="text-white">Peak Bars:</strong> Days where you complete the most tasks or log the most habits.</p>
                            <p className="mt-1">Use this to understand your weekly productivity rhythm.</p>
                        </ChartInfo>
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={weeklyFocusData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                barSize={32}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} strokeOpacity={0.2} />
                                <XAxis dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: secondary, opacity: 0.1, radius: 4 }} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} fill={secondary}>
                                    {weeklyFocusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={secondary}
                                            style={{ filter: `drop-shadow(0 0 4px ${secondary})` }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {/* 5. Skill Radar (Span 4) */}
                <div className="lg:col-span-4 rounded-3xl border p-6 min-h-[350px] shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <Hexagon className="w-5 h-5" style={{ color: secondary }} />
                        Skill Matrix
                        <ChartInfo title="RPG Attribute Map">
                            <p>A visual map of your attributes (Strength, Intelligence, etc.).</p>
                            <p><strong className="text-white">Shape:</strong> The more balanced your tasks (mix of Physical, Mental, Creative), the rounder it becomes.</p>
                            <p className="mt-1 opacity-70">Spiky shapes indicate a focus on one specific area.</p>
                        </ChartInfo>
                    </h3>
                    <div className="h-full max-h-[250px] flex items-center justify-center">
                        <HexSkillGraph
                            stats={userStats}
                            color={graphPrimary}
                            strokeWidth={graphStrokeWidth}
                            fillOpacity={graphFillOpacity}
                        />
                    </div>
                </div>

                {/* 6. Complexity Bars (Span 8) */}
                <div className="lg:col-span-8 rounded-3xl border p-6 min-h-[350px] flex flex-col shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <Layers className="w-5 h-5" style={{ color: '#fb923c' }} />
                        Complexity Distribution
                        <ChartInfo title="Difficulty Analysis" align="right">
                            <p>Shows how "Hard" your current workload is.</p>
                            <p><strong className="text-white">Bars:</strong> Counts how many Easy, Medium, Hard, or Epic quests you have.</p>
                            <p className="mt-1">Ensure you aren't overwhelmed by taking on too many "Epic" missions at once.</p>
                        </ChartInfo>
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={difficultyData}
                                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                                barSize={20} // Thin bars
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false} strokeOpacity={0.2} />
                                <XAxis type="number" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: primary, opacity: 0.1, radius: 4 }} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                    {difficultyData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index % 2 === 0 ? primary : secondary}
                                            style={{ filter: `drop-shadow(0 0 4px ${index % 2 === 0 ? primary : secondary})` }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 7. Contribution Heatmap (Half Width) */}
                <div className="lg:col-span-6 h-full">
                    <ContributionHeatmap
                        tasks={tasks}
                        habitLogs={habitLogs}
                        primaryColor={graphPrimary}
                        secondaryColor={graphSecondary}
                        surfaceColor={surface}
                        borderColor={border}
                        textColor={text}
                        textSecondaryColor={textSecondary}
                    />
                </div>

                {/* 8. Training Focus (Skill Tags) */}
                <div className="lg:col-span-6 rounded-3xl border p-6 min-h-[350px] flex flex-col shadow-lg h-full" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <Zap className="w-5 h-5" style={{ color: secondary }} />
                        Training Focus
                        <ChartInfo title="Skill Frequency">
                            <p>Tracks which tags/skills you use most often.</p>
                            <p><strong style={{ color: secondary }}>Top Bars:</strong> The skills you are "grinding" the most.</p>
                        </ChartInfo>
                    </h3>
                    <div className="flex-1 w-full">
                        {skillData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={skillData}
                                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                                    barSize={24}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false} strokeOpacity={0.2} />
                                    <XAxis type="number" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: secondary, opacity: 0.1, radius: 4 }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {skillData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index < 3 ? graphSecondary : graphPrimary} // Top 3 highlight
                                                style={{ filter: `drop-shadow(0 0 4px ${index < 3 ? graphSecondary : graphPrimary})` }}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center opacity-50 font-medium" style={{ color: textSecondary }}>
                                No skills tagged yet. Add tags to your tasks!
                            </div>
                        )}
                    </div>
                </div>

                {/* 9. Chronotype (Full Width) */}
                <div className="lg:col-span-12 rounded-3xl border p-6 min-h-[300px] flex flex-col shadow-lg" style={{ backgroundColor: `${surface}80`, borderColor: border }}>
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={{ color: text }}>
                        <Clock className="w-5 h-5" style={{ color: primary }} />
                        Chronotype
                        <ChartInfo title="Peak Productivity Hours">
                            <p>Analyzes the time of day you complete the most tasks.</p>
                            <p><strong style={{ color: primary }}>Morning:</strong> 5AM - 12PM | <strong style={{ color: primary }}>Afternoon:</strong> 12PM - 5PM</p>
                            <p><strong style={{ color: primary }}>Evening:</strong> 5PM - 10PM | <strong style={{ color: primary }}>Night:</strong> 10PM - 5AM</p>
                        </ChartInfo>
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chronotypeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} strokeOpacity={0.2} />
                                <XAxis dataKey="name" stroke={textSecondary} tick={{ fill: textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: primary, opacity: 0.1, radius: 4 }} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} fill={primary} barSize={60}>
                                    {chronotypeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={primary}
                                            style={{ filter: `drop-shadow(0 0 4px ${primary})` }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};
