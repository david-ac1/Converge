'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { PassportHolograph } from '@/components/PassportHolograph';
import { ProjectionTimeline } from '@/components/ProjectionTimeline';
import { CountrySelector } from '@/components/CountrySelector';

interface Country {
    code: string;
    name: string;
    nodes: number;
    power: number;
}

interface ProjectionResult {
    country: string;
    countryCode: string;
    currentRank: number;
    currentVisaFree: number;
    projection: any[];
    thoughtSignature: string;
    generatedAt: Date;
}

const COUNTRIES: Country[] = [
    // TOP 10
    { code: 'sg', name: 'Singapore', nodes: 195, power: 99.4 },
    { code: 'jp', name: 'Japan', nodes: 193, power: 98.5 },
    { code: 'de', name: 'Germany', nodes: 192, power: 97.9 },
    { code: 'fr', name: 'France', nodes: 192, power: 97.9 },
    { code: 'it', name: 'Italy', nodes: 192, power: 97.9 },
    { code: 'es', name: 'Spain', nodes: 192, power: 97.9 },
    { code: 'kr', name: 'South Korea', nodes: 191, power: 97.4 },
    { code: 'fi', name: 'Finland', nodes: 191, power: 97.4 },
    { code: 'at', name: 'Austria', nodes: 190, power: 96.9 },
    { code: 'se', name: 'Sweden', nodes: 190, power: 96.9 },
    // 11-20
    { code: 'gb', name: 'United Kingdom', nodes: 189, power: 96.4 },
    { code: 'us', name: 'USA', nodes: 186, power: 94.8 },
    { code: 'au', name: 'Australia', nodes: 186, power: 94.8 },
    { code: 'nz', name: 'New Zealand', nodes: 186, power: 94.8 },
    { code: 'ae', name: 'UAE', nodes: 185, power: 94.3 },
    { code: 'ch', name: 'Switzerland', nodes: 184, power: 93.8 },
    { code: 'ca', name: 'Canada', nodes: 184, power: 93.8 },
    { code: 'pt', name: 'Portugal', nodes: 187, power: 95.3 },
    { code: 'nl', name: 'Netherlands', nodes: 190, power: 96.9 },
    { code: 'be', name: 'Belgium', nodes: 189, power: 96.4 },
    // 21-30 (MID TIER)
    { code: 'my', name: 'Malaysia', nodes: 182, power: 92.8 },
    { code: 'br', name: 'Brazil', nodes: 170, power: 86.7 },
    { code: 'mx', name: 'Mexico', nodes: 159, power: 81.0 },
    { code: 'ar', name: 'Argentina', nodes: 172, power: 87.7 },
    { code: 'cl', name: 'Chile', nodes: 176, power: 89.7 },
    { code: 'za', name: 'South Africa', nodes: 106, power: 54.0 },
    { code: 'th', name: 'Thailand', nodes: 81, power: 41.3 },
    { code: 'tr', name: 'Turkey', nodes: 119, power: 60.7 },
    { code: 'cn', name: 'China', nodes: 85, power: 43.4 },
    { code: 'in', name: 'India', nodes: 62, power: 31.6 },
    // 31-50 (LOWER TIER)
    { code: 'ng', name: 'Nigeria', nodes: 45, power: 22.9 },
    { code: 'gh', name: 'Ghana', nodes: 67, power: 34.2 },
    { code: 'ke', name: 'Kenya', nodes: 75, power: 38.3 },
    { code: 'eg', name: 'Egypt', nodes: 54, power: 27.6 },
    { code: 'pk', name: 'Pakistan', nodes: 35, power: 17.9 },
    { code: 'bd', name: 'Bangladesh', nodes: 42, power: 21.4 },
    { code: 'et', name: 'Ethiopia', nodes: 47, power: 24.0 },
    { code: 'tz', name: 'Tanzania', nodes: 67, power: 34.2 },
    { code: 'ug', name: 'Uganda', nodes: 67, power: 34.2 },
    { code: 'rw', name: 'Rwanda', nodes: 68, power: 34.7 },
    { code: 'sn', name: 'Senegal', nodes: 65, power: 33.2 },
    { code: 'cm', name: 'Cameroon', nodes: 54, power: 27.6 },
    { code: 'dz', name: 'Algeria', nodes: 55, power: 28.1 },
    { code: 'ma', name: 'Morocco', nodes: 69, power: 35.2 },
    { code: 'tn', name: 'Tunisia', nodes: 72, power: 36.7 },
    { code: 'jo', name: 'Jordan', nodes: 55, power: 28.1 },
    { code: 'lb', name: 'Lebanon', nodes: 49, power: 25.0 },
    { code: 'lk', name: 'Sri Lanka', nodes: 44, power: 22.4 },
    { code: 'np', name: 'Nepal', nodes: 40, power: 20.4 },
    { code: 'af', name: 'Afghanistan', nodes: 28, power: 14.3 },
];

