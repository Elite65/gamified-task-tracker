import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Minimize2, Sparkles, Mic, MicOff } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { themes } from '../lib/themes';
import { ChatMessage, processQuery, ELITE65_AVATAR } from '../lib/knowledgeBase';
import { Elite65Icon } from './Elite65Icon';

export const ChatWidget: React.FC = () => {
    const { currentTheme, tasks, habits, userStats, habitLogs, addTask, deleteTask, updateTask, deleteTracker, addTracker, trackers } = useGame();
    const theme = themes.find(t => t.id === currentTheme) || themes[0];
    const { primary, secondary, surface, border, text, textSecondary, background } = theme.colors;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init-1',
            text: "Elite65 Online. I am your specialized support agent. Ask me about your Missions, XP, or Habits.",
            sender: 'bot',
            timestamp: Date.now()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    // Track Conversation Topic for Context
    const [topic, setTopic] = useState<string>('');

    // Voice Command State
    const [isListening, setIsListening] = useState(false);
    const [wasVoiceInput, setWasVoiceInput] = useState(false); // Track source
    const recognitionRef = useRef<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // CHANGED: Continuous
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.interimResults = true; // CHANGED: Interim

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // Append/Update input
                // Since we are in continuous mode, we can just grab everything from event.results if needed
                // But typically for dictation we want to append. 
                // However, for simplicity let's stick to replacing input with available transcript

                let allText = '';
                for (let i = 0; i < event.results.length; ++i) {
                    allText += event.results[i][0].transcript;
                }

                if (allText) {
                    setInputValue(allText);
                    setWasVoiceInput(true); // Flag as voice
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                // console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            };
        }
    }, []);

    const toggleListening = () => {
        // PROJECT MUTED: Voice Input Disabled
        if (true) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setInputValue('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // --- HELPERS: FUZZY MATCHING & TTS ---
    const levenshteinDistance = (a: string, b: string) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const findBestMatch = (query: string, candidates: Array<{ name: string; id: string;[key: string]: any }>) => {
        if (!query) return null;
        const lowerQuery = query.toLowerCase();
        let bestMatch = null;
        let lowestDistance = Infinity;
        const threshold = 3; // Allow 3 typos

        candidates.forEach(item => {
            const lowerName = item.name.toLowerCase();

            // 1. Exact Substring Match (Strongest)
            // If the query is "Dinner" and task is "Dinner with Rudranil", startswith is strong.
            if (lowerName.startsWith(lowerQuery)) {
                // Priority Match: if we find a startswith, we prefer it over fuzzy
                // But we want the *longest* prefix match? 
                // Or simply the exact match. 
                // Let's treat startsWith as distance -1 (very good)
                const dist = -1;
                if (dist < lowestDistance) {
                    lowestDistance = dist;
                    bestMatch = item;
                }
            } else if (lowerQuery.includes(lowerName)) {
                // 2. Reverse Substring: Query "Edit Dinner with Rudranil and I want..." contains Task "Dinner"
                // This is dangerous if task name is generic like "Setup".
                // But for specific names, it works.
                const dist = -0.5;
                if (dist < lowestDistance) {
                    lowestDistance = dist;
                    bestMatch = item;
                }
            } else {
                // 3. Levenshtein (Fallback)
                const dist = levenshteinDistance(lowerQuery, lowerName);
                if (dist < lowestDistance && dist <= threshold) {
                    lowestDistance = dist;
                    bestMatch = item;
                }
            }
        });
        return bestMatch;
    };

    const speakResponse = (text: string) => {
        // PROJECT MUTED: Voice Output Disabled
        if (!window.speechSynthesis || true) return;
        // Cancel existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 0.9; // Slightly robotic/deep

        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Microsoft') || v.name.includes('Google US English'));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    };

    const handleSend = (fromVoice = false, textOverride?: string) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim()) return;

        // Determine if this should be spoken (explicit voice arg OR state flag)
        const shouldSpeak = fromVoice || wasVoiceInput;

        // Reset flag immediately
        setWasVoiceInput(false);

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            text: textToSend,
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate Bot processing time
        setTimeout(async () => {
            // Pass the full context AND last topic to the knowledge base
            const result = processQuery(userMsg.text, { tasks, habits, userStats, habitLogs }, topic);

            // Update topic if the bot set a new one
            if (result.newTopic) {
                setTopic(result.newTopic);
            }

            // Speak the response if triggered by voice
            if (shouldSpeak) {
                speakResponse(result.text);
            }

            // EXECUTE BOT ACTIONS - PROJECT MUTED
            if (false && result.action) {
                if (result.action.type === 'CREATE_TASK') {
                    const payload = result.action.payload;
                    let finalTrackerId = payload.trackerId;

                    // If payload has a 'tracker' name instead of ID, resolve it
                    // If payload has a 'tracker' name instead of ID, resolve it
                    if (payload.tracker && !payload.trackerId) {
                        const existing = trackers.find(t => t.name.toLowerCase() === payload.tracker.toLowerCase());

                        if (existing) {
                            finalTrackerId = existing.id;
                        } else {
                            // Try Fuzzy Match (reuse findBestMatch helper)
                            const bestMatch = findBestMatch(payload.tracker, trackers);
                            if (bestMatch) {
                                finalTrackerId = bestMatch.id;
                            } else {
                                // DO NOT auto-create. If we can't find it, fallback to default.
                                // Or notify user (harder to do here without async response back, but fallback is safer)
                                console.warn(`Tracker '${payload.tracker}' not found. Using default.`);
                            }
                        }
                    } else if (!finalTrackerId && trackers.length > 0) {
                        // Fallback: If no tracker specified, use the first one (General/Inbox)
                        finalTrackerId = trackers[0].id;
                    }

                    if (finalTrackerId) {
                        // FIX: Remove 'tracker' string from payload before sending to addTask/Appwrite
                        // Appwrite errors if unknown attributes are present
                        const cleanPayload = { ...payload };
                        delete cleanPayload.tracker;

                        addTask({
                            ...cleanPayload,
                            trackerId: finalTrackerId
                        });
                    }
                } else if (result.action.type === 'CREATE_TRACKER') {
                    const payload = result.action.payload;
                    const existing = trackers.find(t => t.name.toLowerCase() === payload.name.toLowerCase());

                    if (!existing) {
                        await addTracker(payload);
                    }
                } else if (result.action.type === 'DELETE_TASK') {
                    const { taskName, courseName } = result.action.payload;

                    if (taskName) {
                        // Find the task using Fuzzy Match
                        const candidates = tasks.map(t => ({ name: t.title, ...t })); // Map title to name for helper
                        const bestTask = findBestMatch(taskName, candidates) as (typeof tasks[0] & { name: string }) | null;

                        if (bestTask) {
                            // Secondary check: Course Name
                            let courseMatch = true;
                            if (courseName) {
                                const tracker = trackers.find(tr => tr.id === bestTask.trackerId);
                                if (!tracker || !tracker.name.toLowerCase().includes(courseName.toLowerCase())) {
                                    courseMatch = false;
                                }
                            }

                            if (courseMatch) {
                                deleteTask(bestTask.id);
                            }
                        }
                    }
                } else if (result.action.type === 'EDIT_TASK') {
                    const { taskName, updates } = result.action.payload;
                    if (taskName) {
                        // Use Fuzzy Match
                        const candidates = tasks.map(t => ({ name: t.title, ...t }));
                        const bestTask = findBestMatch(taskName, candidates) as (typeof tasks[0] & { name: string }) | null;

                        if (bestTask) {
                            const { name, ...taskProps } = bestTask;

                            // Resolve Tracker Name to ID if present
                            // This prevents 'tracker' string from breaking Appwrite and ensures move works
                            const cleanUpdates = { ...updates };
                            if (cleanUpdates.tracker) {
                                const trName = cleanUpdates.tracker;
                                const targetTracker = trackers.find(t => t.name.toLowerCase() === trName.toLowerCase())
                                    || findBestMatch(trName, trackers);

                                if (targetTracker) {
                                    cleanUpdates.trackerId = targetTracker.id;
                                    // Remove the temporary string
                                    delete cleanUpdates.tracker;
                                } else {
                                    // If tracker not found, maybe ignore it or keep it? 
                                    // Better to remove it to avoid Errors if Appwrite is strict.
                                    delete cleanUpdates.tracker;
                                }
                            }

                            // Also handle implicit title if present
                            if (cleanUpdates.title) {
                                // Title is already in updates, good.
                            }

                            const updatedTask = { ...taskProps, ...cleanUpdates };
                            await updateTask(bestTask.id, updatedTask);
                        }
                    }
                }
            }

            const botMsg: ChatMessage = {
                id: crypto.randomUUID(),
                text: result.action
                    ? `[Active Protocol Suspended] Action denied. This feature falls under Project Muted: Write access is currently restricted for system stabilization.`
                    : result.text,
                sender: 'bot',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);

            // Speak Result if Voice Active
            if (fromVoice) {
                speakResponse(result.text);
            }
        }, 600 + Math.random() * 500); // 600-1100ms delay for realism
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 p-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 group"
                style={{ backgroundColor: surface, border: `1px solid ${border}` }}
            >
                <div className="absolute inset-0 rounded-full animate-pulse opacity-50" style={{ boxShadow: `0 0 20px ${primary}` }}></div>
                <div className="relative w-8 h-8 flex items-center justify-center">
                    <Elite65Icon className="w-full h-full" color={primary} />
                    <span className="absolute top-0 right-0 w-3 h-3 rounded-full border border-black bg-green-500"></span>
                </div>
                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                    Ask Elite65
                </div>
            </button>
        );
    }

    const getContrastColor = (hexColor: string) => {
        // Simple hex to RGB + YIQ contrast check
        if (!hexColor) return '#fff';
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 128 ? '#000000' : '#ffffff';
    };

    const contrastColor = getContrastColor(primary);

    return (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-4">

            {/* LISTENING MODE OVERLAY */}
            {isListening && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <button
                        onClick={toggleListening}
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative group cursor-pointer" onClick={toggleListening}>
                        {/* Pulse Rings */}
                        <div className="absolute inset-0 rounded-full border-2 animate-ping opacity-20 duration-1000" style={{ borderColor: primary }}></div>
                        <div className="absolute -inset-4 rounded-full border animate-pulse opacity-40" style={{ borderColor: primary }}></div>
                        <div className="absolute -inset-8 rounded-full border animate-pulse delay-75 opacity-20" style={{ borderColor: primary }}></div>

                        {/* Avatar */}
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 shadow-[0_0_50px_currentColor]" style={{ borderColor: primary, color: primary }}>
                            <div className="w-full h-full bg-black flex items-center justify-center p-4">
                                <Elite65Icon className="w-full h-full" color={primary} />
                            </div>
                        </div>

                        {/* Audio Visualizer Bars (Static Simulation) */}
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-1 animate-bounce" style={{ backgroundColor: primary, height: '100%', animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 text-center space-y-2">
                        <p className="font-bold tracking-widest text-sm uppercase" style={{ color: primary }}>Listening Logic Active</p>
                        <p className="text-white/80 text-xl font-light">"I am listening, Operator..."</p>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            <div
                className={`w-[400px] max-w-[90vw] backdrop-blur-xl rounded-2xl shadow-2xl border flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isTyping ? 'ring-1' : ''}`}
                style={{
                    height: '600px',
                    maxHeight: '80vh',
                    borderColor: border,
                    backgroundColor: `${surface}E6`, // High opacity surface color
                    boxShadow: `0 0 40px -10px ${primary}40`,
                    // '--tw-ring-color': primary // styled via boxShadow instead to avoid TS error
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: border, backgroundColor: `${background}80` }}>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center p-1" style={{ borderColor: isListening ? '#ef4444' : primary, backgroundColor: background }}>
                                <Elite65Icon className="w-full h-full" color={isListening ? '#ef4444' : primary} />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black bg-green-500"></span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm tracking-wide" style={{ color: text }}>ELITE65</h3>
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                            </div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70" style={{ color: primary }}>Tactical Support</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                        style={{ color: textSecondary }}
                    >
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center p-1" style={{ borderColor: border, backgroundColor: background }}>
                                    <Elite65Icon className="w-full h-full" color={primary} />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'rounded-tr-none'
                                    : 'border rounded-tl-none'
                                    }`}
                                style={{
                                    backgroundColor: msg.sender === 'user' ? primary : background,
                                    color: msg.sender === 'user' ? contrastColor : text,
                                    borderColor: msg.sender === 'bot' ? border : 'transparent'
                                }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center p-1" style={{ borderColor: border, backgroundColor: background }}>
                                <Elite65Icon className="w-full h-full" color={primary} />
                            </div>
                            <div className="border rounded-2xl rounded-tl-none p-4 flex gap-1 items-center h-10" style={{ borderColor: border, backgroundColor: background }}>
                                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: textSecondary }}></div>
                                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: textSecondary, animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: textSecondary, animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t" style={{ borderColor: border, backgroundColor: `${surface}50` }}>
                    <div className="relative flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setWasVoiceInput(false);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening..." : "Type your query..."}
                            className={`w-full border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 transition-all placeholder:opacity-50 ${isListening ? 'animate-pulse border-red-500' : ''}`}
                            style={{
                                borderColor: isListening ? '#ef4444' : border,
                                color: text,
                                caretColor: primary,
                                backgroundColor: background
                            }}
                        />

                        {/* Voice Button - Project Muted */}
                        {false && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
                            <button
                                onClick={toggleListening}
                                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-black/5'}`}
                                style={{ color: isListening ? '#ef4444' : textSecondary }}
                                title="Voice Command"
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        )}

                        <button
                            id="chat-send-btn"
                            onClick={() => handleSend(false)}
                            disabled={!inputValue.trim()}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: inputValue.trim() ? primary : textSecondary }}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-[10px] text-center mt-2 opacity-50" style={{ color: textSecondary }}>
                        Elite65 v1.0. Local Neural Net. {('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? '• Voice Active' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Global definition for Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
