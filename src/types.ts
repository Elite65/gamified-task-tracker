export type TaskStatus = 'YET_TO_START' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

export type EisenhowerQuadrant = 'q1-do' | 'q2-plan' | 'q3-delegate' | 'q4-eliminate';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    difficulty: Difficulty;
    quadrant?: EisenhowerQuadrant;
    skills: string[]; // e.g., ['Focus', 'Coding']
    trackerId: string;
    createdAt: number;
    dueDate?: number; // Timestamp
    endTime?: number; // Timestamp or duration
}

export interface Tracker {
    id: string;
    name: string;
    type: 'daily' | 'assignment' | 'project' | 'habit';
    themeColor: string; // Hex code or Tailwind class
    icon: string; // Lucide icon name
}

export type HabitType = 'TIME' | 'QUANTITY';

export interface Habit {
    id: string;
    userId: string;
    title: string;
    type: HabitType;
    goalAmount: number; // e.g. 15 (mins) or 10 (pages)
    unit: string; // e.g. 'mins', 'pages', 'liters'
    startDate: number; // Timestamp
    durationDays: number;
    carryOver: boolean;
    themeColor: string;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
    value: number; // Amount completed
}

export interface SkillStats {
    name: string;
    value: number; // 0-100 for the hex graph
    level: number;
}

export interface UserStats {
    level: number;
    xp: number;
    nextLevelXp: number;
    skills: Record<string, SkillStats>; // e.g., "Focus": { name: "Focus", value: 50, level: 5 }
    streak: number;
    lastLogin: string;
}

export const INITIAL_STATS: UserStats = {
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    streak: 0,
    lastLogin: new Date().toISOString(),
    skills: {
        Intelligence: { name: 'Intelligence', value: 0, level: 1 },
        Endurance: { name: 'Endurance', value: 0, level: 1 },
        Focus: { name: 'Focus', value: 0, level: 1 },
        Creativity: { name: 'Creativity', value: 0, level: 1 },
        Speed: { name: 'Speed', value: 0, level: 1 },
        Precision: { name: 'Precision', value: 0, level: 1 },
    }
};
