import { Task, UserStats, Habit, HabitLog } from '../types';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
    actions?: { label: string; action: string }[];
}

interface GameContext {
    tasks: Task[];
    habits: Habit[];
    userStats: UserStats;
    habitLogs: HabitLog[];
}

// --- REFACTORED INTERFACES ---
interface BotAction {
    type: 'CREATE_TASK' | 'CREATE_TRACKER' | 'DELETE_TASK' | 'EDIT_TASK';
    payload: any;
}

interface KnowledgeRule {
    keywords?: string[];
    regex?: RegExp;
    response: (context: GameContext, match?: RegExpMatchArray) => string;
    setTopic?: string;
    requiredTopic?: string;
    // Action to execute (optional)
    action?: (context: GameContext, match?: RegExpMatchArray) => BotAction;
}

interface QueryResult {
    text: string;
    newTopic?: string;
    action?: BotAction;
}

export const ELITE65_AVATAR = "https://ui-avatars.com/api/?name=Elite+65&background=000000&color=fff&size=128&bold=true";

const GREETINGS = [
    "Systems online. I am Elite65. How can I assist you with your missions today?",
    "Greetings, Operator. Elite65 ready for query.",
    "Welcome back. I am standing by to assist with platform navigation and data analysis."
];

const FALLBACKS = [
    "I processed that query but found no matching protocols. Could you rephrase?",
    "My database doesn't have a record for that specific term. Try asking about 'XP', 'Habits', or 'Missions'.",
    "Command unrecognized. I can assist with Task tracking, Habit formation, and Analytics."
];

// Context can include: current page, user level, pending tasks count, etc.
export const processQuery = (query: string, context?: GameContext, lastTopic?: string): QueryResult => {
    // Default empty context
    const safeContext: GameContext = context || { tasks: [], habits: [], userStats: { level: 1, xp: 0, nextLevelXp: 100, streak: 0, lastLogin: '', skills: {} }, habitLogs: [] };

    // 1. Split Query (Multi-Question Support) logic simplified for Context Mode
    // For context mode, we primarily handle the first intent to establish context, 
    // or we'd need a complex merger. Let's keep it simple: Process full query.

    const lowerQuery = query.toLowerCase();

    // --- CONTEXT AWARE RULES (check these first if lastTopic exists) ---
    if (lastTopic) {
        // Generic "What about them?" / "And for habits?"
        if (lastTopic === 'TASKS' && /(habits|protocols)/i.test(lowerQuery)) {
            // Context Switch: Tasks -> Habits
            // Let standard matching handle "habits"
        }
    }

    // 2. Standard Rule Matching
    for (const rule of KNOWLEDGE_BASE) {
        // Filter by Topic Requirement
        if (rule.requiredTopic && rule.requiredTopic !== lastTopic) {
            continue;
        }

        let matched = false;
        let matchResult: RegExpMatchArray | null = null;

        // Regex Match
        if (rule.regex) {
            matchResult = rule.regex.exec(query);
            if (matchResult) {
                matched = true;
            }
        }
        // Keyword Match (Whole Word Only)
        else if (rule.keywords) {
            const tokens = lowerQuery.split(/[^a-z0-9]+/); // Tokenize by non-alphanumeric
            if (rule.keywords.some(k => tokens.includes(k.toLowerCase()))) {
                matched = true;
            }
        }

        if (matched) {
            const responseText = rule.response(safeContext, matchResult || undefined);
            const action = rule.action ? rule.action(safeContext, matchResult || undefined) : undefined;

            // If this rule has an action, we prioritize returning it immediately
            // (Assuming we only do one major action per query for safety)
            if (action) {
                return {
                    text: responseText,
                    newTopic: rule.setTopic,
                    action: action
                };
            }

            return {
                text: responseText,
                newTopic: rule.setTopic // Update topic if rule defines one
            };
        }
    }

    // Fallback
    return { text: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] };
};

