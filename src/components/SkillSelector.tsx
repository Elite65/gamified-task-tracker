import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Check } from 'lucide-react';
import { INITIAL_STATS } from '../types';

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ selectedSkills, onChange }) => {
    const { userStats } = useGame();
    const [isAdding, setIsAdding] = useState(false);
    const [newSkillText, setNewSkillText] = useState('');

    // Get unique existing skills from graph, merging with default skills to always show something
    const userSkillNames = Object.values(userStats.skills || {}).map(s => s.name);
    const defaultSkillNames = Object.values(INITIAL_STATS.skills).map(s => s.name);

    // Merge: user skills + default skills (unique), maintaining user skills order then defaults
    const existingSkills = [...new Set([...userSkillNames, ...defaultSkillNames])].sort();

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            onChange(selectedSkills.filter(s => s !== skill));
        } else {
            onChange([...selectedSkills, skill]);
        }
    };

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newSkillText.trim();
        if (trimmed) {
            // Capitalize for consistency
            const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            if (!selectedSkills.includes(formatted)) {
                onChange([...selectedSkills, formatted]);
            }
            setNewSkillText('');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-mono text-gray-400 uppercase">
                Skills / Attributes
            </label>

            <div className="flex flex-wrap gap-2">
                {/* Existing Skills Chips */}
                {existingSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                                ${isSelected
                                    ? 'bg-tech-primary text-black border-tech-primary'
                                    : 'bg-black/30 text-gray-400 border-tech-border hover:border-tech-primary/50'}
                            `}
                        >
                            {skill}
                        </button>
                    );
                })}

                {/* Selected Custom Skills (that usually aren't in the list yet) */}
                {selectedSkills
                    .filter(s => !existingSkills.includes(s))
                    .map(skill => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border bg-tech-primary text-black border-tech-primary"
                        >
                            {skill}
                        </button>
                    ))}

                {/* Add New / Custom Skill Input */}
                {isAdding ? (
                    <div className="relative">
                        <form onSubmit={handleAddCustom} className="flex items-center gap-1">
                            <input
                                autoFocus
                                value={newSkillText}
                                onChange={(e) => setNewSkillText(e.target.value)}
                                className="bg-black/50 border border-tech-primary text-white text-xs rounded-full px-3 py-1.5 w-40 outline-none"
                                placeholder="Search or add..."
                            />
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <Plus className="w-3 h-3 rotate-45" /> {/* Cancel Icon */}
                            </button>
                            <button
                                type="submit"
                                disabled={!newSkillText.trim()}
                                className="p-1 bg-tech-primary rounded-full text-black hover:opacity-80 disabled:opacity-50"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                        </form>

                        {/* Autocomplete Suggestions */}
                        {newSkillText.trim() && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-tech-surface border border-tech-border rounded-lg shadow-xl z-50 overflow-hidden">
                                {existingSkills
                                    .filter(s => s.toLowerCase().includes(newSkillText.toLowerCase()) && !selectedSkills.includes(s))
                                    .slice(0, 5)
                                    .map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                toggleSkill(suggestion);
                                                setNewSkillText('');
                                                setIsAdding(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-tech-surface-hover text-tech-text"
                                        >
                                            Add "{suggestion}"
                                        </button>
                                    ))
                                }
                                <div className="px-3 py-2 text-[10px] text-tech-text-secondary border-t border-tech-border/50">
                                    Press Enter to create new: "{newSkillText}"
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed border-gray-600 text-gray-500 hover:border-tech-primary hover:text-tech-primary flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        Custom
                    </button>
                )}
            </div>
        </div>
    );
};
