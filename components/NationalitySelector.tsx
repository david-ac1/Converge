'use client';

/**
 * Nationality Selector Component
 * Sidebar for selecting origin passport to personalize convergence map
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagUrl } from '@/lib/flagUtils';
import { COUNTRY_NAMES, COMMON_ORIGINS } from '@/lib/convergenceEngine';

// All countries list
const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
    code,
    name
})).sort((a, b) => a.name.localeCompare(b.name));

interface NationalitySelectorProps {
    selectedOrigin: string;
    onOriginChange: (code: string) => void;
}

export default function NationalitySelector({
    selectedOrigin,
    onOriginChange
}: NationalitySelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return ALL_COUNTRIES;
        const query = searchQuery.toLowerCase();
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const selectedCountry = ALL_COUNTRIES.find(c => c.code === selectedOrigin);

    return (
        <div className="h-full bg-black/60 border-r border-primary/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary/20">
                <div className="font-mono text-[10px] text-primary/60 tracking-[0.2em] mb-2">
                    SELECT YOUR PASSPORT
                </div>
                <div className="text-white/80 text-xs">
                    Choose your nationality to see personalized convergence data
                </div>
            </div>

            {/* Current Selection */}
            <div
                className="p-4 border-b border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="font-mono text-[9px] text-cyan-400 tracking-widest mb-2">CURRENT SELECTION</div>
                <div className="flex items-center gap-3">
                    <img
                        src={getFlagUrl(selectedOrigin, 'medium')}
                        alt={selectedCountry?.name || ''}
                        className="w-8 h-auto rounded shadow-lg"
                    />
                    <div>
                        <div className="text-white font-bold">{selectedCountry?.name || selectedOrigin.toUpperCase()}</div>
                        <div className="text-xs text-white/50 font-mono">{selectedOrigin.toUpperCase()}</div>
                    </div>
                    <motion.span
                        className="ml-auto text-primary/60"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                    >
                        ▼
                    </motion.span>
                </div>
            </div>

            {/* Expandable Selection */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-primary/20"
                    >
                        {/* Search */}
                        <div className="p-3">
                            <input
                                type="text"
                                placeholder="Search countries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        {/* Quick Picks */}
                        <div className="px-3 pb-2">
                            <div className="font-mono text-[9px] text-white/40 tracking-widest mb-2">QUICK PICKS</div>
                            <div className="flex flex-wrap gap-1">
                                {COMMON_ORIGINS.map(code => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            onOriginChange(code);
                                            setIsExpanded(false);
                                        }}
                                        className={`px-2 py-1 rounded text-xs transition-all ${selectedOrigin === code
                                                ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {COUNTRY_NAMES[code] || code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-[300px] overflow-y-auto px-2 pb-3">
                            {filteredCountries.map(country => (
                                <button
                                    key={country.code}
                                    onClick={() => {
                                        onOriginChange(country.code);
                                        setIsExpanded(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-2 py-2 rounded transition-all ${selectedOrigin === country.code
                                            ? 'bg-cyan-500/20 border border-cyan-500/50'
                                            : 'hover:bg-white/5'
                                        }`}
                                >
                                    <img
                                        src={getFlagUrl(country.code, 'small')}
                                        alt={country.name}
                                        className="w-5 h-auto"
                                    />
                                    <span className="text-sm text-white/80">{country.name}</span>
                                    <span className="ml-auto text-[10px] text-white/30 font-mono">{country.code.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Panel */}
            <div className="p-4 mt-auto border-t border-primary/20">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-2">HOW IT WORKS</div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                    Your nationality affects:
                </p>
                <ul className="text-[10px] text-white/40 mt-2 space-y-1">
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        Pressure scores from your origin
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        Pathway congestion levels
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        Policy predictions relevant to you
                    </li>
                </ul>
            </div>
        </div>
    );
}