// --- HELPER: PARSE TASK UPDATES ---
const parseTaskUpdates = (text: string): any => {
    const updates: any = {};
    const lower = text.toLowerCase();

    // 1. Status
    // Priority: Look for "to [STATUS]" pattern first (e.g. "from todo to in progress")
    const statusRegex = /to\s+(todo|to\s+do|in\s+progress|progress|done|complete)/i;
    const statusMatch = lower.match(statusRegex);

    if (statusMatch) {
        const target = statusMatch[1];
        if (target.includes('todo') || target.includes('to do')) updates.status = 'TODO';
        else if (target.includes('progress')) updates.status = 'IN_PROGRESS';
        else if (target.includes('done') || target.includes('complete')) updates.status = 'COMPLETED';
    } else {
        // Fallback: Simple check
        if (lower.includes('todo') || lower.includes('to do')) updates.status = 'TODO';
        else if (lower.includes('progress') || lower.includes('doing') || lower.includes('started') || lower.includes('improve') || lower.includes('broken')) updates.status = 'IN_PROGRESS';
        else if (lower.includes('done') || lower.includes('complete') || lower.includes('finished')) updates.status = 'COMPLETED';
    }

    // 2. Difficulty
    if (lower.includes('easy') || lower.includes('trivial')) updates.difficulty = 'EASY';
    else if (lower.includes('medium') || lower.includes('normal')) updates.difficulty = 'MEDIUM';
    else if (lower.includes('hard') || lower.includes('difficult')) updates.difficulty = 'HARD';
    else if (lower.includes('epic') || lower.includes('legendary')) updates.difficulty = 'EPIC';

    // 3. Date Parsing (Basic)
    const today = new Date();
    if (lower.includes('today')) {
        updates.dueDate = today.getTime();
    } else if (lower.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        updates.dueDate = tomorrow.getTime();
    }

    // 4. Time Parsing (Robust)
    // Regex for time: 1-2 digits, colon, 2 digits, optional am/pm (allowing dots)
    // We use matchAll (mapped to array) or just loop exec to find the LAST valid time to handle corrections ("No wait, 7pm")
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(?:([ap]\.?m\.?)|o'clock)?/gi;
    let timeMatch;
    let lastTimeMatch = null;

    // Iterate all matches
    while ((timeMatch = timeRegex.exec(lower)) !== null) {
        lastTimeMatch = timeMatch;
    }

    if (lastTimeMatch && updates.dueDate) {
        let hours = parseInt(lastTimeMatch[1]);
        const minutes = lastTimeMatch[2] ? parseInt(lastTimeMatch[2]) : 0;
        const amp = lastTimeMatch[3] ? lastTimeMatch[3].replace(/\./g, '') : null; // Normalize "p.m." to "pm"
        const isOclock = lower.includes("o'clock");

        if ((amp === 'pm' || amp === 'p' || amp === 'pm.') && hours < 12) hours += 12;
        // Logic for "5 o'clock" -> if it's 5pm, user usually means 5pm. If 5am? 
        // Heuristics: if 5 o'clock & it's after 5am, assume pm? Or just default PM for small numbers?
        // Let's assume PM for 1-5, AM for 7-11? Or just raw hours.
        // For now, standard AM/PM logic applies. If just "5 o'clock", it's 5:00. 
        // We'll leave it as raw hours if no AM/PM, unless it's small integers where 17:00 is better?
        // Let's stick to explicit or raw.

        if ((amp === 'am' || amp === 'a' || amp === 'am.') && hours === 12) hours = 0;

        const date = new Date(updates.dueDate);
        date.setHours(hours, minutes, 0, 0);
        updates.dueDate = date.getTime();
    }

    // 5. Tracker / Course Parsing
    // "in Daily Life", "within School", "for Career"
    const trackerRegex = /(?:in|within|for)\s+(?:the\s+)?([a-zA-Z0-9\s]+?)(?:\s+(?:with|status|difficulty|due|date|priority)|$)/i;
    const trackerMatch = lower.match(trackerRegex);
    if (trackerMatch) {
        // Avoid capturing "in progress" as the tracker "progress"
        const candidate = trackerMatch[1].trim();
        if (candidate !== 'progress' && candidate !== 'time') {
            updates.tracker = candidate;
        }
    }

    // 6. Title / Rename Parsing
    // "change name to X", "title X", "rename to X"
    const titleRegex = /(?:name|title|call|rename)(?:\s+(?:is|to|be))?\s+(.+?)(?:\s+(?:with|status|difficulty|due|date|priority|and)|$)/i;
    const titleMatch = lower.match(titleRegex);
    if (titleMatch) {
        updates.title = titleMatch[1].trim();
    }

    // 7. Fallback: If input has length but NO attributes extracted, treat as Rename
    // e.g. "Dinner with Kartik" (from "Edit task X to Dinner with Kartik")
    const hasKeys = Object.keys(updates).length > 0;
    if (!hasKeys && text.length > 2 && !text.toLowerCase().startsWith('change') && !text.toLowerCase().startsWith('update')) {
        updates.title = text.trim();
    }

    return updates;
    return updates;
};

// Update KNOWLEDGE_BASE with Topics
export const KNOWLEDGE_BASE: KnowledgeRule[] = [
    // --- SYSTEM STATUS: PROJECT MUTED (DEFINITION) ---
    {
        regex: /(what.*project muted|define project muted|about project muted|why.*project muted)/i,
        response: () => "Information Access Denied: Creator Id not found."
    },
    // --- IDENTITY & INTRODUCTION ---
    {
        regex: /(who are you|your name|identify yourself)/i,
        response: () => "I am Elite65, a tactical cognitive support system designed to gamify your productivity. I track your missions, analyze your consistency, and visualize your growth."
    },
    {
        regex: /(what is this|introduce.*(tool|app|website)|explain.*(system|platform)|what.*do)/i,
        response: () => "This is the 'Gamified Task Tracker' (Protocol: Elite65). It turns your life into an RPG. \n- completing Tasks grants XP.\n- Habits build Streaks.\n- Skills are visualized on the Hex Graph.\nMy role is to serve as your HUD and tactical advisor."
    },
    // --- SYSTEM STATUS: VOICE / ACTIVE FEATURES (STATUS) ---
    {
        // Catches "Why voice disabled", "Speak to me", or just generic "Project Muted" mention if not a definition query
        regex: /(mute|quiet|voice|speak|sound|audio|disabled|offline|broken|project muted)/i,
        response: () => "Project Muted."
    },

    // --- HIGH PRIORITY: SPECIFIC ANALYSIS ---
    {
        regex: /(what.*(pending|left|remaining)|list.*task)/i,
        response: (ctx) => {
            const pending = ctx.tasks.filter(t => t.status !== 'COMPLETED');
            if (pending.length === 0) return "Zero pending missions. Schedule is clear.";

            const count = pending.length;
            const top3 = pending.slice(0, 3).map(t => t.title).join(', ');
            return `Pending Count: ${count}. \nTop Priorities: ${top3}${count > 3 ? '...' : ''}. \nUse 'Suggest Mission' for tactical advice.`;
        }
    },
    {
        regex: /(improve.*habit|weak.*habit|lowest.*streak|worst.*habit)/i,
        response: (ctx) => {
            const sortedByActivity = ctx.habits.map(h => {
                const logs = ctx.habitLogs.filter(l => l.habitId === h.id).length;
                return { ...h, logs };
            }).sort((a, b) => a.logs - b.logs);

            if (sortedByActivity.length === 0) return "No habit data found.";

            const weakest = sortedByActivity[0];
            return `Optimization Required: '${weakest.title}' has the lowest recorded activity (${weakest.logs} logs). Focus effort here to balance your routine.`;
        }
    },

    // --- HIGH PRIORITY: FEATURES & HELP ---
    {
        regex: /(hex|graph|polygon|radar|chart|skill.*visual)/i,
        response: () => "The Hexagon Skill Graph visualizes your attribute balance. \n- Vertices represent different skill categories.\n- The area expands as you complete tasks tagged with those skills.\n- A balanced shape indicates a well-rounded skillset."
    },
    {
        regex: /(theme|look|design|color|style|appearance)/i,
        response: () => "Elite65 supports multiple visual themes. You can switch them in Settings:\n1. 'Eclipse Skies' (Deep Blue/Purple)\n2. 'Cold Nights' (Dark Cyan/Slate)\n3. 'Frigid Winter' (Cozy Anime Lofi style)\n4. 'Spring Shower' (Soft Pink/Blue Sunrise)."
    },
    {
        regex: /(frigid winter|spring shower|eclipse skies|cold nights)/i,
        response: (ctx, match) => {
            const themeName = match ? match[1] : 'The requested theme';
            return `'${themeName}' is a visual override available in the Settings module. It changes the interface palette and background banner to match the mood.`;
        }
    },

    // --- CONTEXTUAL: FOLLOW UPS ---
    {
        // "What about habits?" or "And habits?" regarding stats/percentage
        regex: /^(what about|how about|and) (habits?|protocols?|routines?)/i,
        requiredTopic: 'STATS', // Only works if we just talked about stats/percentage
        response: (ctx) => {
            const active = ctx.habits.length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Calculate habit completion percentage for today
            let totalGoals = 0;
            let currentProgress = 0;

            ctx.habits.forEach(h => {
                totalGoals += h.goalAmount;
                const logs = ctx.habitLogs.filter(l => l.habitId === h.id && new Date(l.date).setHours(0, 0, 0, 0) === today.getTime());
                currentProgress += logs.reduce((sum, l) => sum + l.value, 0);
            });

            const percent = totalGoals > 0 ? Math.round((currentProgress / totalGoals) * 100) : 0;
            return `Habit Protocol Efficiency: ${percent}% for today. consistent execution required.`;
        }
    },
    {
        regex: /^(what about|how about|and) (them|it|that|remaining|pending)$/i,
        requiredTopic: 'TASKS',
        response: (ctx) => {
            const pending = ctx.tasks.filter(t => t.status !== 'COMPLETED').length;
            return `Regarding your Tasks: You still have ${pending} pending missions. Stay focused.`;
        }
    },

    // --- IDENTITY ---
    {
        keywords: ['who are you', 'what are you', 'your name'],
        response: () => "I am Elite65, your dedicated tactical support A.I. My purpose is to help you optimize your productivity and navigate the Gamified Task Tracker."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    },
    {
        keywords: ['thank', 'thanks'],
        response: () => "You are welcome, Operator. Efficiency is my reward."
    },

    // --- DYNAMIC: REMAINING / STATUS REPORT ---
    {
        regex: /(how much|what.*)(left|remain|pending|to do)/i,
        setTopic: 'TASKS', // Sets context to Tasks generally
        response: (ctx) => {
            const pendingTasks = ctx.tasks.filter(t => t.status !== 'COMPLETED').length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const detailedHabits: string[] = [];

            ctx.habits.forEach(h => {
                const logsToday = ctx.habitLogs.filter(l =>
                    l.habitId === h.id &&
                    new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
                );
                const totalValue = logsToday.reduce((sum, l) => sum + l.value, 0);
                const remaining = h.goalAmount - totalValue;

                if (remaining > 0) {
                    detailedHabits.push(`${remaining} ${h.unit} of ${h.title}`);
                }
            });

            const habitText = detailedHabits.length > 0
                ? `Habits pending: ${detailedHabits.join(', ')}.`
                : "All habits completed.";

            return `Status Report: ${pendingTasks} active missions. ${habitText}`;
        }
    },

    // --- DYNAMIC: TASK STATUS ---
    {
        regex: /(count|how many|number of) (task|mission|job)/i,
        setTopic: 'TASKS',
        response: (ctx) => {
            const pending = ctx.tasks.filter(t => t.status !== 'COMPLETED').length;
            return `You have ${pending} pending missions in the queue.`;
        }
    },
    {
        regex: /(next|pending|todo|to do) (task|mission)/i,
        setTopic: 'TASKS',
        response: (ctx) => {
            const nextTask = ctx.tasks
                .filter(t => t.status !== 'COMPLETED')
                .sort((a, b) => a.difficulty === 'EPIC' ? -1 : 1) // Prioritize EPIC
                .find(() => true); // Get first

            if (!nextTask) return "All systems clear. You have no pending operations based on current filters.";
            return `Priority Alert: Your next target should be "${nextTask.title}" [${nextTask.difficulty}]. Engage when ready.`;
        }
    },

    // --- DYNAMIC: HABIT STATUS ---
    {
        regex: /(habit)/i,
        setTopic: 'HABITS', // General habit topic
        response: (ctx) => {
            return "Habit Protocols are recurring objectives. Tracking them daily builds your streak multiplier.";
        }
    },

    // --- DYNAMIC: STATS & SKILLS ---
    {
        regex: /(my level|current level|xp check|experience)/i,
        response: (ctx) => `You are currently Level ${ctx.userStats.level} with ${ctx.userStats.xp} XP. You need ${ctx.userStats.nextLevelXp - ctx.userStats.xp} more XP to reach the next rank.`
    },
    {
        regex: /(top skill|best skill|strongest attribute)/i,
        response: (ctx) => {
            const skills = Object.values(ctx.userStats.skills);
            const topSkill = skills.sort((a, b) => b.value - a.value)[0];
            return `Your dominant attribute is ${topSkill.name} (Level ${topSkill.level}). Keep investing in this vector.`;
        }
    },

    // --- CLARIFICATION: DEBUGGING & EDITING ---
    {
        regex: /(debug|debugging|edit.*skill|manual.*adjust)/i,
        response: () => "Clarification: 'Debugging' refers to troubleshooting code or data issues. The 'Edit Skills' button is for CONFIGURATION (adding/removing skill types) only. You cannot manually change your Level or XP values—those must be earned through missions!"
    },

    // --- ANALYSIS: WORKLOAD / OVERWHELM ---
    {
        regex: /(overwhelm|heavy|busy|workload|pressure|how.*look)/i,
        setTopic: 'TASKS',
        response: (ctx) => {
            const pendingTasks = ctx.tasks.filter(t => t.status !== 'COMPLETED');
            const epicCount = pendingTasks.filter(t => t.difficulty === 'EPIC').length;
            const hardCount = pendingTasks.filter(t => t.difficulty === 'HARD').length;
            const habitCount = ctx.habits.length;

            // Simple Load Score
            const loadScore = (epicCount * 3) + (hardCount * 2) + (pendingTasks.length - epicCount - hardCount) + (habitCount * 0.5);

            if (loadScore > 15) {
                return `STATUS: CRITICAL LOAD. You have ${pendingTasks.length} pending missions (including ${epicCount} Epics) and ${habitCount} active habits. Recommendation: Focus on ONE Epic task today and maintain only 2 core habits to avoid burnout.`;
            } else if (loadScore > 8) {
                return `STATUS: MODERATE. Your load is balanced. ${pendingTasks.length} missions active. You have capacity for 1 more major objective.`;
            } else {
                return `STATUS: OPTIMAL. You are running light with only ${pendingTasks.length} pending operations. Consider increasing difficulty or adding a new habit.`;
            }
        }
    },

    // --- ACTIONS: CREATE TASK IN COURSE ---
    {
        // "Create task Dinner in the Daily Life course at 7pm"
        // "Add the module Dinner 2 in Daily Life with status..."
        regex: /(?:create|add|new)\s+(?:the\s+)?(?:task|mission|module)\s+(.+?)\s+(?:in|for|to|on)\s+(?:the\s+)?(.+?)(?:\s+(?:course|tracker|module))?(?:\s+(?:with|at|by|due|for|status|difficulty|date)\b\s*(.+)|$)/i,
        response: (ctx, match) => {
            const task = match ? match[1] : 'Mission';
            const course = match ? match[2] : 'General';
            return `Initiating Task Protocol: '${task}' assigned to Module '${course}'. Processing attributes...`;
        },
        action: (ctx, match) => {
            const taskName = match ? match[1] : 'New Mission';
            const courseName = match ? match[2] : 'General';
            const detailsStr = (match && match[3]) ? match[3].toLowerCase() : '';

            let dueDate = Date.now();
            let difficulty = 'EASY';
            let status = 'TODO';

            // 1. Difficulty Parsing
            if (detailsStr.includes('medium')) difficulty = 'MEDIUM';
            if (detailsStr.includes('hard')) difficulty = 'HARD';
            if (detailsStr.includes('epic')) difficulty = 'EPIC';

            // 2. Status Parsing
            if (detailsStr.includes('progress') || detailsStr.includes('started')) status = 'IN_PROGRESS';
            if (detailsStr.includes('done') || detailsStr.includes('complete')) status = 'COMPLETED';

            // 3. Time/Date Parsing
            const now = new Date();

            // "tmrw", "tomorrow"
            if (detailsStr.includes('tmrw') || detailsStr.includes('tomorrow')) {
                now.setDate(now.getDate() + 1);
            }

            // Time parsing: "2 om", "2 pm", "14:00"
            // Fix "om" typo
            const timeStr = detailsStr.replace('om', 'pm');
            const timeMatch = timeStr.match(/(\d{1,2})[:.]?(\d{2})?\s*(am|pm)/);

            if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const mins = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                const meridium = timeMatch[3];

                if (meridium === 'pm' && hours < 12) hours += 12;
                if (meridium === 'am' && hours === 12) hours = 0;

                now.setHours(hours, mins, 0, 0);
                dueDate = now.getTime();
            } else if (detailsStr.includes('tmrw') || detailsStr.includes('tomorrow')) {
                // If only date provided, default to end of day? Or keep current time?
                // Let's set to 9am next day if time not specified
                now.setHours(9, 0, 0, 0);
                dueDate = now.getTime();
            }

            return {
                type: 'CREATE_TASK',
                payload: {
                    title: taskName,
                    difficulty: difficulty,
                    status: status,
                    dueDate: dueDate,
                    tracker: courseName,
                    skills: []
                }
            };
        }
    },

    // --- ACTIONS: CREATE TASK ---
    {
        // "Create a task to Buy Groceries..."
        // "I want to create a task Dinner with status..."
        // Regex: 
        // 1. Prefix: (?:create|add|new)
        // 2. Optional "task/mission"
        // 3. Name: Capture until separator
        // 4. Separators: with, status, difficulty, due, on, at, priority, to
        regex: /(?:create|new|add)\s+(?:a\s+)?(?:new\s+)?(?:task|mission|card)\s+(.+?)(?:\s+(?:to|with|status|difficulty|due|date|priority|on|at)\s+(.+))?$/i,
        response: (ctx, match) => `Initiating Creation Protocol: New mission '${match ? match[1] : 'Unknown'}' registered.`,
        action: (ctx, match) => {
            const rawTaskName = match ? match[1] : 'New Task';
            const rawUpdates = match && match[2] ? match[2] : '';

            // Use the same parser for initial attributes
            const attrs = parseTaskUpdates(rawUpdates);

            return {
                type: 'CREATE_TASK',
                payload: {
                    title: rawTaskName,
                    status: attrs.status || 'TODO',
                    difficulty: attrs.difficulty || 'MEDIUM',
                    dueDate: attrs.dueDate || new Date().getTime(),
                    trackerId: '', // Context will decide default tracker
                    tracker: attrs.tracker // If extracted
                }
            };
        }
    },

    // --- ACTIONS: EDIT TASK (Robust) ---
    {
        // "Edit Dinner ... from ... to ..."
        // "Change Task A ... to ..."
        // Separators: keywords like "from", "to", "date", or polite connectors "and I", "and you", "which is"
        // Also added "change" as a separator (e.g. "Edit dinner change status to...")
        // Improved Start: (?:edit|...)(?:\s+(?:the\s+)?(?:task|mission|card))?\s+ to consume "the task"
        regex: /(?:edit|change|update|modify|set|move)(?:\s+(?:the\s+)?(?:task|mission|card))?\s+(.+?)\s+(?:from|to|set|into|date|time|due|status|priority|and\s(?:i|you|please|make|change)|change)\s+(.+)/i,
        response: (ctx, match) => `Initiating Update Protocol: Modifying mission '${match ? match[1] : 'target'}'.`,
        action: (ctx, match) => {
            const rawTaskName = match ? match[1] : '';
            // The updates part might start with the separator (e.g. "and I want..."). 
            // We pass the FULL remaining string to parseTaskUpdates.
            const rawUpdates = match ? match[2] : '';

            return {
                type: 'EDIT_TASK',
                payload: {
                    taskName: rawTaskName,
                    // Pass the whole tail for parsing
                    updates: parseTaskUpdates(rawUpdates)
                }
            };
        }
    },



    // --- ACTIONS: DELETE COURSE ---
    {
        // "Delete course Daily Life"
        // "Remove module progress and"
        regex: /(?:delete|remove|cancel|trash)\s+(?:the\s+)?(?:course|tracker|module)\s+(.+)/i,
        response: (ctx, match) => `Initiating Deletion Protocol: Removing module '${match ? match[1] : 'Target'}'. Confirming erasure...`,
        action: (ctx, match) => {
            return {
                type: 'DELETE_TRACKER',
                payload: {
                    name: match ? match[1] : ''
                }
            };
        }
    },
    {
        regex: /(how|way).*\b(tag|add skill|attribute)\b/i,
        response: () => "To tag a mission: \n1. Open the 'Create/Edit Mission' modal.\n2. Scroll to 'Skills / Attributes'.\n3. Click existing chips to select, or tap '+ Custom' to type a new skill."
    },
    {
        regex: /(how|way).*\b(create|new|add).*(task|mission)\b/i,
        response: () => "To initialize a new mission:\n1. Navigate to the 'Tasks' or 'Dashboard' module.\n2. Click the large '+' button or 'New Mission'.\n3. Fill in the title, difficulty, and due date."
    },
    // --- ACTIONS: DELETE TASK ---
    // --- ACTIONS: DELETE TASK ---
    {
        // "Delete task Dinner 2 from Daily Life"
        // "Delete the mission X"
        regex: /(?:delete|remove|cancel|trash)\s+(?:the\s+)?(?:task|mission|card)\s+(.+?)(?:\s+(?:from|in|on)\s+(?:the\s+)?(.+?))?$/i,
        response: (ctx, match) => `Initiating Deletion Protocol: Removing mission '${match ? match[1] : 'Unknown'}'${match && match[2] ? ` from module '${match[2]}'` : ''}.`,
        action: (ctx, match) => {
            return {
                type: 'DELETE_TASK',
                payload: {
                    taskName: match ? match[1] : '',
                    courseName: match && match[2] ? match[2] : undefined
                }
            };
        }
    },

    // --- ACTIONS: EDIT TASK (Reverse: "Change ... for Task") ---
    {
        // "Change the status to in progress for Dinner with Rudranil"
        // "Update time for Task A"
        // Captures Task Name AFTER "for" or "of".
        regex: /(?:edit|change|update|modify|set|want\s+to\s+change).+?(?:for|of)\s+(?:the\s+)?(?:task|mission|card)?\s*(.+)/i,
        response: (ctx, match) => `Initiating Update Protocol: Modifying mission '${match ? match[1] : 'target'}'.`,
        action: (ctx, match) => {
            const rawTaskName = match ? match[1] : '';
            // The part BEFORE "for" contains the updates. 
            // We pass the whole string to parseTaskUpdates.
            return {
                type: 'EDIT_TASK',
                payload: {
                    taskName: rawTaskName,
                    updates: parseTaskUpdates(match ? match[0] : '')
                }
            };
        }
    },

    // --- ACTIONS: EDIT TASK (Robust) ---
    {
        // "Edit Dinner ... from ... to ..."
        // "Change Task A ... to ..."
        // Separators: keywords like "from", "to", "date", or polite connectors "and I", "and you", "which is"
        // Also added "change" as a separator (e.g. "Edit dinner change status to...")
        // Improved Start: (?:edit|...)(?:\s+(?:the\s+)?(?:task|mission|card))?\s+ to consume "the task"
        regex: /(?:edit|change|update|modify|set|move)(?:\s+(?:the\s+)?(?:task|mission|card))?\s+(.+?)\s+(?:from|to|set|into|date|time|due|status|priority|and\s(?:i|you|please|make|change)|change)\s+(.+)/i,
        response: (ctx, match) => `Initiating Update Protocol: Modifying mission '${match ? match[1] : 'target'}'.`,
        action: (ctx, match) => {
            const rawTaskName = match ? match[1] : '';
            // The updates part might start with the separator (e.g. "and I want..."). 
            // We pass the FULL remaining string to parseTaskUpdates.
            const rawUpdates = match ? match[2] : '';

            return {
                type: 'EDIT_TASK',
                payload: {
                    taskName: rawTaskName,
                    // Pass the whole tail for parsing
                    updates: parseTaskUpdates(rawUpdates)
                }
            };
        }
    },

    // --- ACTIONS: EDIT TASK (Simple "To...") ---
    {
        // "Edit task Dinner to status Started"
        // "Set Dinner difficulty to Hard"
        // "Edit task Dinner to Dinner with Rudra" (Rename)
        regex: /(?:edit|change|update|modify|set|rename)\s+(?:the\s+)?(?:task|mission|card)?\s*(.+?)\s+(?:to|sets?|with|becomes?)\s+(.+)/i,
        response: (ctx, match) => `Initiating Update Protocol: Modifying mission '${match ? match[1] : 'target'}'.`,
        action: (ctx, match) => {
            return {
                type: 'EDIT_TASK',
                payload: {
                    taskName: match ? match[1] : '',
                    updates: parseTaskUpdates(match ? match[2] : '')
                }
            };
        }
    },

    // --- ANALYTICS: HABIT PERCENTAGE (Specific) ---
    {
        regex: /(habits?|protocols?).*(p.*cent|prog.*s|rate)/i,
        setTopic: 'STATS',
        response: (ctx) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let totalGoals = 0;
            let currentProgress = 0;

            ctx.habits.forEach(h => {
                totalGoals += h.goalAmount;
                const logs = ctx.habitLogs.filter(l => l.habitId === h.id && new Date(l.date).setHours(0, 0, 0, 0) === today.getTime());
                currentProgress += logs.reduce((sum, l) => sum + l.value, 0);
            });

            const percent = totalGoals > 0 ? Math.round((currentProgress / totalGoals) * 100) : 0;
            return `Daily Habit Protocol Efficiency: ${percent}%. (Goal: ${totalGoals}, Done: ${currentProgress}).`;
        }
    },

    // --- ANALYTICS: PERCENTAGE / PROGRESS (General / Typo Tolerant) ---
    {
        // "ow muc precentage" -> typo tolerant
        regex: /(p.*cent.*|prog.*s|completion.*rate|fraction|how.*done|ow.*muc)/i,
        setTopic: 'STATS',
        response: (ctx) => {
            const total = ctx.tasks.length;
            if (total === 0) return "No missions recorded. Progress is 0%.";

            const completed = ctx.tasks.filter(t => t.status === 'COMPLETED').length;
            const percent = Math.round((completed / total) * 100);

            return `Global Mission Completion: ${percent}% (${completed}/${total}). maintain course.`;
        }
    },

    // --- META: HELP ---
    {
        regex: /^(help|commands|menu|what can you do)$/i,
        response: () => "I can assist with:\n- Navigation ('Where is habits?')\n- Status Reports ('How many tasks?')\n- Mechanics ('How does XP work?')\n- Instructions ('How to tag?')\n- Analysis ('Top skill?')"
    },

    // --- ADVANCED INTELLIGENCE: TACTICAL ADVISOR ---
    {
        regex: /(what.*do|advise|suggestion|recommend|what.*next)/i,
        setTopic: 'TASKS',
        response: (ctx) => {
            const pending = ctx.tasks.filter(t => t.status !== 'COMPLETED');
            if (pending.length === 0) return "All systems nominal. No pending missions. Suggestion: Create a new objective or focus on Habit Protocols.";

            // Sort by Urgency (Due Date) then Difficulty (Epic first)
            const sorted = pending.sort((a, b) => {
                const dateA = a.dueDate || 9999999999999;
                const dateB = b.dueDate || 9999999999999;
                if (dateA !== dateB) return dateA - dateB;

                const difficultyRank = { EPIC: 4, HARD: 3, MEDIUM: 2, EASY: 1 };
                return difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
            });

            const topTask = sorted[0];
            const isOverdue = topTask.dueDate && topTask.dueDate < Date.now();

            if (isOverdue) return `CRITICAL ALERT: Mission '${topTask.title}' is OVERDUE. Immediate execution required to restore efficiency.`;
            return `Tactical Analysis suggests engaging mission: '${topTask.title}' (${topTask.difficulty}). It is your highest priority target.`;
        }
    },

    // --- ADVANCED INTELLIGENCE: STREAK GUARDIAN ---
    {
        regex: /(streak|habit.*(status|check|done|today|maintain|keep)|(missed|forgot|did|do).*habit)/i,
        response: (ctx) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const missedHabits = ctx.habits.filter(h => {
                const logsToday = ctx.habitLogs.filter(l =>
                    l.habitId === h.id &&
                    new Date(l.date).setHours(0, 0, 0, 0) === today.getTime()
                );
                // Check if goal met
                const totalValue = logsToday.reduce((sum, l) => sum + l.value, 0);
                return totalValue < h.goalAmount;
            });

            if (missedHabits.length === 0) return "All Habit Protocols for today are active. Streak integrity is 100%. Excellent consistency, Operator.";

            return `Warning: ${missedHabits.length} Habit Protocols require attention today: ${missedHabits.map(h => h.title).join(', ')}. Complete them to maintain streak data.`;
        }
    },

    // --- ADVANCED INTELLIGENCE: SKILL COACH ---
    {
        regex: /(weak|improve|train|skill.*focus|lowest.*stat)/i,
        response: (ctx) => {
            const skills = Object.entries(ctx.userStats.skills);
            if (skills.length === 0) return "No skill data available. Tag missions with attributes to build your profile.";

            // Find lowest level skill
            const lowest = skills.sort((a, b) => a[1].level - b[1].level)[0];
            const [name, stats] = lowest;

            return `Analysis indicates strict deficiency in '${name}' (Level ${stats.level}). Suggestion: Initialize a new mission tagged '${name}' to improve this attribute.`;
        }
    },


    // --- MECHANICS: XP & LEVELING ---
    {
        keywords: ['xp', 'experience', 'level up', 'leveling'],
        response: () => "Experience Points (XP) are earned by completing missions. Difficulty matters: Easy (10 XP), Medium (25 XP), Hard (50 XP), Epic (100 XP). Habits grant 10 XP per log."
    },
    {
        keywords: ['lose xp', 'lost xp', 'xp gone'],
        response: () => "If you uncheck a completed task, the XP is deducted to maintain data integrity. Deleting a completed task does NOT remove XP."
    },

    // --- MECHANICS: HABITS ---
    {
        keywords: ['habit', 'streak', 'routine'],
        response: () => "Habits are recurring protocols. Maintain consistency to build Streaks. A streak only increases if you meet the daily goal amount."
    },
    {
        keywords: ['missed habit', 'break streak'],
        response: () => "If you miss a day, the generic streak logic breaks. However, this system uses a flexible lookback—log it as soon as possible to try and save it."
    },

    // --- MECHANICS: STAT CALCULATION / AUTOMATION ---
    {
        regex: /(how|way|formula).*(calculate|work|update|change)|(auto|manual).*(stats|xp)/i,
        response: () => "All attributes and XP are calculated AUTOMATICALLY. \n1. Completing Tasks grants XP based on difficulty.\n2. Tagging tasks with skills (e.g. 'Coding') automatically improves that specific attribute.\n3. You do not need to manually edit stats unless you are debugging."
    },

    // --- NAVIGATION HELP ---
    {
        keywords: ['cant find', 'where is', 'navigate', 'go to'],
        response: (ctx) => {
            return "Navigation modules are located in the sidebar (Desktop) or bottom bar (Mobile). Access Dashboard, Calendar, Tasks, Habits, or Data Analytics from there.";
        }
    },
    {
        keywords: ['stats', 'graph', 'chart', 'analytics'],
        response: () => "The Data/Analytics module visualizes your performance. Check the 'Data' tab to see your Activity Wave, Hex Skill Graph, and Habit Streaks."
    },

    // --- SKILLS ---
    {
        keywords: ['skill', 'attributes', 'stats', 'strength', 'intelligence'],
        response: () => "Skills (Attributes) level up as you tag tasks. For example, tagging a task with 'Coding' increases your Coding skill. The Hex Graph visualizes your top 6 attributes."
    },
    {
        keywords: ['duplicate skill', 'merge skill'],
        response: () => "The system attempts to fuzzy-match skills (e.g., 'Code' matches 'Coding'). precise spelling is recommended to avoid fragmentation."
    }
];
