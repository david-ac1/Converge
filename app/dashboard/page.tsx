'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for dashboard components
const DashboardVolatilityRadar = dynamic(() => import('@/components/VolatilityRadar'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-primary/5 animate-pulse" />
});

const DashboardExpertHub = dynamic(() => import('@/components/ExpertHub'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-primary/5 animate-pulse" />
});

// We will eventually import ConvergenceMap here too
// import ConvergenceMap from '@/components/ConvergenceMap';

export default function DashboardPage() {
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
                        <DashboardVolatilityRadar />
                    </div>

                    {/* Additional Metric Box */}
                    <div className="blueprint-border p-6 bg-background/50 flex-1 flex flex-col gap-4">
                        <div className="font-mono text-[10px] text-primary/40 uppercase tracking-widest border-b border-primary/10 pb-2">Log_Output</div>
                        <div className="flex-1 font-mono text-[9px] text-primary/60 space-y-2 overflow-hidden">
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:22]</span> SYS_INIT_COMPLETE</div>
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:23]</span> PASSPORT_DATA_LOADED</div>
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:24]</span> CONNECTING_TO_SAT...</div>
                            <div className="flex gap-2"><span className="text-primary/30">[14:02:25]</span> <span className="text-green-500">LINK_ESTABLISHED</span></div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Convergence Map (6 Cols) */}
                <div className="col-span-12 lg:col-span-6 flex flex-col h-full bg-black/20 border border-primary/10 relative rounded-sm overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-primary/40 uppercase bg-black/60 px-2 py-1 border border-primary/20 backdrop-blur-sm">
                        VIEW: MIGRATION_VECTOR_1
                    </div>

                    {/* Convergence Map Render Area */}
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.05)_0%,transparent_70%)]">
                        {/* Placeholder for SVG Map until connected */}
                        <div className="text-center opacity-40">
                            <span className="material-symbols-outlined text-6xl text-primary animate-pulse">explore</span>
                            <div className="font-mono text-[10px] text-primary mt-4 uppercase tracking-[0.2em]">Map_Initialization_Pending</div>
                        </div>
                    </div>

                    {/* Scrubber Area */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-background/90 border-t border-primary/10 flex items-center px-6 gap-4">
                        <span className="material-symbols-outlined text-primary/60">play_circle</span>
                        <div className="flex-1 h-1 bg-primary/20 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[10%] h-1 bg-primary"></div>
                            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 cursor-pointer w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#00D1FF]"></div>
                        </div>
                        <span className="font-mono text-xs text-primary font-bold">YEAR_01</span>
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
