'use client';

import { useState } from 'react';
import { VoiceAgent } from './VoiceAgent';
import { ChatAgent } from './ChatAgent';

interface ExpertHubProps {
    onOnboardingComplete?: (data: any) => void;
}

/**
 * ExpertHub - Onboarding interface using Gemini Chat
 * 
 * Uses text-based chat with Gemini API for the intake interview.
 * Replaces Tavus CVI with reliable text interaction.
 */
export default function ExpertHub({ onOnboardingComplete }: ExpertHubProps) {
    const [mode, setMode] = useState<'chat' | 'voice'>('chat');
    const [isProcessing, setIsProcessing] = useState(false);
    const [onboardingResult, setOnboardingResult] = useState<any>(null);

    const handleOnboardingComplete = async (data: any) => {
        setIsProcessing(true);
        setOnboardingResult(data);
        onOnboardingComplete?.(data);
        setIsProcessing(false);
    };

    return (
        <div className="blueprint-border h-full bg-background/50 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500' :
                            onboardingResult ? 'bg-green-500' : 'bg-primary'
                        } animate-pulse`}></span>
                    <h3 className="font-mono text-xs text-primary tracking-[0.2em] uppercase">
                        {isProcessing ? 'Analyzing...' : mode === 'chat' ? 'Strategic_Chat' : 'Voice_Link'}
                    </h3>
                </div>

                {/* Mode Toggle */}
                {!onboardingResult && !isProcessing && (
                    <div className="flex bg-black/40 rounded-lg p-1 border border-primary/20">
                        <button
                            onClick={() => setMode('chat')}
                            className={`px-3 py-1 rounded-md text-[10px] uppercase font-mono transition-all ${mode === 'chat'
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-primary/40 hover:text-primary'
                                }`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setMode('voice')}
                            className={`px-3 py-1 rounded-md text-[10px] uppercase font-mono transition-all ${mode === 'voice'
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-primary/40 hover:text-primary'
                                }`}
                        >
                            Voice
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-black/40 flex flex-col overflow-hidden">
                {isProcessing ? (
                    // Analyzing State
                    <div className="flex flex-col items-center justify-center h-full gap-4">
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
                    </div>
                ) : onboardingResult ? (
                    // Result Summary
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <div className="font-mono text-xs text-green-500 uppercase mb-2">Analysis Complete</div>
                        <div className="font-display text-lg text-white mb-1">{onboardingResult.name || 'User'}</div>
                        <div className="font-mono text-[10px] text-primary/60">
                            {onboardingResult.nationality || 'Origin'} → {onboardingResult.destination || 'Destination'}
                        </div>
                        <div className="font-mono text-[9px] text-primary/40 mt-2">
                            Goal: {onboardingResult.migrationGoal || 'Not specified'}
                        </div>
                    </div>
                ) : mode === 'chat' ? (
                    // Chat Interface
                    <ChatAgent onOnboardingComplete={handleOnboardingComplete} />
                ) : (
                    // Voice Agent (Gemini Live)
                    <div className="flex-1 flex items-center justify-center">
                        <VoiceAgent
                            onTranscriptUpdate={(t) => console.log('Transcript:', t)}
                            onSessionEnd={(finalTranscript) => handleOnboardingComplete(finalTranscript)}
                            onError={(err) => console.error('VoiceAgent error:', err)}
                        />
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="p-4 border-t border-primary/10">
                <div className="flex justify-between items-center font-mono text-[9px] text-primary/40 uppercase">
                    <span>Gemini_API</span>
                    <span className={isProcessing ? 'text-yellow-500' : onboardingResult ? 'text-green-500' : 'text-primary'}>
                        {isProcessing ? 'ANALYZING' : onboardingResult ? 'COMPLETE' : 'READY'}
                    </span>
                </div>
            </div>
        </div>
    );
}
