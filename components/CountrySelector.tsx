'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlagUrl } from '@/lib/flagUtils';

interface Country {
    code: string;
    name: string;
    nodes: number;
    power: number;
}

interface CountrySelectorProps {
    countries: Country[];
    selectedCountry: Country | null;
    onSelect: (country: Country) => void;
}

export function CountrySelector({ countries, selectedCountry, onSelect }: CountrySelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredCountries = useMemo(() => {
        if (!searchQuery) return countries;
        const query = searchQuery.toLowerCase();
        return countries.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        );
    }, [countries, searchQuery]);

    return (
        <div className="relative w-full">
            {/* Selected Display / Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 blueprint-border bg-background/50 flex items-center justify-between hover:border-primary/40 transition-colors"
            >
                {selectedCountry ? (
                    <div className="flex items-center gap-3">
                        <img
                            src={getFlagUrl(selectedCountry.code, 'medium')}
                            alt={selectedCountry.name}
                            className="w-8 h-auto"
                        />
                        <div className="text-left">
                            <div className="font-display font-bold text-white">{selectedCountry.name}</div>
                            <div className="font-mono text-[10px] text-primary/60">
                                RANK #{countries.findIndex(c => c.code === selectedCountry.code) + 1} | {selectedCountry.nodes} DESTINATIONS
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="font-mono text-sm text-primary/40">Select a passport...</div>
                )}
                <span className="material-symbols-outlined text-primary/40">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1 blueprint-border bg-background/95 backdrop-blur-md max-h-80 overflow-hidden flex flex-col"
                    >
                        {/* Search Input */}
                        <div className="p-3 border-b border-primary/10">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/40 text-sm">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search passports..."
                                    className="w-full bg-primary/5 border border-primary/20 pl-10 pr-4 py-2 font-mono text-sm text-white placeholder:text-primary/30 focus:outline-none focus:border-primary/50"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Country List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredCountries.map((country, idx) => (
                                <button
                                    key={country.code}
                                    onClick={() => {
                                        onSelect(country);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full p-3 flex items-center gap-3 hover:bg-primary/10 transition-colors border-b border-primary/5 ${selectedCountry?.code === country.code ? 'bg-primary/20' : ''
                                        }`}
                                >
                                    <img
                                        src={getFlagUrl(country.code, 'medium')}
                                        alt={country.name}
                                        className="w-6 h-auto"
                                    />
                                    <div className="flex-1 text-left">
                                        <div className="font-mono text-sm text-white">{country.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-xs text-primary">{country.nodes}</div>
                                        <div className="font-mono text-[9px] text-primary/40">DEST</div>
                                    </div>
                                    <div className="w-12">
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${country.power}%` }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="p-4 text-center font-mono text-sm text-primary/40">
                                    No passports found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
