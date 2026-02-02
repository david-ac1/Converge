'use client';

/**
 * Convergence Signals Component
 * Real-time feed of warnings and opportunities
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ConvergencePrediction } from '@/lib/convergenceEngine';

interface ConvergenceSignalsProps {
    signals: ConvergencePrediction[];
}

export default function ConvergenceSignals({ signals }: ConvergenceSignalsProps) {
    const warnings = signals.filter(s => s.type === 'warning');
    const opportunities = signals.filter(s => s.type === 'opportunity');
    const neutral = signals.filter(s => s.type === 'neutral');

    return (
        <div className="bg-black/40 border-t border-primary/20 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[10px] text-primary/60 tracking-[0.2em]">
                    GLOBAL CONVERGENCE SIGNALS
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-white/50">{warnings.length} Warnings</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-white/50">{opportunities.length} Opportunities</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Warnings Column */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-red-400">🔴</span>
                        <span className="font-mono text-[9px] text-red-400 tracking-widest">WARNINGS</span>
                    </div>
                    <div className="space-y-2">
                        {warnings.length > 0 ? warnings.map((signal, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded"
                            >
                                <div className="text-sm font-medium text-white mb-1">{signal.title}</div>
                                <p className="text-xs text-white/60 leading-relaxed">{signal.summary}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono">
                                        {signal.timeframe}
                                    </span>
                                    <span className="text-[9px] text-white/30">
                                        {Math.round(signal.confidence * 100)}% confidence
                                    </span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-xs text-white/30 p-3 bg-white/5 rounded">
                                No active warnings
                            </div>
                        )}
                    </div>
                </div>

                {/* Opportunities Column */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-green-400">🟢</span>
                        <span className="font-mono text-[9px] text-green-400 tracking-widest">OPPORTUNITIES</span>
                    </div>
                    <div className="space-y-2">
                        {opportunities.length > 0 ? opportunities.map((signal, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 bg-green-500/10 border border-green-500/20 rounded"
                            >
                                <div className="text-sm font-medium text-white mb-1">{signal.title}</div>
                                <p className="text-xs text-white/60 leading-relaxed">{signal.summary}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">
                                        {signal.timeframe}
                                    </span>
                                    <span className="text-[9px] text-white/30">
                                        {Math.round(signal.confidence * 100)}% confidence
                                    </span>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-xs text-white/30 p-3 bg-white/5 rounded">
                                No active opportunities
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Neutral Signals (if any) */}
            {neutral.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400">🟡</span>
                        <span className="font-mono text-[9px] text-yellow-400 tracking-widest">MONITORING</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {neutral.map((signal, idx) => (
                            <div
                                key={idx}
                                className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded"
                            >
                                <div className="text-xs font-medium text-white">{signal.title}</div>
                                <div className="text-[10px] text-white/50">{signal.summary}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
