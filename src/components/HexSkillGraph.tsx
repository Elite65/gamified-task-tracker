import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useGame } from '../context/GameContext';
import { themes } from '../lib/themes';
import { UserStats } from '../types';

interface HexSkillGraphProps {
    stats: UserStats;
    color?: string;
    strokeWidth?: number;
    fillOpacity?: number;
}

export const HexSkillGraph: React.FC<HexSkillGraphProps> = ({ stats, color, strokeWidth = 2, fillOpacity = 0.2 }) => {
    const { currentTheme } = useGame();
    const theme = themes.find(t => t.id === currentTheme) || themes[0];

    if (!stats || !stats.skills) return null;

    const data = Object.values(stats.skills).map(skill => {
        // Calculate total score: (Level - 1) * 100 + current progress
        // This ensures the graph grows outwards as you level up, instead of collapsing on reset.
        const totalScore = ((skill.level - 1) * 100) + skill.value;
        return {
            subject: `${skill.name}`,
            levelLabel: `Lvl ${skill.level}`,
            A: totalScore,
            fullMark: 100,
        };
    });

    // Calculate dynamic domain max
    // Find the highest score among all skills to scale the graph appropriately
    const maxScore = Math.max(...data.map(d => d.A));
    // Round up to nearest 100 to represent the next "Level Cap" boundary
    // Ensure minimum is 100 (Level 1 cap)
    const domainMax = Math.max(100, Math.ceil(maxScore / 100) * 100);

    // Ensure we have at least 3 points for a polygon
    if (data.length < 3) {
        // Pad with placeholders if less than 3 skills to maintain shape
        while (data.length < 3) {
            data.push({ subject: '', levelLabel: '', A: 0, fullMark: 100 });
        }
    }

    return (
        <div className="w-full h-full relative outline-none focus:outline-none ring-0">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke={theme.colors.border} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={({ payload, x, y, textAnchor, stroke, radius }) => {
                            const dataPoint = data.find(d => d.subject === payload.value);
                            return (
                                <g className="recharts-layer recharts-polar-angle-axis-tick">
                                    <text
                                        x={x}
                                        y={y}
                                        dy={0}
                                        textAnchor={textAnchor}
                                        fill={theme.colors.textSecondary}
                                        fontSize={10}
                                        fontFamily="Inter"
                                        fontWeight="bold"
                                    >
                                        {payload.value}
                                        <tspan x={x} dy={12} fontSize={9} fill={theme.colors.primary} textAnchor={textAnchor}>
                                            {dataPoint?.levelLabel}
                                        </tspan>
                                    </text>
                                </g>
                            );
                        }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke={color || theme.colors.primary}
                        strokeWidth={strokeWidth}
                        fill={color || theme.colors.primary}
                        fillOpacity={fillOpacity}
                        isAnimationActive={true}
                        activeDot={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
