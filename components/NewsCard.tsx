'use client';

/**
 * News Card Component
 * Glassmorphism card for individual news items
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem, NewsCategory } from '@/lib/newsEngine';

interface NewsCardProps {
    item: NewsItem;
    index: number;
}

const CATEGORY_COLORS: Record<NewsCategory, string> = {
    'policy': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    'crisis': 'text-red-400 border-red-500/30 bg-red-500/10',
    'innovation': 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    'passport': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
};

const CATEGORY_ICONS: Record<NewsCategory, string> = {
    'policy': '🏛️',
    'crisis': '⚠️',
    'innovation': '💡',
    'passport': '🛂',
};

export default function NewsCard({ item, index }: NewsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const colorClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['policy'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative mb-4 break-inside-avoid rounded-lg border backdrop-blur-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-black/80 z-20 shadow-2xl scale-[1.02]' : 'bg-black/40 hover:bg-black/60'
                } ${colorClass.replace('text-', 'border-').split(' ')[1]}`}
        >
            {/* Header */}
            <div
                className="p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 rounded-t-lg"
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${item.headline} - ${isExpanded ? 'Collapse' : 'Expand'} for details`}
                title={isExpanded ? "Click to collapse" : "Click to read more"}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider border ${colorClass}`}>
                        {CATEGORY_ICONS[item.category]} {item.category}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                        {new Date(item.publishedAt).toLocaleDateString()}
                    </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug mb-2">
                    {item.headline}
                </h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.region}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-white/40 text-xs"
                    >
                        ▼
                    </motion.div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-white/10"
                    >
                        <div className="pt-3">
                            <p className="text-xs text-white/70 leading-relaxed mb-3">
                                {item.summary}
                            </p>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.sentiment === 'positive' ? 'bg-green-500' :
                                        item.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`} />
                                    <span className="text-[10px] text-white/40 capitalize">
                                        {item.sentiment} Sentiment
                                    </span>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                    title={`Open original article from ${item.source}`}
                                >
                                    READ SOURCE ↗
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decor Corner */}
            <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${item.category === 'crisis' ? 'border-red-500' :
                item.category === 'innovation' ? 'border-cyan-500' : 'border-white/30'
                }`} />
        </motion.div>
    );
}
