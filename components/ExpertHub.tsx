'use client';

import { useTavus } from './providers/TavusProvider';
import { useState } from 'react';

export default function ExpertHub() {
    const { conversationUrl, startConversation, endConversation, isReady } = useTavus();
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

    return (
        <div className="blueprint-border h-full bg-background/50 backdrop-blur-md flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${conversationUrl ? 'bg-green-500' : 'bg-primary'} animate-pulse`}></span>
                    <h3 className="font-mono text-xs text-primary tracking-[0.2em] uppercase">Expert_Link</h3>
                </div>
                <div className="font-mono text-[9px] text-primary/40">
                    {conversationUrl ? 'LIVE' : 'TAVUS_NET_V4'}
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
                                    <div>Ready for guidance...</div>
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
                    <span className={conversationUrl ? 'text-green-500' : 'text-primary'}>
                        {conversationUrl ? 'CONNECTED' : '98%'}
                    </span>
                </div>

                {conversationUrl ? (
                    <button
                        onClick={endConversation}
                        className="w-full h-10 border border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-500 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">call_end</span>
                        End_Session
                    </button>
                ) : (
                    <button
                        onClick={handleStartConversation}
                        disabled={isLoading}
                        className="w-full h-10 border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        {isLoading ? 'Connecting...' : 'Initialize_Link'}
                    </button>
                )}
            </div>
        </div>
    );
}
