'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { MigrationPlan, MigrationStep } from '@/types/migration';

interface ConvergenceMapProps {
    migrationPlan: MigrationPlan | null;
    currentYear: number;
    onNodeClick?: (step: MigrationStep) => void;
    animationSpeed?: number;
}

interface NodePosition {
    x: number;
    y: number;
    step: MigrationStep;
}

export default function ConvergenceMap({
    migrationPlan,
    currentYear,
    onNodeClick,
    animationSpeed = 1.0,
}: ConvergenceMapProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<NodePosition[]>([]);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // Layout nodes in a timeline-based visualization
    useEffect(() => {
        if (!migrationPlan || !migrationPlan.steps) return;

        const width = 1200;
        // height = 800;
        const yearWidth = width / 11; // 0-10 years

        const positions: NodePosition[] = migrationPlan.steps.map((step) => {
            const x = step.year * yearWidth + yearWidth / 2 + (step.quarter - 1) * (yearWidth / 4);

            // Distribute vertically based on category
            const categoryYOffsets: Record<string, number> = {
                skill: 150,
                financial: 300,
                legal: 450,
                relocation: 600,
                network: 700,
                other: 750,
            };

            const y = categoryYOffsets[step.category] || 400;

            return { x, y, step };
        });

        setNodes(positions);
    }, [migrationPlan]);

    // Zoom & Pan Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        setPan((prev) => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
        }));
    };

    const isStepActive = (step: MigrationStep): boolean => {
        const stepTime = step.year + (step.quarter - 1) / 4;
        return stepTime <= currentYear;
    };

    const isStepCompleted = (step: MigrationStep): boolean => {
        const stepTime = step.year + (step.quarter - 1) / 4;
        const stepEndTime = stepTime + step.expectedDuration / 12;
        return stepEndTime <= currentYear;
    };

    // Blueprint Styling Helpers
    const getStrokeColor = (status: 'active' | 'completed' | 'inactive') => {
        if (status === 'completed') return '#00D1FF'; // Cyan
        if (status === 'active') return '#FFFFFF'; // White highlight
        return 'rgba(0, 209, 255, 0.2)'; // Dim Cyan
    };

    if (!migrationPlan) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
                <div className="relative size-32 opacity-20 animate-[spin_10s_linear_infinite]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#00D1FF" strokeWidth="0.5" strokeDasharray="4 2" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#00D1FF" strokeWidth="0.5" />
                        <line x1="50" y1="0" x2="50" y2="100" stroke="#00D1FF" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#00D1FF" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="mt-4 font-mono text-[10px] text-primary/40 uppercase tracking-widest">Talk_To_Convergence</div>
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-[#0D0D0D] border border-primary/20"
            onWheel={handleWheel}
        >
            {/* Blueprint Grid Background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#00D1FF 1px, transparent 1px), linear-gradient(90deg, #00D1FF 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Timeline header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[#0D0D0D]/90 backdrop-blur-sm border-b border-primary/20 px-4 py-2 flex justify-between items-center">
                <h2 className="font-display font-bold text-xs text-primary uppercase tracking-widest">Convergence_Vector</h2>
                <div className="font-mono text-[10px] text-primary/60">
                    T-{currentYear.toFixed(2)}Y
                </div>
            </div>

            {/* Canvas */}
            <motion.div
                drag
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-move"
                style={{ paddingTop: '60px' }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1200 800"
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                    }}
                >
                    {/* Time Axis Lines */}
                    {Array.from({ length: 11 }, (_, i) => (
                        <g key={`year-${i}`}>
                            <line
                                x1={i * (1200 / 11)}
                                y1={0}
                                x2={i * (1200 / 11)}
                                y2={800}
                                stroke="rgba(0, 209, 255, 0.1)"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                            />
                            <text
                                x={i * (1200 / 11) + 4}
                                y={30}
                                fill="rgba(0, 209, 255, 0.4)"
                                fontSize="10"
                                fontFamily="monospace"
                            >
                                YR_{i}
                            </text>
                        </g>
                    ))}

                    {/* Dependency Lines */}
                    {nodes.map((node) =>
                        node.step.dependencies.map((depId) => {
                            const depNode = nodes.find((n) => n.step.id === depId);
                            if (!depNode) return null;

                            return (
                                <motion.path
                                    key={`${node.step.id}-${depId}`}
                                    d={`M ${depNode.x} ${depNode.y} C ${(depNode.x + node.x) / 2} ${depNode.y}, ${(depNode.x + node.x) / 2} ${node.y}, ${node.x} ${node.y}`}
                                    fill="none"
                                    stroke="#00D1FF"
                                    strokeWidth="1"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: isStepActive(node.step) ? 0.4 : 0.1,
                                    }}
                                    transition={{
                                        duration: 1.5 / animationSpeed,
                                        delay: node.step.year * 0.2 / animationSpeed,
                                    }}
                                />
                            );
                        })
                    )}

                    {/* Nodes (Blueprint Style) */}
                    {nodes.map((node, index) => {
                        const isActive = isStepActive(node.step);
                        const isCompleted = isStepCompleted(node.step);
                        const status = isCompleted ? 'completed' : isActive ? 'active' : 'inactive';
                        const strokeColor = getStrokeColor(status);

                        return (
                            <motion.g
                                key={node.step.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onNodeClick?.(node.step)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Active 'Ping' Effect */}
                                {isActive && !isCompleted && (
                                    <circle cx={node.x} cy={node.y} r="25" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.3">
                                        <animate attributeName="r" values="15;30" dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                )}

                                {/* Main Node Shape (Diamond for Blueprint feel) */}
                                <rect
                                    x={node.x - 6}
                                    y={node.y - 6}
                                    width="12"
                                    height="12"
                                    transform={`rotate(45 ${node.x} ${node.y})`}
                                    fill={getStatusFill(status)}
                                    stroke={strokeColor}
                                    strokeWidth="1"
                                />

                                {/* Label Line & Text */}
                                <line x1={node.x} y1={node.y + 10} x2={node.x} y2={node.y + 25} stroke={strokeColor} strokeWidth="1" />
                                <text
                                    x={node.x}
                                    y={node.y + 35}
                                    fill={strokeColor}
                                    fontSize="9"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    className="uppercase tracking-wider"
                                >
                                    {node.step.title.length > 20 ? node.step.title.slice(0, 18) + '..' : node.step.title}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* Timeline Current Position Indicator */}
                    <line
                        x1={currentYear * (1200 / 11)}
                        y1={0}
                        x2={currentYear * (1200 / 11)}
                        y2={800}
                        stroke="#00D1FF"
                        strokeWidth="1"
                        opacity="0.8"
                    />

                </svg>
            </motion.div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                <ZoomButton label="+" onClick={() => setScale(s => Math.min(3, s * 1.2))} />
                <ZoomButton label="-" onClick={() => setScale(s => Math.max(0.5, s * 0.8))} />
                <ZoomButton label="RST" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} />
            </div>
        </div>
    );
}

function getStatusFill(status: string) {
    if (status === 'completed') return '#00D1FF';
    if (status === 'active') return '#0D0D0D';
    return '#0D0D0D';
}

function ZoomButton({ label, onClick }: { label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`h-8 min-w-8 px-2 border border-primary/40 bg-black/60 text-primary font-mono text-xs hover:bg-primary/10 transition-colors uppercase`}
        >
            {label}
        </button>
    );
}
