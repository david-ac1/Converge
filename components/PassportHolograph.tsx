'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PassportData {
    country: string;
    rank: number;
    visaFree: number;
    color: string;
}

interface PassportHolographProps {
    origin: PassportData | null;
    target: PassportData | null;
}

export function PassportHolograph({ origin, target }: PassportHolographProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (!origin || !target) return;

        const interval = setInterval(() => {
            setIsFlipped(prev => !prev);
        }, 5000); // Flip every 5 seconds

        return () => clearInterval(interval);
    }, [origin, target]);

    if (!origin || !target) return null;

    const current = isFlipped ? target : origin;

    return (
        <div className="relative w-full h-[180px] perspective-[1000px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.country}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="relative w-[120px] h-[170px] rounded-lg shadow-2xl border border-white/20 overflow-hidden flex flex-col"
                    style={{
                        background: `linear-gradient(135deg, ${current.color} 0%, #000 100%)`,
                        boxShadow: `0 0 20px ${current.color}44`
                    }}
                >
                    {/* Glassmorphism Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

                    {/* Holographic Scanline */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-primary/40 animate-scanline pointer-events-none" />

                    {/* Passport Content */}
                    <div className="flex-1 p-3 flex flex-col items-center justify-between z-10">
                        <div className="w-full">
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">
                                {isFlipped ? 'TARGET_NATION' : 'CITIZEN_OF'}
                            </div>
                            <div className="text-sm font-display font-bold text-white truncate w-full">
                                {current.country}
                            </div>
                        </div>

                        {/* Symbolic Emblem */}
                        <div className="size-12 rounded-full border border-white/20 flex items-center justify-center opacity-60">
                            <svg viewBox="0 0 24 24" className="size-8 text-white fill-current">
                                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
                                <path d="M12,6a6,6,0,1,0,6,6A6,6,0,0,0,12,6Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" opacity="0.5" />
                            </svg>
                        </div>

                        <div className="w-full border-t border-white/10 pt-2 flex justify-between items-end">
                            <div>
                                <div className="text-[8px] font-mono text-white/40 uppercase">Henley_Rank</div>
                                <div className="text-xs font-mono font-bold text-primary">#{current.rank}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-mono text-white/40 uppercase">Visa_Free</div>
                                <div className="text-xs font-mono font-bold text-white">{current.visaFree}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <style jsx global>{`
                @keyframes scanline {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scanline {
                    animation: scanline 3s linear infinite;
                }
                .perspective-[1000px] {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
