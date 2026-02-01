'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectionSignal {
    type: 'policy' | 'economic' | 'geopolitical' | 'bilateral';
    title: string;
    summary: string;
    impact: 'positive' | 'negative' | 'neutral';
    source?: string;
}

interface YearProjection {
    year: number;
    trend: 'improving' | 'stable' | 'declining';
    visaFreeEstimate: number;
    signals: ProjectionSignal[];
    reasoning: string;
}

interface ProjectionTimelineProps {
    projection: YearProjection[];
    baselineVisaFree: number;
    isLoading?: boolean;
}

export function ProjectionTimeline({ projection, baselineVisaFree, isLoading }: ProjectionTimelineProps) {
    const [selectedYear, setSelectedYear] = useState<YearProjection | null>(null);

    if (isLoading) {
        return (
            <div className="w-full p-8 blueprint-border bg-background/50">
                <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest mb-6">
                    Generating 10-Year Projection...
                </div>
                <div className="flex gap-2 justify-between">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex-1 h-24 bg-primary/10 animate-pulse rounded-sm" />
                    ))}
                </div>
            </div>
        );
    }

    if (!projection || projection.length === 0) {
        return (
            <div className="w-full p-8 blueprint-border bg-background/50">
                <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">
                    Select a passport to view projection
                </div>
            </div>
        );
    }

    const maxVisaFree = Math.max(...projection.map(p => p.visaFreeEstimate), baselineVisaFree);
    const minVisaFree = Math.min(...projection.map(p => p.visaFreeEstimate), baselineVisaFree);
    const range = maxVisaFree - minVisaFree || 1;

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving': return 'bg-green-500';
            case 'declining': return 'bg-red-500';
            default: return 'bg-yellow-500';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return '↑';
            case 'declining': return '↓';
            default: return '→';
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">
                    10-Year Power Projection
                </div>
                <div className="flex gap-4 font-mono text-[9px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Improving</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full" /> Stable</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Declining</span>
                </div>
            </div>

            {/* Timeline Bars */}
            <div className="flex gap-2 items-end h-32">
                {projection.map((year, idx) => {
                    const heightPercent = ((year.visaFreeEstimate - minVisaFree) / range) * 80 + 20;
                    const isSelected = selectedYear?.year === year.year;

                    return (
                        <motion.button
                            key={year.year}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedYear(isSelected ? null : year)}
                            className={`flex-1 relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : 'hover:scale-102'}`}
                        >
                            {/* Bar */}
                            <div
                                className={`w-full ${getTrendColor(year.trend)} rounded-t-sm transition-all duration-500 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                                style={{ height: `${heightPercent}%` }}
                            >
                                {/* Trend Icon */}
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-white/80">
                                    {getTrendIcon(year.trend)}
                                </div>
                            </div>

                            {/* Year Label */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] text-primary/60 whitespace-nowrap">
                                {year.year}
                            </div>

                            {/* Visa Count Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap z-10">
                                {year.visaFreeEstimate} destinations
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Year Label Spacer */}
            <div className="h-4" />

            {/* Selected Year Details */}
            <AnimatePresence>
                {selectedYear && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="blueprint-border bg-background/80 p-6 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="font-display text-2xl font-black">{selectedYear.year}</span>
                                <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${selectedYear.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                                        selectedYear.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {selectedYear.trend} {getTrendIcon(selectedYear.trend)}
                                </span>
                            </div>
                            <div className="font-mono text-lg font-bold text-primary">
                                {selectedYear.visaFreeEstimate} <span className="text-[10px] text-primary/60">DESTINATIONS</span>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <p className="font-mono text-sm text-white/60 border-l-2 border-primary/30 pl-4">
                            {selectedYear.reasoning}
                        </p>

                        {/* Signals */}
                        <div className="space-y-3">
                            <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">
                                Trend Signals
                            </div>
                            <div className="grid gap-2">
                                {selectedYear.signals.map((signal, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-sm border-l-2 ${signal.impact === 'positive' ? 'border-green-500 bg-green-500/5' :
                                                signal.impact === 'negative' ? 'border-red-500 bg-red-500/5' :
                                                    'border-yellow-500 bg-yellow-500/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-mono uppercase text-primary/40">
                                                [{signal.type}]
                                            </span>
                                            <span className="font-mono text-sm font-bold text-white/90">
                                                {signal.title}
                                            </span>
                                        </div>
                                        <p className="font-mono text-xs text-white/50">
                                            {signal.summary}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedYear(null)}
                            className="text-[10px] font-mono text-primary/60 hover:text-primary transition-colors uppercase"
                        >
                            [CLOSE]
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
