'use client';

/**
 * Resilience Gauge Component
 * Radial visualization of plan robustness
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ResilienceGaugeProps {
    score: number; // 0-100
    riskFactors: string[];
    isLoading?: boolean;
}

export default function ResilienceGauge({ score, riskFactors, isLoading = false }: ResilienceGaugeProps) {
    // Color scale
    const getColor = (s: number) => {
        if (s >= 80) return '#22c55e'; // Green
        if (s >= 50) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    const color = getColor(score);
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-black/20 border border-white/5 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    RESILIENCE SCORE
                </div>
                {isLoading && (
                    <div className="text-[9px] text-cyan-400 animate-pulse">VERIFYING...</div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Radial Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-white/5"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="48"
                            cy="48"
                            r="40"
                            stroke={color}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white font-mono">
                            {score}
                        </span>
                        <span className="text-[8px] text-white/30">%</span>
                    </div>
                </div>

                {/* Risk Factors */}
                <div className="flex-1 space-y-2">
                    {riskFactors.length > 0 ? (
                        riskFactors.map((factor, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-2"
                            >
                                <span className="text-red-400/80 mt-0.5 text-[8px]">▲</span>
                                <span className="text-[10px] text-white/60 leading-tight">
                                    {factor}
                                </span>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-[10px] text-green-400/60 leading-tight flex items-center gap-2">
                            <span>✓</span> No critical verifications failed.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-white/30 text-center font-mono">
                AUTONOMOUS STRESS-TEST COMPLETE
            </div>
        </div>
    );
}
