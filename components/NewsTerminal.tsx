'use client';

/**
 * News Terminal Layout
 * Masonry grid for news cards with floating ticker text
 */

import React, { useState } from 'react';
import NewsCard from './NewsCard';
import { NewsCategory, NewsItem } from '@/lib/newsEngine';

interface NewsTerminalProps {
    items: NewsItem[];
    isLoading: boolean;
    onRefresh: () => void;
}

const CATEGORIES: NewsCategory[] = ['policy', 'crisis', 'innovation', 'passport'];

export default function NewsTerminal({ items, isLoading, onRefresh }: NewsTerminalProps) {
    const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="w-full h-full flex flex-col relative z-20">
            {/* Control Bar */}
            <div className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur border-b border-primary/20 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-7xl mx-auto w-full">

                    {/* Category Filters */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            aria-label="Filter by all categories"
                            className={`px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase border transition-all whitespace-nowrap ${selectedCategory === 'all'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'
                                }`}
                        >
                            ALL FEEDS
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                aria-label={`Filter by ${cat} category`}
                                title={`Show ${cat} news`}
                                className={`px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase border transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-primary/20 text-primary border-primary'
                                    : 'bg-transparent text-white/60 border-white/20 hover:border-white/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Refresh */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="FILTER STREAM..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-sm px-3 py-1.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-primary"
                            />
                            <div className="absolute right-2 top-1.5 text-[10px] text-white/30">
                                ⌘F
                            </div>
                        </div>
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            aria-label="Refresh news feed"
                            title="Force refresh news feed"
                            className={`p-1.5 border border-primary/30 rounded-sm bg-primary/10 text-primary hover:bg-primary/20 transition-all ${isLoading ? 'opacity-50' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 4v6h-6M1 20v-6h6" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* News Grid (Masonry Effect via CSS Columns) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-4">
                    {filteredItems.map((item, index) => (
                        <NewsCard key={item.id} item={item} index={index} />
                    ))}
                </div>

                {filteredItems.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center p-20 text-white/30">
                        <div className="text-4xl mb-4">📡</div>
                        <div className="font-mono text-sm">NO SIGNALS FOUND</div>
                        <div className="text-xs mt-2">Try adjusting filters or refreshing stream</div>
                    </div>
                )}
            </div>

            {/* Background Decor - Floating Text */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02] overflow-hidden select-none">
                <div className="absolute top-1/4 -left-10 text-[20rem] font-black text-white rotate-90 leading-none">
                    NEWS
                </div>
                <div className="absolute bottom-1/4 -right-10 text-[20rem] font-black text-white -rotate-90 leading-none">
                    WIRE
                </div>
            </div>
        </div>
    );
}
