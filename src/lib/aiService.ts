import { GameContext } from './knowledgeBase';

interface AIResponse {
    text: string;
    error?: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateAIResponse = async (query: string, context: GameContext, apiKey: string): Promise<AIResponse> => {
    try {
        // 1. Construct the System Prompt (Context Injection)
        const systemPrompt = `
You are Elite65, a tactical futuristic AI assistant for a gamified task tracker app.
Your tone is: Professional, concise, slightly robotic/tactical (like a sci-fi HUD AI), but helpful.

CURRENT USER STATUS (JSON Data):
User Level: ${context.userStats.level} (XP: ${context.userStats.xp} / ${context.userStats.nextLevelXp})
Streak: ${context.userStats.streak} days
Skills: ${Object.keys(context.userStats.skills).map(k => `${k}: Lvl ${context.userStats.skills[k].level}`).join(', ')}

PENDING MISSIONS (Tasks):
${context.tasks.filter(t => t.status !== 'COMPLETED').map(t => `- [${t.difficulty}] ${t.title} (Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'None'})`).join('\n')}

ACTIVE HABITS:
${context.habits.map(h => `- ${h.title} (${h.goalAmount} ${h.unit})`).join('\n')}

USER QUERY: "${query}"

INSTRUCTIONS:
- Answer the user's query based strictly on the provided data.
- If they ask for advice, give tactical recommendations based on their pending tasks (e.g., suggest doing High Priority/Epic tasks first).
- If they ask about stats, summarize them.
- Keep answers under 3 sentences unless asked for a detailed report.
- Do NOT mention "JSON data" or "context provided". Act as if you just KNOW this information.
        `;

        // 2. Call Gemini API
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Failed to contact AI');
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            throw new Error('No response generated.');
        }

        return { text: aiText };

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return { text: "Connection intercepted. Fallback protocols engaged.", error: error.message };
    }
};
