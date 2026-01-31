'use client';

import { motion } from 'framer-motion';

interface MetricDialProps {
    label: string;
    value: number; // 0-100
    code: string;
    color?: string;
}

function MetricDial({ label, value, code, color = "#00D1FF" }: MetricDialProps) {
    // Convert value (0-100) to rotation (-135deg to +135deg)
    const rotation = (value / 100) * 270 - 135;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative size-32 border border-primary/20 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                {/* Ticks */}
                <div className="absolute inset-0">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-0.5 h-1.5 bg-primary/20 left-1/2 top-0 origin-bottom`}
                            style={{
                                transform: `rotate(${i * (360 / 40)}deg) translateY(2px)`
                            }}
                        />
                    ))}
                </div>

                {/* Active Arc (SVG) */}
                <svg className="absolute inset-0 rotate-[135deg] size-full">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="364" // 2 * pi * 58
                        strokeDashoffset={364 - (364 * 0.75 * (value / 100))} // partial circle
                        strokeLinecap="round"
                        className="opacity-20"
                    />
                </svg>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -135 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="absolute w-1 h-14 bg-primary/50 left-[calc(50%-2px)] top-[14px] origin-bottom shadow-[0_0_10px_rgba(0,209,255,0.5)]"
                    style={{ borderRadius: '2px 2px 0 0' }}
                >
                    <div className="absolute bottom-0 -left-1 w-3 h-3 bg-white rounded-full"></div>
                </motion.div>

                {/* Center Value */}
                <div className="absolute top-[60%] text-white font-mono font-bold text-lg tracking-tighter shadow-black drop-shadow-md">
                    {value}%
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className="font-mono text-[9px] text-primary/60 tracking-widest uppercase">{code}</span>
                <span className="font-display font-bold text-xs uppercase">{label}</span>
            </div>
        </div>
    );
}

export default function VolatilityRadar() {
    return (
        <div className="blueprint-border p-6 bg-background/50 backdrop-blur-md h-full flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm animate-pulse">radar</span>
                    <h3 className="font-mono text-xs text-primary tracking-[0.2em] uppercase">Volatility_Radar</h3>
                </div>
                <div className="font-mono text-[9px] text-primary/40">SYS_Ready</div>
            </div>

            <div className="grid grid-cols-1 gap-8 py-4">
                <MetricDial label="Policy Stability" value={85} code="POL_STAB" />
                <MetricDial label="Economic Risk" value={42} code="ECON_RSK" color="#ef4444" />
                <MetricDial label="Passport Power" value={94} code="PASS_PWR" />
            </div>

            <div className="mt-auto space-y-2">
                <div className="flex justify-between font-mono text-[9px] text-primary/40 uppercase">
                    <span>Vector_Analysis</span>
                    <span>Active</span>
                </div>
                <div className="h-24 w-full border border-primary/10 bg-black/40 relative overflow-hidden">
                    {/* Fake waveform */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path
                            d="M0,50 Q20,40 40,50 T80,50 T120,50 T160,50 T200,50"
                            fill="none"
                            stroke="#00D1FF"
                            strokeWidth="1"
                            className="opacity-40 animate-[draw_2s_linear_infinite]"
                        />
                        <path
                            d="M0,50 Q10,20 20,50 T40,50 T60,80 T80,50 T100,50"
                            fill="none"
                            stroke="#00D1FF"
                            strokeWidth="1"
                            className="opacity-20"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
