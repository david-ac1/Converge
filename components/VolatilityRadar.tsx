'use client';

import { motion } from 'framer-motion';
import { GeopoliticalRiskProfile } from '@/types/migration';

interface MetricDialProps {
    label: string;
    value: number; // 0-100
    code: string;
    color?: string;
    isWarning?: boolean;
}

function MetricDial({ label, value, code, color = "#00D1FF", isWarning = false }: MetricDialProps) {
    // Convert value (0-100) to rotation (-135deg to +135deg)
    const rotation = (value / 100) * 270 - 135;
    const finalColor = isWarning ? '#FF3333' : color;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative size-32 border ${isWarning ? 'border-red-500/50 bg-red-950/10' : 'border-primary/20 bg-black/40'} rounded-full flex items-center justify-center backdrop-blur-sm transition-colors duration-500`}>
                {/* Ticks */}
                <div className="absolute inset-0">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-0.5 h-1.5 ${isWarning ? 'bg-red-500/30' : 'bg-primary/20'} left-1/2 top-0 origin-bottom`}
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
                        stroke={finalColor}
                        strokeWidth="2"
                        strokeDasharray="364"
                        strokeDashoffset={364 - (364 * 0.75 * (value / 100))}
                        strokeLinecap="round"
                        className="opacity-20"
                    />
                </svg>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -135 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className={`absolute w-1 h-14 ${isWarning ? 'bg-red-500' : 'bg-primary/50'} left-[calc(50%-2px)] top-[14px] origin-bottom shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    style={{ borderRadius: '2px 2px 0 0', boxShadow: isWarning ? '0 0 10px #FF3333' : '0 0 10px rgba(0,209,255,0.5)' }}
                >
                    <div className="absolute bottom-0 -left-1 w-3 h-3 bg-white rounded-full"></div>
                </motion.div>

                {/* Center Value */}
                <div className={`absolute top-[60%] ${isWarning ? 'text-red-500' : 'text-white'} font-mono font-bold text-lg tracking-tighter shadow-black drop-shadow-md`}>
                    {value}%
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className={`font-mono text-[9px] ${isWarning ? 'text-red-500/60' : 'text-primary/60'} tracking-widest uppercase`}>{code}</span>
                <span className={`font-display font-bold text-xs uppercase ${isWarning ? 'text-red-500' : 'text-white'}`}>{label}</span>
            </div>
        </div>
    );
}

interface VolatilityRadarProps {
    riskProfile?: GeopoliticalRiskProfile;
}

export default function VolatilityRadar({ riskProfile }: VolatilityRadarProps) {
    // Determine warning state (Tactile Blueprint Shift)
    const isCrisis = riskProfile ? riskProfile.reputationScore < 50 : false;

    // Default or Prop values
    const score = riskProfile ? riskProfile.reputationScore : 85;
    const stability = isCrisis ? 35 : 85; // Simulated drop in stability if crisis
    const trend = isCrisis ? 12 : 94; // Passport power tanks in crisis

    return (
        <div className={`blueprint-border p-6 ${isCrisis ? 'bg-red-950/10 border-red-500/30' : 'bg-background/50'} backdrop-blur-md h-full flex flex-col gap-6 transition-colors duration-700`}>
            <div className={`flex items-center justify-between border-b ${isCrisis ? 'border-red-500/20' : 'border-primary/10'} pb-4`}>
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${isCrisis ? 'text-red-500 animate-pulse' : 'text-primary text-sm'}`}>radar</span>
                    <h3 className={`font-mono text-xs ${isCrisis ? 'text-red-500' : 'text-primary'} tracking-[0.2em] uppercase`}>
                        {isCrisis ? 'CRITICAL_RISK_DETECTED' : 'Volatility_Radar'}
                    </h3>
                </div>
                <div className={`font-mono text-[9px] ${isCrisis ? 'text-red-500 animate-blink' : 'text-primary/40'}`}>
                    {isCrisis ? 'ALERT_LEVEL_5' : 'SYS_Ready'}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 py-4">
                <MetricDial label="Reputation Score" value={score} code="REP_SCR" color={isCrisis ? "#FF3333" : "#00D1FF"} isWarning={isCrisis} />
                <MetricDial label="Political Stability" value={stability} code="POL_STAB" color={isCrisis ? "#FF3333" : "#00D1FF"} isWarning={isCrisis} />
                <MetricDial label="Access Power" value={trend} code="ACS_PWR" color={isCrisis ? "#FF3333" : "#00D1FF"} isWarning={isCrisis} />
            </div>

            <div className="mt-auto space-y-2">
                <div className={`flex justify-between font-mono text-[9px] ${isCrisis ? 'text-red-500/60' : 'text-primary/40'} uppercase`}>
                    <span>Vector_Analysis</span>
                    <span>{isCrisis ? 'UNSTABLE' : 'Active'}</span>
                </div>
                <div className={`h-24 w-full border ${isCrisis ? 'border-red-500/20 bg-red-950/20' : 'border-primary/10 bg-black/40'} relative overflow-hidden transition-colors`}>
                    {/* Fake waveform */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path
                            d="M0,50 Q20,40 40,50 T80,50 T120,50 T160,50 T200,50"
                            fill="none"
                            stroke={isCrisis ? "#FF3333" : "#00D1FF"}
                            strokeWidth={isCrisis ? "2" : "1"}
                            className="opacity-40 animate-[draw_2s_linear_infinite]"
                        />
                        <path
                            d="M0,50 Q10,20 20,50 T40,50 T60,80 T80,50 T100,50"
                            fill="none"
                            stroke={isCrisis ? "#FF3333" : "#00D1FF"}
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
