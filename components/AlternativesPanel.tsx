'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Alternative {
    country: string;
    reason: string;
    difficulty: 'low' | 'medium' | 'high';
}

interface AlternativesPanelProps {
    alternatives: Alternative[] | null;
    onSelect: (country: string) => void;
    isLoading: boolean;
}

export function AlternativesPanel({ alternatives, onSelect, isLoading }: AlternativesPanelProps) {
    if (!alternatives || alternatives.length === 0) return null;

    return (
        <div className="blueprint-border p-4 bg-background/40 space-y-4">
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest">
                    Scout_Suggestions // Path_Variance
                </div>
                {isLoading && (
                    <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                )}
            </div>

            <div className="space-y-3">
                {alternatives.map((alt, i) => (
                    <motion.button
                        key={alt.country}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelect(alt.country)}
                        disabled={isLoading}
                        className="w-full text-left group p-3 border border-primary/10 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all rounded-sm relative overflow-hidden"
                    >
                        {/* Decorative background number */}
                        <span className="absolute -right-2 -bottom-4 text-4xl font-display font-black text-primary/5 select-none pointer-events-none">
                            0{i + 1}
                        </span>

                        <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-display font-bold text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                {alt.country}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 border rounded-full uppercase tracking-tighter ${alt.difficulty === 'low' ? 'border-green-500/50 text-green-400' :
                                    alt.difficulty === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                                        'border-red-500/50 text-red-400'
                                }`}>
                                Ease: {alt.difficulty}
                            </span>
                        </div>

                        <p className="text-[10px] text-gray-400 font-sans leading-tight">
                            {alt.reason}
                        </p>

                        <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-mono text-primary uppercase">Pivot Trajectory</span>
                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="text-[8px] font-mono text-primary/30 italic text-center">
                * Based on ease, volatility, and professional alignment.
            </div>
        </div>
    );
}