export default function PassportLogicPage() {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [projection, setProjection] = useState<ProjectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjection = useCallback(async (country: Country) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/passport/projection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: country.name, countryCode: country.code })
            });

            if (!res.ok) throw new Error('Failed to fetch projection');

            const data = await res.json();
            setProjection(data);
        } catch (err) {
            console.error('Projection fetch error:', err);
            setError('Failed to generate projection. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        fetchProjection(country);
    };

    // Create passport data for holograph
    const passportData = selectedCountry ? {
        country: selectedCountry.name,
        rank: COUNTRIES.findIndex(c => c.code === selectedCountry.code) + 1,
        visaFree: selectedCountry.nodes,
        color: '#1a1a2e'
    } : null;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-primary/10 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-40 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-display font-black tracking-tight text-lg text-white uppercase hover:text-primary transition-colors">
                        CONVERGE
                    </Link>
                    <div className="h-4 w-px bg-primary/20"></div>
                    <div className="font-mono text-[10px] text-primary/60 tracking-widest uppercase">
                        / PASSPORT_POWER_PROJECTION
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors uppercase"
                    >
                        [DASHBOARD]
                    </Link>
                    <div className="font-mono text-[10px] text-green-500 uppercase">
                        GEMINI_GROUNDED
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-56px)] overflow-hidden">
                {/* Left Column: Selector & Holograph */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {/* Country Selector */}
                    <div className="space-y-4">
                        <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">
                            Select Passport
                        </div>
                        <CountrySelector
                            countries={COUNTRIES}
                            selectedCountry={selectedCountry}
                            onSelect={handleCountrySelect}
                        />
                    </div>

                    {/* Passport Holograph */}
                    {passportData && (
                        <div className="blueprint-border p-4 bg-background/40">
                            <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest mb-4">
                                Identity_Matrix
                            </div>
                            <PassportHolograph
                                origin={passportData}
                                target={null}
                            />
                        </div>
                    )}

                    {/* Current Stats */}
                    {projection && (
                        <div className="blueprint-border p-4 bg-background/40 space-y-4">
                            <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest">
                                Current Status
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-mono text-[9px] text-primary/40 uppercase">Henley Rank</div>
                                    <div className="font-display text-3xl font-black text-white">#{projection.currentRank}</div>
                                </div>
                                <div>
                                    <div className="font-mono text-[9px] text-primary/40 uppercase">Visa-Free</div>
                                    <div className="font-display text-3xl font-black text-primary">{projection.currentVisaFree}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thought Signature */}
                    {projection?.thoughtSignature && (
                        <div className="blueprint-border p-4 bg-background/40">
                            <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest mb-2">
                                AI Reasoning Trace
                            </div>
                            <p className="font-mono text-[10px] text-white/50 leading-relaxed">
                                {projection.thoughtSignature}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Projection Timeline */}
                <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
                    <div className="blueprint-border p-6 bg-background/40 flex-1 flex flex-col">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm mb-4">
                                <p className="font-mono text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <ProjectionTimeline
                            projection={projection?.projection || []}
                            baselineVisaFree={selectedCountry?.nodes || 100}
                            isLoading={isLoading}
                        />

                        {!selectedCountry && !isLoading && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="font-mono text-4xl text-primary/20">📊</div>
                                    <div className="font-mono text-sm text-primary/40">
                                        Select a passport to view 10-year power projection
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
