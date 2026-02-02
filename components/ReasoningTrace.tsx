'use client';

/**
 * Reasoning Trace Component
 * Visualizes the AI's "System 2" thinking process
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReasoningTraceProps {
    thoughts: string[];
    isThinking: boolean;
    isComplete: boolean;
}

export default function ReasoningTrace({ thoughts, isThinking, isComplete }: ReasoningTraceProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Auto-collapse on complete after delay
    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => setIsOpen(false), 3000);
            return () => clearTimeout(timer);
        } else {
            setIsOpen(true);
        }
    }, [isComplete]);

    return (
        <div className="w-full mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/70 hover:text-cyan-400 mb-2 transition-colors uppercase tracking-widest"
            >
                <span className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500/50'}`} />
                {isThinking ? 'NEURAL ENGINE ACTIVE...' : 'REASONING TRACE'}
                <span className="text-[8px] opacity-50 ml-1">{isOpen ? '[-]' : '[+]'}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-black/40 border-l border-cyan-500/20 py-2 pl-3 space-y-1 relative">
                            {/* Matrix Rain Effect - subtle background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                            {thoughts.map((thought, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[10px] font-mono text-cyan-100/60 leading-relaxed flex items-start gap-2"
                                >
                                    <span className="text-cyan-500/40 mt-0.5">›</span>
                                    {thought}
                                </motion.div>
                            ))}

                            {isThinking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[10px] font-mono text-cyan-400/50 flex items-center gap-1"
                                >
                                    <span className="animate-pulse">_</span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
