'use client';

/**
 * Country Pressure Panel Component
 * Detail panel showing convergence info for a selected country
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getFlagUrl } from '@/lib/flagUtils';
import { CountryConvergence, COUNTRY_NAMES } from '@/lib/convergenceEngine';

interface CountryPressurePanelProps {
    country: CountryConvergence | null;
    originCountry: string;
    onClose: () => void;
}

function getPressureLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: 'CRITICAL', color: 'text-red-400' };
    if (score >= 60) return { label: 'HIGH', color: 'text-orange-400' };
    if (score >= 40) return { label: 'MODERATE', color: 'text-yellow-400' };
    return { label: 'LOW', color: 'text-green-400' };
}

function getTrendIcon(trend: string) {
    switch (trend) {
        case 'increasing': return '↗';
        case 'decreasing': return '↘';
        default: return '→';
    }
}

export default function CountryPressurePanel({
    country,
    originCountry,
    onClose
}: CountryPressurePanelProps) {
    if (!country) {
        return (
            <div className="h-full bg-black/60 border-l border-primary/20 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="text-4xl mb-4 opacity-30">🗺️</div>
                    <div className="text-white/50 text-sm">Click on a country to view</div>
                    <div className="text-white/50 text-sm">convergence details</div>
                </div>
            </div>
        );
    }

    const pressure = getPressureLabel(country.pressureScore);
    const originName = COUNTRY_NAMES[originCountry] || originCountry.toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full bg-black/60 border-l border-primary/20 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={getFlagUrl(country.countryCode, 'medium')}
                        alt={country.country}
                        className="w-10 h-auto rounded shadow-lg"
                    />
                    <div>
                        <div className="text-white font-bold text-lg">{country.country}</div>
                        <div className="flex items-center gap-2">
                            {country.isTop15 && (
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                                    TOP 15
                                </span>
                            )}
                            <span className="text-xs text-white/50 font-mono">{country.countryCode.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white/80 transition-colors text-xl"
                >
                    ×
                </button>
            </div>

            {/* Pressure Score */}
            <div className="p-4 border-b border-primary/20">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-3">MIGRATION PRESSURE</div>
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <div className={`text-4xl font-black ${pressure.color}`}>
                            {country.pressureScore}
                            <span className="text-lg text-white/30">/100</span>
                        </div>
                        <div className={`text-sm font-mono ${pressure.color}`}>{pressure.label}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl">{getTrendIcon(country.trend)}</div>
                        <div className="text-[10px] text-white/40 capitalize">{country.trend}</div>
                    </div>
                </div>

                {/* Pressure bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${country.pressureScore}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                            background: country.pressureScore >= 80 ? '#ef4444' :
                                country.pressureScore >= 60 ? '#f97316' :
                                    country.pressureScore >= 40 ? '#eab308' : '#22c55e'
                        }}
                    />
                </div>
            </div>

            {/* Your Pathway */}
            <div className="p-4 border-b border-primary/20">
                <div className="font-mono text-[9px] text-cyan-400 tracking-widest mb-3">
                    YOUR PATHWAY ({originName} → {country.country})
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-white">{country.pressureFromOrigin}</span>
                    <span className="text-xs text-white/50">/ 100 pressure from your nationality</span>
                </div>
                {country.pressureFromOrigin > country.pressureScore && (
                    <div className="text-xs text-orange-400 bg-orange-500/10 rounded px-2 py-1">
                        ⚠ Higher than average competition from {originName} passport holders
                    </div>
                )}
            </div>

            {/* Pathway Congestion */}
            <div className="p-4 border-b border-primary/20">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-3">PATHWAY CONGESTION</div>
                <div className="space-y-2">
                    {Object.entries(country.pathwayCongestion).map(([pathway, score]) => (
                        <div key={pathway} className="flex items-center gap-2">
                            <span className="text-xs text-white/60 capitalize w-20">{pathway}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${score}%`,
                                        background: score >= 80 ? '#ef4444' :
                                            score >= 60 ? '#f97316' :
                                                score >= 40 ? '#eab308' : '#22c55e'
                                    }}
                                />
                            </div>
                            <span className="text-xs font-mono text-white/40 w-8 text-right">{score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Origins */}
            <div className="p-4 border-b border-primary/20">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-3">TOP COMPETING ORIGINS</div>
                <div className="flex flex-wrap gap-2">
                    {country.topOrigins.map((origin, idx) => (
                        <div
                            key={origin}
                            className="px-2 py-1 bg-white/5 rounded text-xs text-white/70 flex items-center gap-1"
                        >
                            <span className="text-primary/50">#{idx + 1}</span>
                            {origin}
                        </div>
                    ))}
                </div>
            </div>

            {/* Predictions */}
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-3">PREDICTIONS</div>
                <div className="space-y-3">
                    {country.predictions.map((pred, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded border ${pred.type === 'warning'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : pred.type === 'opportunity'
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">
                                    {pred.type === 'warning' ? '🔴' : pred.type === 'opportunity' ? '🟢' : '🟡'}
                                </span>
                                <span className="text-sm font-bold text-white">{pred.title}</span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">{pred.summary}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
                                <span>Confidence: {Math.round(pred.confidence * 100)}%</span>
                                <span>•</span>
                                <span>{pred.timeframe}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
