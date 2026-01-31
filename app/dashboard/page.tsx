'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUserMigrationState } from '@/hooks/useUserMigrationState';
import { useTavus } from '@/components/providers/TavusProvider';

// Dynamic imports for dashboard components
const DashboardVolatilityRadar = dynamic(() => import('@/components/VolatilityRadar'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-primary/5 animate-pulse" />
});

const DashboardExpertHub = dynamic(() => import('@/components/ExpertHub'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-primary/5 animate-pulse" />
});

const ConvergenceMap = dynamic(() => import('@/components/ConvergenceMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-primary/5 animate-pulse" />
});


export default function DashboardPage() {
    const { state, generatePlan, updateGeopoliticalProfile } = useUserMigrationState();
    const { updateContext } = useTavus();
    const [currentYear, setCurrentYear] = useState(0);

    // Auto-generate plan if initialized but no plan
    useEffect(() => {
        if (state?.currentState && state?.goalState && !state.activePlan) {
            console.log('Auto-triggering migration plan generation...');
            generatePlan(10).catch(err => console.error('Auto-plan failed:', err));

            // Trigger Agent Alpha (Passport Analysis)
            // Use mock ID if not set, or extract from user
            const passportId = state.currentState.metadata?.citizenship || 'USA'; // Default for demo

            fetch('/api/passport/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passportId: passportId,
                    context: { location: state.currentState.location }
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.reputationScore !== undefined) {
                        updateGeopoliticalProfile(data);
                    }
                })
                .catch(err => console.error('Passport Analysis failed:', err));
        }
    }, [state?.currentState, state?.goalState, state?.activePlan, generatePlan, updateGeopoliticalProfile]);

    // Update Tavus context when year changes
    useEffect(() => {
        updateContext({
            focusedYear: currentYear,
            topic: `Discussion about year ${currentYear} of the plan`,
            // Pass thought signature if available
            thoughtSignature: state?.sessionMetadata?.thoughtSignature
        });
    }, [currentYear, updateContext, state?.sessionMetadata?.thoughtSignature]);

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const year = parseFloat(e.target.value);
        setCurrentYear(year);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Top Navigation */}
            <header className="h-14 border-b border-primary/10 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-40 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="font-display font-black tracking-tight text-lg text-white uppercase">CONVERGE</div>
                    <div className="h-4 w-px bg-primary/20"></div>
                    <div className="font-mono text-[10px] text-primary/60 tracking-widest uppercase">/ SIMULATION_DASHBOARD</div>
                </div>
                <div className="flex items-center gap-6 font-mono text-[10px] text-primary/40 uppercase">
                    <span>RAM: 64%</span>
                    <span>CPU: 12%</span>
                    <span className="text-primary">NET: SECURE</span>
                </div>
            </header>

            {/* Main Grid Layout */}
            <main className="flex-1 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-56px)] overflow-hidden">

                {/* Left Column: Volatility & Metrics (3 Cols) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                    <h2 className="sr-only">Metrics</h2>
                    <div className="h-[400px]">
                        <DashboardVolatilityRadar riskProfile={state?.geopoliticalProfile} />
                    </div>

                    {/* Additional Metric Box */}
                    <div className="blueprint-border p-6 bg-background/50 flex-1 flex flex-col gap-4">
                        <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest border-b border-primary/10 pb-2">Log_Output</div>
                        <div className="flex-1 font-mono text-[9px] text-primary/60 space-y-2 overflow-hidden">
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:22]</span> SYS_INIT_COMPLETE</div>
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:23]</span> PASSPORT_DATA_LOADED</div>
                            {state?.activePlan ? (
                                <>
                                    <div className="flex gap-2"><span className="text-primary/30">[14:02:24]</span> PLAN_GENERATED</div>
                                    <div className="flex gap-2 text-white"><span className="text-primary/30">[14:02:25]</span> {state.sessionMetadata.thoughtSignature ? "THOUGHT_SIG_CAPTURED" : "REASONING_ACTIVE"}</div>
                                </>
                            ) : (
                                <div className="flex gap-2 animate-pulse"><span className="text-primary/30">[14:02:24]</span> AWAITING_PLAN...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center Column: Convergence Map (6 Cols) */}
                <div className="col-span-12 lg:col-span-6 flex flex-col h-full bg-black/20 border border-primary/10 relative rounded-sm overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-primary/40 uppercase bg-black/60 px-2 py-1 border border-primary/20 backdrop-blur-sm">
                        VIEW: MIGRATION_VECTOR_1
                    </div>

                    {/* Convergence Map Render Area */}
                    <div className="w-full h-full relative">
                        <ConvergenceMap
                            migrationPlan={state?.activePlan || null}
                            currentYear={currentYear}
                        />
                    </div>

                    {/* Scrubber Area */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-background/90 border-t border-primary/10 flex items-center px-6 gap-4 z-20">
                        <button
                            className="material-symbols-outlined text-primary/60 hover:text-primary transition-colors"
                            onClick={() => setCurrentYear(prev => Math.min(10, prev + 1))}
                        >
                            play_circle
                        </button>

                        <div className="flex-1 relative flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.1"
                                value={currentYear}
                                onChange={handleScrubberChange}
                                className="w-full h-1 bg-primary/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00D1FF]"
                            />
                        </div>

                        <span className="font-mono text-xs text-primary font-bold min-w-[60px]">
                            YEAR_{currentYear.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* Right Column: Expert Link (3 Cols) */}
                <div className="col-span-12 lg:col-span-3 h-full">
                    <DashboardExpertHub />
                </div>

            </main>
        </div>
    );
}
