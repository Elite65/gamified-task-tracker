import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Check } from 'lucide-react';

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ selectedSkills, onChange }) => {
    const { userStats } = useGame();
    const [isAdding, setIsAdding] = useState(false);
    const [newSkillText, setNewSkillText] = useState('');

    // Get unique existing skills from graph
    const existingSkills = Object.values(userStats.skills || {})
        .map(s => s.name)
        .sort();

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

                {/* Add New Button */}
                {isAdding ? (
                    <form onSubmit={handleAddCustom} className="flex items-center gap-1">
                        <input
                            autoFocus
                            value={newSkillText}
                            onChange={(e) => setNewSkillText(e.target.value)}
                            onBlur={() => {
                                // If empty, close. If not empty, maybe user clicked away? Let's just keep it open or auto-submit?
                                // Safer to just close if empty.
                                if (!newSkillText.trim()) setIsAdding(false);
                            }}
                            className="bg-black/50 border border-tech-primary text-white text-xs rounded-full px-3 py-1.5 w-32 outline-none"
                            placeholder="New Skill..."
                        />
                        <button
                            type="submit"
                            disabled={!newSkillText.trim()}
                            className="p-1 bg-tech-primary rounded-full text-black hover:opacity-80 disabled:opacity-50"
                        >
                            <Check className="w-3 h-3" />
                        </button>
                    </form>
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
