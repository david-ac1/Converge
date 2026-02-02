'use client';

/**
 * Convergence Mapping Page
 * Interactive heatmap showing global migration pressure patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ConvergenceHeatmap from '@/components/ConvergenceHeatmap';
import NationalitySelector from '@/components/NationalitySelector';
import CountryPressurePanel from '@/components/CountryPressurePanel';
import ConvergenceSignals from '@/components/ConvergenceSignals';
import { ConvergenceReport, CountryConvergence } from '@/lib/convergenceEngine';

export default function ConvergencePage() {
    const router = useRouter();
    const [originCountry, setOriginCountry] = useState('ng');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [convergenceData, setConvergenceData] = useState<ConvergenceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch convergence data
    const fetchConvergenceData = useCallback(async (origin: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/convergence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originCountry: origin })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch convergence data');
            }

            const data: ConvergenceReport = await response.json();
            setConvergenceData(data);
        } catch (err: any) {
            console.error('Convergence fetch error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch on mount and when origin changes
    useEffect(() => {
        fetchConvergenceData(originCountry);
    }, [originCountry, fetchConvergenceData]);

    // Handle origin change
    const handleOriginChange = (code: string) => {
        setOriginCountry(code);
        setSelectedCountry(null);
    };

    // Fetch specific country data if missing
    const fetchCountryDetails = async (countryCode: string) => {
        try {
            const response = await fetch('/api/convergence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originCountry,
                    targetCountries: [countryCode]
                })
            });

            if (!response.ok) return;

            const data: ConvergenceReport = await response.json();
            const newCountryData = data.convergenceData[0];

            if (newCountryData) {
                setConvergenceData(prev => {
                    if (!prev) return data;
                    // specialized merge to avoid duplicates
                    const existing = prev.convergenceData.filter(c => c.countryCode !== countryCode);
                    return {
                        ...prev,
                        convergenceData: [...existing, newCountryData]
                    };
                });
            }
        } catch (err) {
            console.error('Failed to fetch details for:', countryCode);
        }
    };

    // Handle country click
    const handleCountryClick = (code: string) => {
        const isSelected = code === selectedCountry;
        setSelectedCountry(isSelected ? null : code);

        // If selecting a new country and we don't have its data, fetch it
        if (!isSelected && code && convergenceData) {
            const hasData = convergenceData.convergenceData.some(c => c.countryCode === code);
            if (!hasData) {
                fetchCountryDetails(code);
            }
        }
    };

    // Get selected country data
    const selectedCountryData: CountryConvergence | null =
        selectedCountry && convergenceData
            ? convergenceData.convergenceData.find(c => c.countryCode === selectedCountry) || null
            : null;

    // Temporary mock for loading state if selected but no data yet
    const resolveSelectedData = (): CountryConvergence | null => {
        if (!selectedCountry) return null;
        if (selectedCountryData) return selectedCountryData;

        // Return a loading placeholder structure
        return {
            country: 'Loading...',
            countryCode: selectedCountry,
            pressureScore: 0,
            pressureFromOrigin: 0,
            isTop15: false,
            trend: 'stable',
            topOrigins: [],
            pathwayCongestion: { student: 0, skilled: 0, investment: 0, family: 0 },
            predictions: [{ type: 'neutral', title: 'Analyzing...', summary: 'Fetching real-time convergence data...', confidence: 0, timeframe: '...' }],
            opportunityScore: 0
        };
    };

    const activeData = resolveSelectedData();

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#10101a] to-[#0a0a0f] text-white flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-primary/10">
                <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                        >
                            <span className="text-lg">←</span>
                            <span className="font-mono text-sm">BACK</span>
                        </button>
                        <div className="h-6 w-px bg-primary/20" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded flex items-center justify-center">
                                <span className="text-lg">🌐</span>
                            </div>
                            <div>
                                <h1 className="font-mono text-sm tracking-wider text-cyan-400">CONVERGENCE MAPPING</h1>
                                <p className="text-[10px] text-white/40">Global Migration Pressure Analysis</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {convergenceData && (
                            <div className="text-right">
                                <div className="font-mono text-[9px] text-white/40">LAST UPDATED</div>
                                <div className="text-xs text-white/60">
                                    {new Date(convergenceData.generatedAt).toLocaleTimeString()}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => fetchConvergenceData(originCountry)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/50 rounded text-xs text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : '↻ Refresh'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 flex">
                {/* Left Sidebar - Nationality Selector */}
                <aside className="w-64 flex-shrink-0">
                    <NationalitySelector
                        selectedOrigin={originCountry}
                        onOriginChange={handleOriginChange}
                    />
                </aside>

                {/* Center - Map */}
                <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)]">
                    {/* Map Area */}
                    <div className="flex-1 p-4">
                        {isLoading ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/40 border border-primary/20 rounded-lg">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
                                />
                            </div>
                        ) : error ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/40 border border-red-500/20 rounded-lg">
                                <div className="text-center">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <div className="text-red-400 text-sm mb-2">Error Loading Data</div>
                                    <p className="text-white/50 text-xs mb-4">{error}</p>
                                    <button
                                        onClick={() => fetchConvergenceData(originCountry)}
                                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : convergenceData ? (
                            <ConvergenceHeatmap
                                convergenceData={convergenceData.convergenceData}
                                selectedCountry={selectedCountry}
                                onCountryClick={handleCountryClick}
                                originCountry={originCountry}
                            />
                        ) : null}
                    </div>

                    {/* Bottom - Signals Feed */}
                    {convergenceData && (
                        <ConvergenceSignals signals={convergenceData.globalSignals} />
                    )}
                </div>

                {/* Right Sidebar - Country Detail Panel */}
                <aside className="w-80 flex-shrink-0">
                    <CountryPressurePanel
                        country={activeData}
                        originCountry={originCountry}
                        onClose={() => setSelectedCountry(null)}
                    />
                </aside>
            </main>

            {/* Thought Signature */}
            {convergenceData?._thoughtSignature && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="px-4 py-2 bg-black/90 border border-primary/20 rounded-full">
                        <span className="text-[10px] text-white/40 font-mono">
                            {convergenceData._thoughtSignature}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
