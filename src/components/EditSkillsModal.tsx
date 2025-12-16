import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { SkillStats } from '../types';

interface EditSkillsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSkills: Record<string, SkillStats>;
    onSave: (newSkills: Record<string, SkillStats>) => void;
}

export const EditSkillsModal: React.FC<EditSkillsModalProps> = ({ isOpen, onClose, currentSkills, onSave }) => {
    const [skills, setSkills] = useState<Record<string, SkillStats>>(JSON.parse(JSON.stringify(currentSkills)));
    const [newSkillName, setNewSkillName] = useState('');

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkillName.trim()) return;

        const name = newSkillName.trim();
        if (skills[name]) return; // Prevent duplicates

        setSkills(prev => ({
            ...prev,
            [name]: { name, value: 0, level: 1 }
        }));
        setNewSkillName('');
    };

    const handleDeleteSkill = (skillName: string) => {
        const newSkills = { ...skills };
        delete newSkills[skillName];
        setSkills(newSkills);
    };

    const handleSave = () => {
        onSave(skills);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm text-tech-text">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-tech-surface border-t md:border border-tech-border rounded-t-3xl md:rounded-3xl p-6 shadow-2xl h-[80vh] md:max-h-[80vh] md:h-auto flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Edit Skills</h3>
                            <button onClick={onClose} className="p-2 hover:bg-tech-surface-hover rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10 md:pb-0">
                            {Object.values(skills).map(skill => (
                                <div key={skill.name} className="flex items-center justify-between p-3 bg-tech-bg/50 rounded-xl border border-tech-border">
                                    <div>
                                        <p className="font-bold">{skill.name}</p>
                                        <p className="text-xs text-tech-text-secondary">Level {skill.level} • {skill.value} XP</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSkill(skill.name)}
                                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-4 pt-4 border-t border-tech-border pb-24 md:pb-0">
                            <form onSubmit={handleAddSkill} className="flex gap-2">
                                <input
                                    value={newSkillName}
                                    onChange={e => setNewSkillName(e.target.value)}
                                    placeholder="New Skill Name"
                                    className="flex-1 bg-tech-bg border border-tech-border rounded-xl p-4 md:p-3 text-base md:text-sm focus:border-tech-primary outline-none transition-colors text-tech-text"
                                />
                                <button
                                    type="submit"
                                    disabled={!newSkillName.trim()}
                                    className="p-4 md:p-3 bg-tech-primary text-black rounded-xl hover:bg-tech-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-6 h-6 md:w-5 md:h-5" />
                                </button>
                            </form>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 md:py-3 bg-tech-primary text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5 md:w-4 md:h-4" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
