import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';

interface HexSkillGraphProps {
    stats: UserStats;
}

export const HexSkillGraph: React.FC<HexSkillGraphProps> = ({ stats }) => {
    const data = Object.values(stats.skills).map(skill => ({
        subject: skill.name,
        A: skill.value,
        fullMark: 100,
    }));

    return (
        <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#333333" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#888888', fontSize: 10, fontFamily: 'Inter' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#ffffff"
                        strokeWidth={2}
                        fill="#ffffff"
                        fillOpacity={0.1}
                        isAnimationActive={true}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
