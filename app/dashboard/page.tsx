'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useUserMigrationState } from '@/hooks/useUserMigrationState';
import { PassportHolograph } from '@/components/PassportHolograph';
import { MilestoneModal } from '@/components/MilestoneModal';
import { AlternativesPanel } from '@/components/AlternativesPanel';
import { MigrationStep } from '@/types/migration';

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

// Trends report type
interface TrendsReport {
    riskScore: number;
    opportunityScore: number;
    recommendation: string;
    combinedSignals: any[];
    newsAnalysis?: any;
}

export default function DashboardPage() {
    const { state, generatePlan, updateGeopoliticalProfile, initialize, initializeSimulation, clearState, switchDestination, isLoading: isStateLoading } = useUserMigrationState();
    const [currentYear, setCurrentYear] = useState(0);
    const [, setTrendsLoading] = useState(false);
    const [selectedStep, setSelectedStep] = useState<MigrationStep | null>(null);
    const [originPassport, setOriginPassport] = useState<any>(null);
    const [targetPassport, setTargetPassport] = useState<any>(null);

    // Handle onboarding completion - generate plan from interview data
    const handleOnboardingComplete = useCallback(async (data: any) => {
        console.log('Onboarding complete - mapping data:', data);

        // Map flat data (from ChatAgent) to structured snapshots (from simulation engine)
        let currentState = data.currentState;
        let goalState = data.goalState;

        // If data is flat (from standard ChatAgent extraction)
        if (!currentState && (data.nationality || data.currentLocation)) {
            currentState = {
                timestamp: new Date(),
                location: data.currentLocation || data.nationality || 'Nigeria',
                profession: data.profession || 'Professional',
                income: data.incomeRange ? parseInt(data.incomeRange.replace(/[^0-9]/g, '')) || 50000 : 50000,
                skills: [],
                qualifications: [],
                familyStatus: 'Single',
                dependencies: 0,
                assets: 5000,
                liabilities: 0,
                metadata: {
                    name: data.name,
                    citizenship: data.nationality,
                    age: data.age
                }
            };
        }

        // If no goalState yet but we have personal data, create a placeholder goalState
        if (!goalState && currentState) {
            goalState = {
                ...currentState,
                timestamp: new Date(),
                location: data.destination || 'Strategic_Nexus',
                metadata: {
                    ...currentState.metadata,
                    goal: data.migrationGoal || 'Global_Exploration',
                    isPlaceholderGoal: !data.destination
                }
            };
        }

        if (currentState && goalState) {
            const userId = `user_${Date.now()}`;
            const targetDisplay = data.destination || 'Strategic_Nexus';
            const signature = `Trajectory Optimized: ${data.name || 'User'} [${data.nationality || 'Hidden'}] → ${targetDisplay}`;

            // Execute atomic initialization and simulation start
            initializeSimulation(userId, currentState, goalState, signature).catch(err => {
                console.error('Simulation initialization failed:', err);
                // Fallback to basic init if atomic fails
                initialize(userId, currentState, goalState);
            });
        }
    }, [initialize, initializeSimulation]);

    // Auto-generate plan and fetch initial data
    // Only generate plan and fetch data AFTER onboarding is complete (state has been initialized)
    // This triggers when handleOnboardingComplete sets the state from ARIA interview
    useEffect(() => {
        if (state?.currentState && state?.goalState && !state.activePlan && state?.sessionMetadata?.thoughtSignature) {
            console.log('Onboarding complete - generating migration plan...');
            generatePlan(10).catch(err => console.error('Plan generation failed:', err));

            // Trigger Agent Alpha (Passport Analysis)
            const passportId = state.currentState.metadata?.citizenship || state.currentState.location || 'USA';

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

            // Fetch Global Trends
            if (state.goalState.location) {
                setTrendsLoading(true);
                fetch('/api/trends', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        origin: state.currentState.location || 'Unknown',
                        destination: state.goalState.location,
                        includeSearchGrounding: true
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Trends Report:', data);
                    })
                    .catch(err => console.error('Trends fetch failed:', err))
                    .finally(() => setTrendsLoading(false));
            }

            // Fetch Henley Data for Holograph
            if (state.currentState.location) {
                fetch('/api/passport/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: state.currentState.location, type: 'henley' })
                })
                    .then(res => res.json())
                    .then(data => setOriginPassport(data))
                    .catch(err => console.error('Origin Henley fetch failed:', err));
            }
            if (state.goalState.location) {
                fetch('/api/passport/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: state.goalState.location, type: 'henley' })
                })
                    .then(res => res.json())
                    .then(data => setTargetPassport(data))
                    .catch(err => console.error('Target Henley fetch failed:', err));
            }
        }
    }, [state?.currentState, state?.goalState, state?.activePlan, state?.sessionMetadata?.thoughtSignature, generatePlan, updateGeopoliticalProfile]);

    // Update Tavus context removed


    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const year = parseFloat(e.target.value);
        setCurrentYear(year);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
            {/* Top Navigation */}
            <header className="h-14 border-b border-primary/10 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-40 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-display font-black tracking-tight text-lg text-white uppercase hover:text-primary transition-colors">CONVERGE</Link>
                    <div className="h-4 w-px bg-primary/20"></div>
                    <div className="font-mono text-[10px] text-primary/60 tracking-widest uppercase">/ SIMULATION_DASHBOARD</div>
                </div>
                {state?.activePlan?.recommendationScore !== undefined && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                        <span className="font-mono text-[10px] text-primary/60 uppercase">Net_Recommendation:</span>
                        <span className={`font-mono text-xs font-bold ${state.activePlan.recommendationScore > 70 ? 'text-green-400' : 'text-primary'}`}>
                            {state.activePlan.recommendationScore}%
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    {state?.activePlan && (
                        <button
                            onClick={() => {
                                if (confirm("Clear current simulation and reset?")) {
                                    clearState();
                                    window.location.reload();
                                }
                            }}
                            className="px-3 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[9px] font-mono uppercase transition-colors rounded-sm"
                        >
                            CLEAR_VECTOR
                        </button>
                    )}
                    {isStateLoading && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full animate-pulse">
                            <span className="font-mono text-[10px] text-primary uppercase">Pivoting_Trajectory...</span>
                        </div>
                    )}
                    <div className="flex items-center gap-6 font-mono text-[10px] text-primary/40 uppercase">
                        <span>RAM: 64%</span>
                        <span>CPU: 12%</span>
                        <span className="text-primary">NET: SECURE</span>
                    </div>
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
                            <div className="flex gap-2"><span className="text-primary/30">[SYS]</span> CONVERGE_INIT_COMPLETE</div>
                            {state?.sessionMetadata?.thoughtSignature ? (
                                <>
                                    <div className="flex gap-2"><span className="text-primary/30">[CONV]</span> ONBOARDING_COMPLETE</div>
                                    <div className="flex gap-2"><span className="text-primary/30">[DATA]</span> USER_PROFILE_CAPTURED</div>
                                    {state?.activePlan ? (
                                        <>
                                            <div className="flex gap-2 text-green-500"><span className="text-primary/30">[PLAN]</span> TRAJECTORY_GENERATED</div>
                                            <div className="flex gap-2 text-white"><span className="text-primary/30">[AI]</span> THOUGHT_SIG_ACTIVE</div>
                                        </>
                                    ) : (
                                        <div className="flex gap-2 animate-pulse text-yellow-500"><span className="text-primary/30">[PLAN]</span> GENERATING...</div>
                                    )}
                                </>
                            ) : (
                                <div className="flex gap-2 animate-pulse text-primary"><span className="text-primary/30">[CONV]</span> AWAITING_ONBOARDING...</div>
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
                            onNodeClick={(step) => setSelectedStep(step)}
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
                <div className="col-span-12 lg:col-span-3 h-full flex flex-col gap-6">
                    {/* Passport Holograph */}
                    {state?.currentState && (
                        <div className="blueprint-border p-4 bg-background/40">
                            <div className="font-mono text-[9px] text-primary/40 uppercase tracking-widest mb-4">Identity_Matrix</div>
                            <PassportHolograph origin={originPassport} target={targetPassport} />
                        </div>
                    )}

                    {/* Alternatives Panel */}
                    <AlternativesPanel
                        alternatives={state?.activePlan?.alternatives || null}
                        onSelect={(country) => switchDestination(country)}
                        isLoading={isStateLoading}
                    />

                    <div className="flex-1 overflow-hidden">
                        <DashboardExpertHub onOnboardingComplete={handleOnboardingComplete} />
                    </div>
                </div>

            </main>

            {/* Modals & Overlays */}
            {selectedStep && (
                <MilestoneModal
                    step={selectedStep}
                    onClose={() => setSelectedStep(null)}
                />
            )}
        </div>
    );
}
