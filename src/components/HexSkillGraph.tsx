import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useGame } from '../context/GameContext';
import { themes } from '../lib/themes';
import { UserStats } from '../types';

interface HexSkillGraphProps {
    stats: UserStats;
}

export const HexSkillGraph: React.FC<HexSkillGraphProps> = ({ stats }) => {
    const { currentTheme } = useGame();
    const theme = themes.find(t => t.id === currentTheme) || themes[0];

    const data = Object.values(stats.skills).map(skill => ({
        subject: `${skill.name} (Lvl ${skill.level})`,
        A: skill.value,
        fullMark: 100,
    }));

    // Ensure we have at least 3 points for a polygon
    if (data.length < 3) {
        // Pad with placeholders if less than 3 skills to maintain shape
        while (data.length < 3) {
            data.push({ subject: '', A: 0, fullMark: 100 });
        }
    }

    return (
        <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
                    <PolarGrid stroke={theme.colors.border} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: theme.colors.textSecondary, fontSize: 9, fontFamily: 'Inter' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke={theme.colors.primary}
                        strokeWidth={2}
                        fill={theme.colors.primary}
                        fillOpacity={0.2}
                        isAnimationActive={true}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
