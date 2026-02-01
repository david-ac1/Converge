'use client';

import { useTavus } from './providers/TavusProvider';
import { useState } from 'react';

interface ExpertHubProps {
    onOnboardingComplete?: (data: any) => void;
}

export default function ExpertHub({ onOnboardingComplete }: ExpertHubProps) {
    const { conversationUrl, startConversation, endConversation, isPolling, onboardingResult } = useTavus();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartConversation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await startConversation();
        } catch (err: any) {
            setError(err.message || 'Failed to connect');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndConversation = async () => {
        const result = await endConversation();
        if (result && onOnboardingComplete) {
            onOnboardingComplete(result);
        }
    };

    return (
        <div className="blueprint-border h-full bg-background/50 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${conversationUrl ? 'bg-green-500' : isPolling ? 'bg-yellow-500' : 'bg-primary'} animate-pulse`}></span>
                    <h3 className="font-mono text-xs text-primary tracking-[0.2em] uppercase">
                        {isPolling ? 'Analyzing...' : 'Expert_Link'}
                    </h3>
                </div>
                <div className="font-mono text-[9px] text-primary/40">
                    {conversationUrl ? 'LIVE' : isPolling ? 'PROCESSING' : 'CONVERGENCE_v1'}
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative bg-black/40 flex items-center justify-center overflow-hidden">
                {conversationUrl ? (
                    // Live Tavus Conversation Iframe
                    <iframe
                        src={conversationUrl}
                        allow="camera; microphone; autoplay; fullscreen"
                        className="absolute inset-0 w-full h-full border-0"
                        title="Tavus Conversation"
                    />
                ) : isPolling ? (
                    // Analyzing State
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative size-24">
                            <div className="absolute inset-0 border-2 border-primary rounded-full animate-spin" style={{ borderTopColor: 'transparent' }}></div>
                            <div className="absolute inset-2 border border-primary/40 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-primary">psychology</span>
                            </div>
                        </div>
                        <div className="font-mono text-xs text-primary uppercase tracking-wider">
                            Analyzing your data...
                        </div>
                        <div className="font-mono text-[9px] text-primary/60">
                            Generating personalized migration plan
                        </div>
                    </div>
                ) : onboardingResult ? (
                    // Result Summary
                    <div className="p-4 text-center">
                        <div className="font-mono text-xs text-green-500 uppercase mb-2">Analysis Complete</div>
                        <div className="font-display text-lg text-white mb-1">{onboardingResult.name}</div>
                        <div className="font-mono text-[10px] text-primary/60">
                            {onboardingResult.nationality} → {onboardingResult.destination}
                        </div>
                        <div className="font-mono text-[9px] text-primary/40 mt-2">
                            Goal: {onboardingResult.migrationGoal}
                        </div>
                    </div>
                ) : (
                    // Standby Mode
                    <>
                        {/* Scanner Lines */}
                        <div className="absolute inset-x-0 top-0 h-px bg-primary/40 animate-[scan_3s_linear_infinite]"></div>

                        <div className="relative size-32 rounded-full border border-primary/60 flex items-center justify-center overflow-hidden">
                            {/* Placeholder Avatar */}
                            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm"></div>
                            <span className="material-symbols-outlined text-4xl text-primary/40">person_pin</span>

                            {/* Active Indicator Ring */}
                            <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20"></div>
                        </div>

                        <div className="absolute bottom-6 font-mono text-[9px] text-primary/60 uppercase text-center">
                            {isLoading ? (
                                <div className="text-primary">Establishing connection...</div>
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <>
                                    <div>Talk to Convergence to start</div>
                                    <div className="text-primary font-bold mt-1">STANDBY_MODE</div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-primary/10 space-y-4">
                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                    <span>Signal_Stability</span>
                    <span className={conversationUrl ? 'text-green-500' : isPolling ? 'text-yellow-500' : 'text-primary'}>
                        {conversationUrl ? 'CONNECTED' : isPolling ? 'ANALYZING' : '98%'}
                    </span>
                </div>

                {conversationUrl ? (
                    <button
                        onClick={handleEndConversation}
                        className="w-full h-10 border border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">call_end</span>
                        End_Session
                    </button>
                ) : isPolling ? (
                    <div className="w-full h-10 border border-yellow-500/40 bg-yellow-500/5 text-yellow-500 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Processing...
                    </div>
                ) : (
                    <button
                        onClick={handleStartConversation}
                        disabled={isLoading}
                        className="w-full h-10 border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        {isLoading ? 'Connecting...' : 'Start_Interview'}
                    </button>
                )}
            </div>
        </div>
    );
}

