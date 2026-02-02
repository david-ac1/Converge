'use client';

/**
 * Terminal Page
 * Main entry point for the Global Migration News Feed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewsTerminal from '@/components/NewsTerminal';
import { NewsFeed } from '@/lib/newsEngine';

export default function TerminalPage() {
    const router = useRouter();
    const [newsFeed, setNewsFeed] = useState<NewsFeed | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNews = useCallback(async (force = false) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/terminal/news${force ? '?refresh=true' : ''}`);
            const data = await res.json();
            setNewsFeed(data);
        } catch (error) {
            console.error('Terminal: Failed to fetch news', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-primary/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                        >
                            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                            <span className="font-mono text-xs tracking-widest">EXIT TERMINAL</span>
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                                <span className="text-lg animate-pulse">📡</span>
                            </div>
                            <div>
                                <h1 className="font-mono text-sm tracking-[0.2em] text-white">GLOBAL INTEL FEED</h1>
                                <p className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    LIVE CONNECTION ESTABLISHED
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block text-right">
                        <div className="font-mono text-[9px] text-white/30 tracking-widest">SYSTEM TIME</div>
                        <div className="text-xs text-white/60 font-mono">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-16 relative">
                <NewsTerminal
                    items={newsFeed?.items || []}
                    isLoading={isLoading}
                    onRefresh={() => fetchNews(true)}
                />
            </main>

            {/* Footer Status Line */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-white/10 px-4 py-1 flex items-center justify-between text-[9px] font-mono text-white/30 z-50">
                <div>
                    SOURCE: {newsFeed?.source === 'demo' ? 'SIMULATION (DEMO)' : 'GEMINI SEARCH GROUNDING'}
                </div>
                <div>
                    LATENCY: 24ms | ENCRYPTION: AES-256
                </div>
            </div>
        </div>
    );
}
