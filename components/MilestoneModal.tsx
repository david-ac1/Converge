'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MigrationStep } from '@/types/migration';

interface MilestoneModalProps {
    step: MigrationStep | null;
    onClose: () => void;
}

export function MilestoneModal({ step, onClose }: MilestoneModalProps) {
    if (!step) return null;

    const proof = (step as any).multimodalProof;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0D0D0D] border border-primary/30 rounded-lg shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-primary/20 flex justify-between items-center bg-primary/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                                Milestone_Analysis // YR_{step.year} Q{step.quarter}
                            </span>
                            <h3 className="text-lg font-display font-bold text-white uppercase tracking-tight">
                                {step.title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-primary/60 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Description */}
                        <div>
                            <div className="text-[10px] font-mono text-primary/40 mb-2 uppercase tracking-widest">Description</div>
                            <p className="text-sm text-gray-300 leading-relaxed font-sans">
                                {step.description}
                            </p>
                        </div>

                        {/* Multimodal Proof */}
                        {proof && (
                            <div className="space-y-4">
                                {/* Audio Summary Script */}
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md italic">
                                    <div className="text-[9px] font-mono text-primary/60 mb-2 uppercase not-italic">AI_Synthesis // Audio_Trace</div>
                                    <p className="text-xs text-primary/90">&quot;{proof.audioScript}&quot;</p>
                                </div>

                                {/* News Evidence */}
                                <div>
                                    <div className="text-[10px] font-mono text-primary/40 mb-2 uppercase tracking-widest">Geopolitical_Evidence</div>
                                    <div className="space-y-2">
                                        {proof.newsLinks?.map((link: string, i: number) => (
                                            <div key={i} className="flex gap-3 text-xs">
                                                <span className="text-primary font-mono">[{i + 1}]</span>
                                                <span className="text-gray-400 border-b border-transparent hover:border-primary/40 cursor-pointer transition-colors">
                                                    {link}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Requirements & Metrics */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                            <div>
                                <div className="text-[10px] font-mono text-primary/40 mb-1 uppercase tracking-widest">Sentiment</div>
                                <div className={`text-xs font-mono uppercase ${proof?.sentiment === 'favorable' ? 'text-green-400' :
                                    proof?.sentiment === 'blocking' ? 'text-red-400' : 'text-primary'
                                    }`}>
                                    {proof?.sentiment || 'Neutral'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-mono text-primary/40 mb-1 uppercase tracking-widest">Probability</div>
                                <div className="text-xs font-mono text-white">{(step.probability * 100).toFixed(0)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Decoration */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
