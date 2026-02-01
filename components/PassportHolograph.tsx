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
        }, 7000); // 7 seconds for a relaxed flip

        return () => clearInterval(interval);
    }, [origin, target]);

    if (!origin || !target) return null;

    const current = isFlipped ? target : origin;

    // Use the absolute path provided by the generate_image tool
    const crestPath = "/api/media?path=C:/Users/david/.gemini/antigravity/brain/a6a0409d-af30-432f-bffb-5fb9414c0cfa/global_mobility_crest_1769965558772.png";

    return (
        <div className="relative w-full h-[230px] perspective-[1000px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.country}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative w-[160px] h-[220px] rounded-[3px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col group cursor-pointer"
                    style={{
                        backgroundColor: current.color,
                        backgroundImage: `url("https://www.transparenttextures.com/patterns/leather.png")`,
                        boxShadow: `inset 0 0 80px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.5)`
                    }}
                >
                    {/* Spine highlight */}
                    <div className="absolute inset-y-0 left-0 w-[2px] bg-white/5 z-20" />

                    {/* Foil Shine - Continuous slow sweep */}
                    <motion.div
                        animate={{
                            x: ['-100%', '300%'],
                            opacity: [0, 0.4, 0]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 2
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-20 pointer-events-none"
                    />

                    {/* Passport Content Area */}
                    <div className="flex-1 p-5 flex flex-col items-center justify-between z-10">
                        {/* HEADER: Country Name - Authentic Passport Style */}
                        <div className="w-full text-center mt-2">
                            <h4 className="text-[13px] font-display font-black text-[#D4AF37] leading-tight uppercase tracking-[0.25em] drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.6)] subpixel-antialiased">
                                {current.country}
                            </h4>
                        </div>

                        {/* UNIVERSAL CREST: Global Mobility Emblem */}
                        <div className="relative size-28 my-1 flex items-center justify-center">
                            <img
                                src={crestPath}
                                alt="Universal Crest"
                                className="w-full h-full object-contain filter brightness-[1.3] contrast-[1.1] drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]"
                                style={{
                                    // Applying a gold foil effect via composite filters
                                    filter: 'sepia(0.8) saturate(10) hue-rotate(-15deg) brightness(1.2)'
                                }}
                            />
                        </div>

                        {/* FOOTER: Type and Biometric */}
                        <div className="w-full text-center space-y-5 mb-2">
                            <div className="text-[11px] font-display font-black text-[#D4AF37] uppercase tracking-[0.4em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] opacity-95">
                                PASSPORT
                            </div>

                            {/* Biometric Iconography (Classic e-Passport symbol) */}
                            <div className="flex justify-center opacity-70 scale-90">
                                <div className="w-7 h-4 border-[1.5px] border-[#D4AF37] rounded-sm flex items-center justify-center relative">
                                    <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-inner" />
                                    <div className="absolute inset-x-0 h-[1.5px] bg-[#D4AF37] top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE OVERLAY: Henley Technical Data */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-lg p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1) border-t border-[#D4AF37]/30 z-30">
                        <div className="flex justify-between items-center font-mono text-[9px] px-1">
                            <div className="flex flex-col">
                                <span className="text-primary/60 text-[7px] uppercase tracking-tighter">Henley_Rank</span>
                                <span className="text-primary font-bold">#{current.rank}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[#D4AF37]/60 text-[7px] uppercase tracking-tighter">Mobility_Score</span>
                                <span className="text-[#D4AF37] font-bold">{current.visaFree} DEST.</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <style jsx global>{`
                .perspective-[1000px] {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
