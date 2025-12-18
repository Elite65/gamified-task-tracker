import React, { useMemo } from 'react';
import { Task, HabitLog } from '../types';
import { ChartInfo } from '../pages/StatsPage'; // Reuse the tooltips
import { Activity } from 'lucide-react';

interface ContributionHeatmapProps {
    tasks: Task[];
    habitLogs: HabitLog[];
    primaryColor: string; // The high-contrast 'graphPrimary'
    secondaryColor: string; // The high-contrast 'graphSecondary'
    surfaceColor: string;
    borderColor: string;
    textColor: string;
    textSecondaryColor: string;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
    tasks,
    habitLogs,
    primaryColor,
    secondaryColor,
    surfaceColor,
    borderColor,
    textColor,
    textSecondaryColor
}) => {
    // 1. Dynamic Duration: Grows with user history
    const weeks = useMemo(() => {
        if (tasks.length === 0 && habitLogs.length === 0) return 4; // Start with ~1 Month

        let minTs = new Date().getTime();

        tasks.forEach(t => {
            const dateStr = (t as any).$updatedAt || (t as any).$createdAt;
            if (dateStr) minTs = Math.min(minTs, new Date(dateStr).getTime());
        });

        habitLogs.forEach(h => {
            // h.date is YYYY-MM-DD
            minTs = Math.min(minTs, new Date(h.date).getTime());
        });

        const now = new Date().getTime();
        const diffTime = Math.abs(now - minTs);
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

        // Start with 12 weeks (3 months), grow as time passes (Max 52 for now)
        return Math.min(Math.max(12, diffWeeks + 1), 52);
    }, [tasks, habitLogs]);

    const heatmapData = useMemo(() => {
        const grid = [];
        const today = new Date();
        // Align end date to end of current week (Saturday) or Today? 
        // Let's align so the last column is "This Week".

        // Start date: 
        const endDate = new Date(today);

        // Generate grid (Column-major: Weeks -> Days)
        // Actually, GitHub style is Week Columns, Day Rows (0-6).

        const dataMap = new Map<string, number>();

        // Populate Map
        // Task XP (proxy count)
        tasks.forEach(t => {
            if (t.status === 'COMPLETED') {
                const updated = (t as any).$updatedAt || (t as any).$createdAt;
                if (updated) {
                    const dateStr = updated.substring(0, 10);
                    dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + 1);
                }
            }
        });
        // Habit Logs
        habitLogs.forEach(h => {
            // h.date is YYYY-MM-DD
            dataMap.set(h.date, (dataMap.get(h.date) || 0) + 1);
        });

        // Build 2D Array [Week][Day]
        // We need to start 'weeks' ago from the current Sunday-aligned start.
        // Let's simplify: Generate array of dates for the last (weeks * 7) days.

        const totalDays = weeks * 7;
        const startDate = new Date();
        startDate.setDate(today.getDate() - totalDays);
        // Find the nearest past Sunday to start clean? 
        // Or just show exact last N days? 
        // GitHub aligns columns to weeks.

        // Let's create an array of "Weeks", each containing 7 "Days".
        const resultWeeks = [];

        // Find the Sunday of the week `weeks` ago.
        const startSunday = new Date(today);
        startSunday.setDate(today.getDate() - (today.getDay())); // This Sunday
        startSunday.setDate(startSunday.getDate() - ((weeks - 1) * 7)); // Go back (weeks-1) weeks

        let currentIter = new Date(startSunday);

        for (let w = 0; w < weeks; w++) {
            const weekDays = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = currentIter.toISOString().split('T')[0];
                const count = dataMap.get(dateStr) || 0;

                // Determine Intensity Level (0-4)
                let level = 0;
                if (count > 0) level = 1;
                if (count > 2) level = 2;
                if (count > 4) level = 3;
                if (count > 6) level = 4;

                weekDays.push({
                    date: dateStr,
                    count,
                    level,
                    isFuture: currentIter > today
                });

                currentIter.setDate(currentIter.getDate() + 1);
            }
            resultWeeks.push(weekDays);
        }

        return resultWeeks;

    }, [tasks, habitLogs]);

    const [tooltip, setTooltip] = React.useState<{ date: string, count: number, level: number, x: number, y: number } | null>(null);

    return (
        <div className="rounded-3xl border p-6 flex flex-col shadow-lg transition-colors duration-500 relative h-full"
            style={{ backgroundColor: `${surfaceColor}80`, borderColor }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: textColor }}>
                    <Activity className="w-5 h-5" style={{ color: secondaryColor }} />
                    Contribution Matrix
                    <ChartInfo title="Activity Heatmap">
                        <p>Visualizes your daily consistency over the last {weeks} weeks.</p>
                        <p><strong style={{ color: primaryColor }}>Glowing Cells:</strong> Days with completed missions or habit logs.</p>
                        <p className="mt-1">Dark squares mean no activity. Try to fill the grid!</p>
                    </ChartInfo>
                </h3>

                {/* Legend */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: textSecondaryColor }}>
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(level => (
                            <div
                                key={level}
                                className="w-3 h-3 rounded-sm"
                                style={{
                                    backgroundColor: level === 0 ? `${textColor}10` : primaryColor,
                                    opacity: level === 0 ? 1 : (level * 0.25),
                                    boxShadow: level >= 3 ? `0 0 ${level * 3}px ${primaryColor}` : 'none'
                                }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* The Grid */}
            <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2">
                <div className="flex gap-1 min-w-max">
                    {heatmapData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={day.date}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltip({
                                            date: day.date,
                                            count: day.count,
                                            level: day.level,
                                            x: rect.left + (rect.width / 2),
                                            y: rect.top
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    className="w-3 h-3 md:w-4 md:h-4 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer"
                                    style={{
                                        backgroundColor: day.level === 0 ? `${textColor}10` : primaryColor,
                                        opacity: day.level === 0 ? 1 : 0.2 + (day.level * 0.2), // 0.4, 0.6, 0.8, 1.0
                                        boxShadow: day.level >= 3 ? `0 0 10px ${primaryColor}` : 'none',
                                        border: day.level > 0 ? `1px solid ${primaryColor}40` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Tooltip Portal/Overlay */}
            {tooltip && (
                <div
                    className="fixed pointer-events-none z-[100] px-4 py-3 rounded-xl border bg-black/90 backdrop-blur-md shadow-2xl text-xs transform -translate-x-1/2 -translate-y-full mt-[-8px]"
                    style={{
                        top: tooltip.y,
                        left: tooltip.x,
                        borderColor: borderColor,
                        color: textColor
                    }}
                >
                    <div className="font-bold border-b pb-1 mb-2 uppercase tracking-wider opacity-80" style={{ borderColor: `${borderColor}40` }}>{tooltip.date}</div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor, boxShadow: `0 0 8px ${primaryColor}` }}></div>
                        <span className="font-medium text-white">{tooltip.count} Activities</span>
                    </div>
                    {tooltip.count === 0 && <div className="text-[10px] mt-1 text-gray-500 italic">No activity recorded</div>}
                </div>
            )}
        </div>
    );
};
