import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Tracker, UserStats, INITIAL_STATS, TaskStatus, SkillStats } from '../types';
import { useToast } from './ToastContext';
import { account, databases, DATABASE_ID, COLLECTIONS, storage, BUCKET_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { themes } from '../lib/themes';

interface GameContextType {
    user: any;
    tasks: Task[];
    trackers: Tracker[];
    userStats: UserStats;
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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load from local storage or use defaults (Initial state)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [userStats, setUserStats] = useState<UserStats>(JSON.parse(JSON.stringify(INITIAL_STATS)));
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
        const savedTasks = localStorage.getItem('gtt_tasks');
        const savedTrackers = localStorage.getItem('gtt_trackers');
        const savedStats = localStorage.getItem('gtt_stats');

        setTasks(savedTasks ? JSON.parse(savedTasks) : []);
        setTrackers(savedTrackers ? JSON.parse(savedTrackers) : [
            { id: '1', name: 'Daily Missions', type: 'daily', themeColor: 'tech-primary', icon: 'Target' },
            { id: '2', name: 'Assignments', type: 'assignment', themeColor: 'tech-secondary', icon: 'BookOpen' }
        ]);
        setUserStats(savedStats ? JSON.parse(savedStats) : JSON.parse(JSON.stringify(INITIAL_STATS)));
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
            localStorage.setItem('gtt_stats', JSON.stringify(userStats));
        }
    }, [tasks, trackers, userStats, loading]);

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

        newStats.xp = Math.max(0, newStats.xp + xpGain);

        // Level Up Logic (Only if gaining XP)
        if (xpGain > 0 && newStats.xp >= newStats.nextLevelXp) {
            newStats.level += 1;
            newStats.xp = newStats.xp - newStats.nextLevelXp;
            newStats.nextLevelXp = Math.floor(newStats.nextLevelXp * 1.5);
            showToast(`Level Up! You are now Level ${newStats.level}`, { type: 'success' });
        }

        taskSkills.forEach(skillName => {
            // Case insensitive matching
            const lowerSkillTag = skillName.toLowerCase();

            // Find matching skill in user stats
            const matchingSkillKey = Object.keys(newStats.skills).find(key => {
                const lowerKey = key.toLowerCase();
                return lowerKey.includes(lowerSkillTag) || lowerSkillTag.includes(lowerKey);
            });

            if (matchingSkillKey) {
                const currentSkill = newStats.skills[matchingSkillKey];
                let newValue = Math.max(0, currentSkill.value + skillGain);
                let newLevel = currentSkill.level;

                // Leveling Logic: Check if we crossed 100 (Only if gaining)
                if (skillGain > 0 && newValue >= 100) {
                    const levelsGained = Math.floor(newValue / 100);
                    newLevel += levelsGained;
                    newValue = newValue % 100;
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

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        const newTask: Task = {
            ...taskData,
            id: user ? ID.unique() : crypto.randomUUID(),
            createdAt: Date.now(),
        };

        // Optimistic Update
        setTasks(prev => [...prev, newTask]);
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
            trackers,
            userStats,
            addTask,
            updateTaskStatus,
            updateTask,
            deleteTask,
            addTracker,
            deleteTracker,
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
