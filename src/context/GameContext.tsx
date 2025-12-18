import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Tracker, UserStats, INITIAL_STATS, TaskStatus, SkillStats, Habit, HabitLog } from '../types';
import { useToast } from './ToastContext';
import { account, databases, DATABASE_ID, COLLECTIONS, storage, BUCKET_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { themes } from '../lib/themes';

interface GameContextType {
    user: any;
    tasks: Task[];
    trackers: Tracker[];
    userStats: UserStats;
    habits: Habit[];
    habitLogs: HabitLog[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTaskStatus: (taskId: string, status: TaskStatus) => void;
    updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    deleteTask: (taskId: string) => void;
    addTracker: (tracker: Omit<Tracker, 'id'>) => void;
    deleteTracker: (trackerId: string) => void;
    resetStats: () => void;
    setStats: (stats: UserStats) => void;
    updateSkills: (newSkills: Record<string, SkillStats>) => void;
    updateProfile: (name: string, avatarFile?: File, bannerFile?: File) => Promise<void>;
    updateGlobalBanner: (file: File) => Promise<void>;
    resetGlobalBanner: () => Promise<void>;
    currentTheme: string;
    setTheme: (themeId: string) => void;
    logout: () => void;
    addHabit: (habit: Omit<Habit, 'id'>) => void;
    updateHabit: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'userId'>>) => void;
    deleteHabit: (habitId: string) => void;
    logHabit: (habitId: string, date: string, value: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

// Helper for safe JSON parsing
const safeParse = (key: string, fallback: any) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined' || item === 'null') return fallback;
        return JSON.parse(item);
    } catch (e) {
        console.warn(`Failed to parse ${key}, using fallback.`, e);
        return fallback;
    }
};

// Fuzzy Step Helper
const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const findBestMatch = (target: string, candidates: string[]) => {
    const matches = candidates.filter(c => isSimilar(c, target));
    if (matches.length === 0) return null;

    return matches.sort((a, b) => {
        const lowerT = target.toLowerCase();
        const lowerA = a.toLowerCase();
        const lowerB = b.toLowerCase();

        // 1. Exact Match
        if (lowerA === lowerT) return -1;
        if (lowerB === lowerT) return 1;

        // 2. Strong Substring (Candidate CONTAINS Target)
        // Prefer "Internships and Future Prep" over "Future Prep"
        const aContainsT = lowerA.includes(lowerT);
        const bContainsT = lowerB.includes(lowerT);

        if (aContainsT && !bContainsT) return -1;
        if (!aContainsT && bContainsT) return 1;

        // 3. Distance (Tie breaker)
        const distA = levenshteinDistance(lowerA, lowerT);
        const distB = levenshteinDistance(lowerB, lowerT);
        return distA - distB;
    })[0];
};

const isSimilar = (a: string, b: string): boolean => {
    const lowerA = a.toLowerCase();
    const lowerB = b.toLowerCase();
    if (lowerA === lowerB) return true;
    // Includes check (e.g. "Coding" vs "Code")
    if ((lowerA.length > 3 && lowerB.length > 3) && (lowerA.includes(lowerB) || lowerB.includes(lowerA))) return true;
    // Fuzzy check (e.g. "Intelligent" vs "Intelligence")
    if (lowerA.length > 3 && lowerB.length > 3) {
        return levenshteinDistance(lowerA, lowerB) <= 3; // Allow 3 typos/diffs
    }
    return false;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load from local storage or use defaults (Initial state)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
    const [userStats, setUserStats] = useState<UserStats>(safeParse('gtt_stats', JSON.parse(JSON.stringify(INITIAL_STATS))));
    const [currentTheme, setCurrentTheme] = useState<string>('default');

    // Apply Theme Colors
    useEffect(() => {
        const theme = themes.find(t => t.id === currentTheme) || themes[0];
        const root = document.documentElement;

        Object.entries(theme.colors).forEach(([key, value]) => {
            // Handle special mapping for background -> --color-bg
            const cssKey = key === 'background' ? 'bg' : key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const cssVar = `--color-${cssKey}`;
            root.style.setProperty(cssVar, value);
        });

        // Ensure calendar-border is set (fallback to border if not explicit)
        if (!theme.colors.calendarBorder) {
            root.style.setProperty('--color-calendar-border', theme.colors.border);
        }
    }, [currentTheme]);

    // 1. Check Auth Status on Mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await account.get();
            setUser(session);
            if (session.prefs?.themeId) {
                setCurrentTheme(session.prefs.themeId);
            }
            await loadCloudData(session.$id);
        } catch (error) {
            // Not logged in, load local data
            loadLocalData();
        } finally {
            setLoading(false);
        }
    };

    const loadLocalData = () => {
        setTasks(safeParse('gtt_tasks', []));
        setTrackers(safeParse('gtt_trackers', [
            { id: '1', name: 'Daily Missions', type: 'daily', themeColor: 'tech-primary', icon: 'Target' },
            { id: '2', name: 'Assignments', type: 'assignment', themeColor: 'tech-secondary', icon: 'BookOpen' }
        ]));
        setHabits(safeParse('gtt_habits', []));
        setHabitLogs(safeParse('gtt_habit_logs', []));
        setUserStats(safeParse('gtt_stats', JSON.parse(JSON.stringify(INITIAL_STATS))));
    };

    const loadCloudData = async (userId: string) => {
        try {
            // Load Tasks
            const tasksRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TASKS, [
                Query.equal('userId', userId)
            ]);
            setTasks(tasksRes.documents.map(doc => {
                const skills = doc.skills || [];
                const quadrantSkill = skills.find((s: string) => s.startsWith('quadrant:'));
                const quadrant = quadrantSkill ? quadrantSkill.split(':')[1] : undefined;
                const cleanSkills = skills.filter((s: string) => !s.startsWith('quadrant:'));
                return { ...doc, id: doc.$id, skills: cleanSkills, quadrant } as any;
            }));

            // Load Trackers
            const trackersRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TRACKERS, [
                Query.equal('userId', userId)
            ]);
            setTrackers(trackersRes.documents.map(doc => ({ ...doc, id: doc.$id } as any)));

            // Load Habits
            const habitsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.HABITS, [
                Query.equal('userId', userId)
            ]);
            setHabits(habitsRes.documents.map(doc => ({ ...doc, id: doc.$id } as any)));

            // Load Habit Logs
            // Note: In a real app we might only load logs for the current month/view to save bandwidth
            // For now, loading all (assuming manageable volume) but we can optimize later
            const logsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.HABIT_LOGS, [
                Query.equal('userId', userId), // Assuming logs have userId, or we filter by habit IDs? Better schema is to have userId on logs too for security rules.
                // If logs don't have userId directly but rely on habitId, logic is complex. Let's assume schema has userId.
            ]);
            setHabitLogs(logsRes.documents.map(doc => ({ ...doc, id: doc.$id } as any)));

            // Load Stats
            try {
                const statsRes = await databases.getDocument(DATABASE_ID, COLLECTIONS.USER_STATS, userId);
                setUserStats({
                    ...statsRes,
                    skills: typeof statsRes.skills === 'string' ? JSON.parse(statsRes.skills) : statsRes.skills
                } as any);
            } catch (e: any) {
                if (e.code === 404) {
                    console.log('Stats not found in cloud, initializing defaults.');
                    setUserStats(JSON.parse(JSON.stringify(INITIAL_STATS)));
                } else {
                    console.error('Failed to load stats:', e);
                    showToast(`Failed to load stats: ${e.message}`, { type: 'error' });
                }
            }

        } catch (error: any) {
            console.error('Failed to load cloud data:', error);
            showToast(`Sync Error: ${error.message}`, { type: 'error' });
            loadLocalData();
        }
    };

    // Persist to local storage (Always backup to local)
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('gtt_tasks', JSON.stringify(tasks));
            localStorage.setItem('gtt_trackers', JSON.stringify(trackers));
            localStorage.setItem('gtt_habits', JSON.stringify(habits));
            localStorage.setItem('gtt_habit_logs', JSON.stringify(habitLogs));
            localStorage.setItem('gtt_stats', JSON.stringify(userStats));
        }
    }, [tasks, trackers, habits, habitLogs, userStats, loading]);

    const logout = async () => {
        await account.deleteSession('current');
        setUser(null);
        loadLocalData(); // Revert to local data or clear? For now, revert to local.
        window.location.href = '/login';
    };

    // --- Actions (Modified to support Cloud) ---

    const gainXp = async (difficulty: string, taskSkills: string[] = [], multiplier: number = 1) => {
        let xpGain = 10;
        let skillGain = 2;

        if (difficulty === 'MEDIUM') { xpGain = 25; skillGain = 5; }
        if (difficulty === 'HARD') { xpGain = 50; skillGain = 10; }
        if (difficulty === 'EPIC') { xpGain = 100; skillGain = 20; }

        xpGain *= multiplier;
        skillGain *= multiplier;

        const newStats = { ...userStats };
        // Deep copy skills to prevent mutation of shared references
        newStats.skills = Object.fromEntries(
            Object.entries(newStats.skills).map(([k, v]) => [k, { ...v }])
        );

        // --- User Level Logic ---
        newStats.xp = newStats.xp + xpGain;

        // Level Up Logic
        if (xpGain > 0) {
            while (newStats.xp >= newStats.nextLevelXp) {
                newStats.level += 1;
                newStats.xp = newStats.xp - newStats.nextLevelXp;
                newStats.nextLevelXp = Math.floor(newStats.nextLevelXp * 1.5);
                showToast(`Level Up! You are now Level ${newStats.level}`, { type: 'success' });
            }
        }
        // Level Down Logic
        else if (xpGain < 0) {
            while (newStats.xp < 0) {
                if (newStats.level > 1) {
                    newStats.level -= 1;
                    // Reverse the growth formula: prevCap = currentCap / 1.5
                    newStats.nextLevelXp = Math.ceil(newStats.nextLevelXp / 1.5);
                    newStats.xp = newStats.nextLevelXp + newStats.xp; // xp is negative, so this subtracts it from the top of previous level
                    showToast(`Level Down... You are back to Level ${newStats.level}`, { type: 'info' });
                } else {
                    newStats.xp = 0; // Cap at 0 for level 1
                    break;
                }
            }
        }

        // --- Skill Level Logic ---
        taskSkills.forEach(skillName => {
            // Case insensitive matching
            const lowerSkillTag = skillName.toLowerCase();

            // Find matching skill in user stats
            // Use findBestMatch to get the closest semantic match
            const allSkills = Object.keys(newStats.skills);
            const matchingSkillKey = findBestMatch(skillName, allSkills);

            if (matchingSkillKey) {
                const currentSkill = newStats.skills[matchingSkillKey];
                let newValue = currentSkill.value + skillGain;
                let newLevel = currentSkill.level;

                // Skill Up Logic
                if (skillGain > 0) {
                    while (newValue >= 100) {
                        newLevel += 1;
                        newValue -= 100;
                    }
                }
                // Skill Down Logic
                else if (skillGain < 0) {
                    while (newValue < 0) {
                        if (newLevel > 1) {
                            newLevel -= 1;
                            newValue += 100;
                        } else {
                            newValue = 0; // Cap at 0 for level 1
                            break;
                        }
                    }
                }

                newStats.skills[matchingSkillKey] = {
                    ...currentSkill,
                    value: newValue,
                    level: newLevel
                };
            }
        });

        setUserStats(newStats);

        // Cloud Sync
        if (user) {
            try {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                    ...newStats,
                    skills: JSON.stringify(newStats.skills)
                });
            } catch (e: any) {
                if (e.code === 404) {
                    try {
                        await databases.createDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                            ...newStats,
                            skills: JSON.stringify(newStats.skills)
                        });
                    } catch (createError: any) {
                        console.error('Failed to create stats', createError);
                        showToast(`Creation Failed: ${createError.message}`, { type: 'error' });
                    }
                } else {
                    console.error('Failed to sync stats', e);
                    showToast(`Sync Failed: ${e.message}`, { type: 'error' });
                }
            }
        }
    };

    const checkAndRegisterSkills = async (skillNames: string[]) => {
        const newStats = { ...userStats };
        let hasChanges = false;

        // Deep copy skills
        newStats.skills = Object.fromEntries(
            Object.entries(newStats.skills).map(([k, v]) => [k, { ...v }])
        );

        skillNames.forEach(skillName => {
            // Ignore special "quadrant" skills
            if (skillName.startsWith('quadrant:')) return;

            const lowerSkillTag = skillName.toLowerCase();
            const matchingKey = findBestMatch(skillName, Object.keys(newStats.skills));
            const exists = !!matchingKey;

            if (!exists) {
                // Register new skill
                // Capitalize first letter for display quality
                const displayName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

                newStats.skills[displayName] = {
                    name: displayName,
                    value: 0,
                    level: 1
                };
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setUserStats(newStats);
            showToast('New skills registered to profile.', { type: 'success' });

            if (user) {
                try {
                    await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                        ...newStats,
                        skills: JSON.stringify(newStats.skills)
                    });
                } catch (e: any) {
                    console.error('Failed to sync new skills', e);
                }
            }
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        // 1. Check for new skills and register them
        checkAndRegisterSkills(taskData.skills);

        const newTask: Task = {
            ...taskData,
            id: user ? ID.unique() : crypto.randomUUID(),
            createdAt: Date.now(),
        };

        // Optimistic Update
        setTasks(prev => [...prev, newTask]);

        // Trigger XP if created as COMPLETED
        if (newTask.status === 'COMPLETED') {
            gainXp(newTask.difficulty, newTask.skills, 1);
        }

        showToast('New mission initialized', { type: 'success' });

        // Cloud Sync
        if (user) {
            try {
                // Exclude 'id' because it's used as the document ID ($id)
                const { id, quadrant, ...taskPayload } = newTask;

                // Pack quadrant into skills
                const skillsToSave = [...newTask.skills];
                if (quadrant) {
                    skillsToSave.push(`quadrant:${quadrant}`);
                }

                await databases.createDocument(DATABASE_ID, COLLECTIONS.TASKS, newTask.id, {
                    ...taskPayload,
                    userId: user.$id,
                    skills: skillsToSave,
                    dueDate: newTask.dueDate ? String(newTask.dueDate) : null,
                    endTime: newTask.endTime ? String(newTask.endTime) : null,
                });
            } catch (e: any) {
                console.error('Failed to create task in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const oldStatus = task.status;

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

        if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
            gainXp(task.difficulty, task.skills, 1);
            showToast('Mission Complete! XP Gained.', { type: 'success' });
        } else if (oldStatus === 'COMPLETED' && status !== 'COMPLETED') {
            // Reverse XP (Deduct)
            gainXp(task.difficulty, task.skills, -1);
            showToast('Mission Reopened. XP Reverted.', { type: 'info' });
        }

        // Cloud Sync
        if (user) {
            try {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, taskId, { status });
            } catch (e: any) {
                console.error('Failed to update task in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
        if (updates.skills) {
            checkAndRegisterSkills(updates.skills);
        }

        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
            // Handle Status Change via Edit
            if (updates.status && updates.status !== currentTask.status) {
                if (updates.status === 'COMPLETED') {
                    // Use new skills if provided, else old skills
                    gainXp(currentTask.difficulty, updates.skills || currentTask.skills, 1);
                } else if (currentTask.status === 'COMPLETED') {
                    gainXp(currentTask.difficulty, currentTask.skills, -1);
                }
            }
        }

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
        showToast('Mission parameters updated.', { type: 'success' });

        // Cloud Sync
        if (user) {
            try {
                // Prepare payload: convert dates to strings if present
                const payload: any = { ...updates };
                if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate ? String(updates.dueDate) : null;
                if (updates.endTime !== undefined) payload.endTime = updates.endTime ? String(updates.endTime) : null;

                // Handle Quadrant/Skills packing
                if (updates.quadrant !== undefined || updates.skills !== undefined) {
                    const currentTask = tasks.find(t => t.id === taskId);
                    const skillsToUse = updates.skills || (currentTask ? currentTask.skills : []);
                    const quadrantToUse = updates.quadrant !== undefined ? updates.quadrant : (currentTask ? currentTask.quadrant : undefined);

                    const skillsToSave = [...skillsToUse];
                    if (quadrantToUse) {
                        skillsToSave.push(`quadrant:${quadrantToUse}`);
                    }

                    payload.skills = skillsToSave;
                    delete payload.quadrant; // Ensure we don't send this as a separate field
                }

                await databases.updateDocument(DATABASE_ID, COLLECTIONS.TASKS, taskId, payload);
            } catch (e: any) {
                console.error('Failed to update task in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const deleteTask = async (taskId: string) => {
        // Optimistic Update
        setTasks(prev => prev.filter(t => t.id !== taskId));
        showToast('Mission deleted.', { type: 'info' });

        // Cloud Sync
        if (user) {
            try {
                await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TASKS, taskId);
            } catch (e: any) {
                // If document not found (404), it's already deleted or never existed in cloud.
                if (e.code !== 404) {
                    console.error('Failed to delete task in cloud', e);
                    showToast(`Sync Failed: ${e.message}`, { type: 'error' });
                }
            }
        }
    };

    const addTracker = async (trackerData: Omit<Tracker, 'id'>) => {
        const newTracker: Tracker = {
            ...trackerData,
            id: user ? ID.unique() : crypto.randomUUID(),
        };

        setTrackers(prev => [...prev, newTracker]);
        showToast('New module added.', { type: 'success' });

        if (user) {
            try {
                const { id, ...trackerPayload } = newTracker;
                await databases.createDocument(DATABASE_ID, COLLECTIONS.TRACKERS, newTracker.id, {
                    ...trackerPayload,
                    userId: user.$id
                });
            } catch (e: any) {
                console.error('Failed to create tracker in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const deleteTracker = async (trackerId: string) => {
        setTrackers(prev => prev.filter(t => t.id !== trackerId));

        if (user) {
            try {
                await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TRACKERS, trackerId);
            } catch (e: any) {
                console.error('Failed to delete tracker in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const addHabit = async (habitData: Omit<Habit, 'id'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: user ? ID.unique() : crypto.randomUUID(),
        };

        setHabits(prev => [...prev, newHabit]);
        showToast('New habit created!', { type: 'success' });

        if (user) {
            try {
                const { id, ...payload } = newHabit;
                await databases.createDocument(DATABASE_ID, COLLECTIONS.HABITS, newHabit.id, {
                    ...payload,
                    userId: user.$id
                });
            } catch (e: any) {
                console.error('Failed to create habit in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const updateHabit = async (habitId: string, updates: Partial<Omit<Habit, 'id' | 'userId'>>) => {
        // Optimistic update
        setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));

        if (!user) return;

        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.HABITS,
                habitId,
                updates
            );
            showToast('Habit updated successfully!', { type: 'success' });
        } catch (error) {
            console.error('Failed to update habit:', error);
            showToast('Failed to save habit changes.', { type: 'error' });
            // Revert on failure (reload from server or simple undo if we tracked it)
            loadCloudData(user?.$id);
        }
    };

    const deleteHabit = async (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
        // Also remove logs for this habit locally
        setHabitLogs(prev => prev.filter(l => l.habitId !== habitId));
        showToast('Habit deleted.', { type: 'info' });

        if (user) {
            try {
                await databases.deleteDocument(DATABASE_ID, COLLECTIONS.HABITS, habitId);
                // Note: Cascading delete of logs usually handled by backend or manual cleanup. 
                // For now, we leave orphan logs or cleanup later.
            } catch (e: any) {
                console.error('Failed to delete habit in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const logHabit = async (habitId: string, date: string, value: number) => {
        const existingLogIndex = habitLogs.findIndex(l => l.habitId === habitId && l.date === date);
        const existingLog = existingLogIndex >= 0 ? habitLogs[existingLogIndex] : null;

        if (existingLog) {
            // Update existing log
            const updatedLog = { ...existingLog, value };
            setHabitLogs(prev => {
                const newLogs = [...prev];
                newLogs[existingLogIndex] = updatedLog;
                return newLogs;
            });

            if (user) {
                try {
                    await databases.updateDocument(DATABASE_ID, COLLECTIONS.HABIT_LOGS, existingLog.id, { value });
                } catch (e: any) {
                    console.error('Failed to update habit log', e);
                    // Revert? For now, just toast error
                    showToast('Sync Failed', { type: 'error' });
                }
            }
        } else {
            // Create new log
            const newLog: HabitLog = {
                id: user ? ID.unique() : crypto.randomUUID(),
                habitId,
                date,
                value
            };
            setHabitLogs(prev => [...prev, newLog]);

            if (user) {
                try {
                    const { id, ...payload } = newLog;
                    // Ensure userId is attached for permissions, assuming Schema supports it
                    await databases.createDocument(DATABASE_ID, COLLECTIONS.HABIT_LOGS, newLog.id, {
                        ...payload,
                        userId: user.$id
                    });
                } catch (e: any) {
                    console.error('Failed to create habit log', e);
                    showToast('Sync Failed', { type: 'error' });
                }
            }
        }
    };

    const resetStats = async () => {
        // Create fresh stats but PRESERVE existing skill definitions (keys)
        const freshStats = JSON.parse(JSON.stringify(INITIAL_STATS));

        // Rebuild skills object: keep the name, reset value/level
        const preservedSkills: Record<string, SkillStats> = {};
        Object.keys(userStats.skills).forEach(key => {
            preservedSkills[key] = {
                name: userStats.skills[key].name,
                value: 0,
                level: 1
            };
        });

        freshStats.skills = preservedSkills;

        setUserStats(freshStats);
        showToast('Stats reset to zero (Skills preserved).', { type: 'info' });

        if (user) {
            try {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                    ...freshStats,
                    skills: JSON.stringify(freshStats.skills)
                });
            } catch (e: any) {
                if (e.code === 404) {
                    try {
                        await databases.createDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                            ...freshStats,
                            skills: JSON.stringify(freshStats.skills)
                        });
                    } catch (createError: any) {
                        console.error('Failed to create stats', createError);
                        showToast(`Creation Failed: ${createError.message}`, { type: 'error' });
                    }
                } else {
                    console.error('Failed to reset stats in cloud', e);
                    showToast(`Sync Failed: ${e.message}`, { type: 'error' });
                }
            }
        }
    };

    const setStats = async (newStats: UserStats) => {
        setUserStats(newStats);
        showToast('Stats updated manually.', { type: 'success' });

        if (user) {
            try {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                    ...newStats,
                    skills: JSON.stringify(newStats.skills)
                });
            } catch (e: any) {
                if (e.code === 404) {
                    try {
                        await databases.createDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                            ...newStats,
                            skills: JSON.stringify(newStats.skills)
                        });
                    } catch (createError: any) {
                        console.error('Failed to create stats', createError);
                        showToast(`Creation Failed: ${createError.message}`, { type: 'error' });
                    }
                } else {
                    console.error('Failed to update stats in cloud', e);
                    showToast(`Sync Failed: ${e.message}`, { type: 'error' });
                }
            }
        }
    };

    const updateSkills = async (newSkills: Record<string, SkillStats>) => {
        const newStats = { ...userStats, skills: newSkills };
        setUserStats(newStats);
        showToast('Skills updated.', { type: 'success' });

        if (user) {
            try {
                await databases.updateDocument(DATABASE_ID, COLLECTIONS.USER_STATS, user.$id, {
                    ...newStats,
                    skills: JSON.stringify(newSkills)
                });
            } catch (e: any) {
                console.error('Failed to update skills in cloud', e);
                showToast(`Sync Failed: ${e.message}`, { type: 'error' });
            }
        }
    };

    const updateProfile = async (name: string, avatarFile?: File, bannerFile?: File) => {
        if (!user) return;

        try {
            // 1. Update Name
            if (name !== user.name) {
                await account.updateName(name);
            }

            let newPrefs = { ...user.prefs };
            let prefsChanged = false;

            // 2. Upload Avatar if provided
            if (avatarFile) {
                // Upload file to bucket
                const file = await storage.createFile(BUCKET_ID, ID.unique(), avatarFile);
                newPrefs.avatarId = file.$id;
                prefsChanged = true;
            }

            // 3. Upload Banner if provided
            if (bannerFile) {
                const file = await storage.createFile(BUCKET_ID, ID.unique(), bannerFile);
                newPrefs.bannerId = file.$id;
                prefsChanged = true;
            }

            // 4. Update Prefs if changed
            if (prefsChanged) {
                await account.updatePrefs(newPrefs);
            }

            // 5. Refresh User Session
            const updatedSession = await account.get();
            setUser(updatedSession);
            showToast('Profile updated successfully!', { type: 'success' });

        } catch (error: any) {
            console.error('Failed to update profile:', error);
            showToast(`Update Failed: ${error.message}`, { type: 'error' });
        }
    };

    const updateGlobalBanner = async (file: File) => {
        if (!user) return;
        try {
            const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
            await account.updatePrefs({
                ...user.prefs,
                globalBannerId: uploadedFile.$id
            });
            const updatedSession = await account.get();
            setUser(updatedSession);
            showToast('Global banner updated!', { type: 'success' });
        } catch (error: any) {
            console.error('Failed to update global banner:', error);
            showToast(`Update Failed: ${error.message}`, { type: 'error' });
        }
    };

    const resetGlobalBanner = async () => {
        if (!user) return;
        try {
            await account.updatePrefs({
                ...user.prefs,
                globalBannerId: null // or undefined, depending on Appwrite behavior for clearing
            });
            // Note: Appwrite might not clear key with null, might need to set to empty string or handle differently.
            // Usually setting to null works for clearing optional prefs in some systems, but for Appwrite prefs (JSON), 
            // we might need to just omit it or set to empty string. Let's try null first or empty string.
            // Actually, let's use empty string to be safe if it's a string field.
            await account.updatePrefs({
                ...user.prefs,
                globalBannerId: ''
            });

            const updatedSession = await account.get();
            setUser(updatedSession);
            showToast('Global banner reset to default.', { type: 'success' });
        } catch (error: any) {
            console.error('Failed to reset global banner:', error);
            showToast(`Reset Failed: ${error.message}`, { type: 'error' });
        }
    };

    const setTheme = async (themeId: string) => {
        setCurrentTheme(themeId);

        if (user) {
            try {
                await account.updatePrefs({
                    ...user.prefs,
                    themeId: themeId
                });
            } catch (error: any) {
                console.error('Failed to save theme preference:', error);
            }
        }
    };

    return (
        <GameContext.Provider value={{
            user,
            tasks,
            habits,
            habitLogs,
            trackers,
            userStats,
            addTask,
            updateTaskStatus,
            updateTask,
            deleteTask,
            addTracker,
            deleteTracker,
            addHabit,
            updateHabit,
            deleteHabit,
            logHabit,
            resetStats,
            setStats,
            updateSkills,
            updateProfile,
            updateGlobalBanner,
            resetGlobalBanner,
            currentTheme,
            setTheme,
            logout
        }}>
            {children}
        </GameContext.Provider>
    );
};
