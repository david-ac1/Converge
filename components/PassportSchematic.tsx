'use client';

import { motion } from 'framer-motion';

export default function PassportSchematic() {
    return (
        <div className="relative w-full aspect-square max-w-[600px] border border-primary/20 bg-[#111a22]/20 rounded-sm overflow-hidden backdrop-blur-sm">
            {/* Background Radial Grid */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(circle, #00D1FF 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative w-full h-full flex items-center justify-center">
                {/* Layer 1: Substrate Card */}
                <motion.div
                    initial={{ opacity: 0, x: -100, y: -100, rotate: 0 }}
                    animate={{ opacity: 1, x: -48, y: -48, rotate: 15 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute w-[220px] h-[300px] border border-primary/40 bg-primary/5"
                >
                    <div className="absolute bottom-2 left-2 font-mono text-[8px] text-primary/60">SUBSTRATE_V_09</div>
                </motion.div>

                {/* Layer 2: Biometric Layer */}
                <motion.div
                    initial={{ opacity: 0, x: -50, y: -50, rotate: 5 }}
                    animate={{ opacity: 1, x: -24, y: -24, rotate: 15 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="absolute w-[220px] h-[300px] border border-primary/60 bg-primary/10 backdrop-blur-sm flex items-center justify-center"
                >
                    <div className="w-16 h-16 border border-primary p-2">
                        <div className="w-full h-full border-2 border-primary/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">contactless</span>
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 text-right">
                        <div className="font-mono text-[7px] text-primary mb-1">BIOMETRIC_ENCRYPTION_LAYER</div>
                        <div className="font-mono text-[6px] text-primary/40 leading-tight">ISO/IEC 7810<br />FID_00192_B</div>
                    </div>
                </motion.div>

                {/* Layer 3: Main Passport Face */}
                <motion.div
                    initial={{ opacity: 0, y: 50, rotate: 10 }}
                    animate={{ opacity: 1, y: 0, rotate: 15 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="absolute w-[220px] h-[300px] border-2 border-primary bg-[#0D0D0D] shadow-2xl p-6 flex flex-col z-10"
                >
                    <div className="flex justify-between items-start mb-10">
                        <div className="size-6 border border-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[10px] text-primary">qr_code</span>
                        </div>
                        <div className="font-mono text-[8px] text-primary">CHIP_UID: 0xFD91A</div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 bg-primary/30 w-full animate-pulse"></div>
                        <div className="h-2 bg-primary/30 w-3/4 animate-pulse delay-75"></div>
                        <div className="h-8 border border-primary/30 w-full mt-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 w-1/2 h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <div className="mt-auto flex justify-between items-end">
                        <div className="font-mono text-[7px] text-primary/40 uppercase">Global_Standard</div>
                        <div className="font-mono text-[9px] text-primary font-bold">TYPE: P</div>
                    </div>
                </motion.div>

                {/* Connection Lines (Simulated with div for simplicity in schematic) */}
                <div className="absolute top-[20%] right-[10%] flex items-center gap-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 80 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="h-px bg-primary/40"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                        className="font-mono text-[9px] text-primary/80 uppercase"
                    >ISO_7810_STANDARD</motion.div>
                </div>

                <div className="absolute bottom-[20%] left-[5%] flex items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="font-mono text-[9px] text-primary/80 uppercase text-right"
                    >ENCRYPTION_CORE_01</motion.div>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 60 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="h-px bg-primary/40"
                    />
                </div>
            </div>

            <div className="absolute bottom-6 left-6 font-mono text-[10px] text-primary/40 uppercase">
                Fig_0.1: exploded_view_technical_blueprint
            </div>
        </div>
    );
}
