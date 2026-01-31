'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
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
    const controls = useAnimation();

    // Layout nodes in a timeline-based visualization
    useEffect(() => {
        if (!migrationPlan || !migrationPlan.steps) return;

        const width = 1200;
        const height = 800;
        const yearWidth = width / 11; // 0-10 years

        const positions: NodePosition[] = migrationPlan.steps.map((step, index) => {
            const x = step.year * yearWidth + yearWidth / 2 + (step.quarter - 1) * (yearWidth / 4);

            // Distribute vertically based on category
            const categoryYOffsets: Record<string, number> = {
                skill: 100,
                financial: 200,
                legal: 300,
                relocation: 400,
                network: 500,
                other: 600,
            };

            const y = categoryYOffsets[step.category] || 350;

            return { x, y, step };
        });

        setNodes(positions);
    }, [migrationPlan]);

    // Zoom handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    };

    // Pan handlers
    const handleDragEnd = (_: any, info: PanInfo) => {
        setPan((prev) => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
        }));
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            skill: '#3b82f6',      // blue
            financial: '#10b981',  // green
            legal: '#f59e0b',      // amber
            relocation: '#ef4444', // red
            network: '#8b5cf6',    // purple
            other: '#6b7280',      // gray
        };
        return colors[category] || colors.other;
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

    if (!migrationPlan) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
                <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Migration Plan</h3>
                    <p className="text-slate-400">Generate a plan to see your convergence path</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700"
            onWheel={handleWheel}
        >
            {/* Timeline header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Convergence Path</h2>
                    <div className="text-sm text-slate-300">
                        Year: <span className="font-mono font-bold text-blue-400">{currentYear.toFixed(1)}</span> / 10.0
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-16 right-4 z-10 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-300 mb-2">Categories</div>
                {['skill', 'financial', 'legal', 'relocation', 'network', 'other'].map((category) => (
                    <div key={category} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(category) }}
                        />
                        <span className="text-xs text-slate-400 capitalize">{category}</span>
                    </div>
                ))}
            </div>

            {/* Canvas with pan and zoom */}
            <motion.div
                drag
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-move"
                style={{
                    paddingTop: '80px',
                }}
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
                    {/* Year markers */}
                    {Array.from({ length: 11 }, (_, i) => (
                        <g key={`year-${i}`}>
                            <line
                                x1={i * (1200 / 11)}
                                y1={0}
                                x2={i * (1200 / 11)}
                                y2={800}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={i * (1200 / 11) + 5}
                                y={20}
                                fill="#94a3b8"
                                fontSize="12"
                                fontWeight="bold"
                            >
                                Year {i}
                            </text>
                        </g>
                    ))}

                    {/* Connection lines between dependent steps */}
                    {nodes.map((node) =>
                        node.step.dependencies.map((depId) => {
                            const depNode = nodes.find((n) => n.step.id === depId);
                            if (!depNode) return null;

                            return (
                                <motion.line
                                    key={`${node.step.id}-${depId}`}
                                    x1={depNode.x}
                                    y1={depNode.y}
                                    x2={node.x}
                                    y2={node.y}
                                    stroke="#475569"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        opacity: isStepActive(node.step) ? 0.6 : 0.3,
                                    }}
                                    transition={{
                                        duration: 1 / animationSpeed,
                                        delay: node.step.year * 0.2 / animationSpeed,
                                    }}
                                />
                            );
                        })
                    )}

                    {/* Step nodes */}
                    {nodes.map((node, index) => {
                        const isActive = isStepActive(node.step);
                        const isCompleted = isStepCompleted(node.step);
                        const color = getCategoryColor(node.step.category);

                        return (
                            <motion.g
                                key={node.step.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    duration: 0.5 / animationSpeed,
                                    delay: index * 0.1 / animationSpeed,
                                }}
                                onClick={() => onNodeClick?.(node.step)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Outer glow for active steps */}
                                {isActive && !isCompleted && (
                                    <motion.circle
                                        cx={node.x}
                                        cy={node.y}
                                        r="30"
                                        fill={color}
                                        opacity="0.3"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 2 / animationSpeed,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                )}

                                {/* Main node circle */}
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="20"
                                    fill={isCompleted ? color : isActive ? color : '#1e293b'}
                                    stroke={color}
                                    strokeWidth="3"
                                    opacity={isActive ? 1 : 0.5}
                                />

                                {/* Checkmark for completed steps */}
                                {isCompleted && (
                                    <motion.path
                                        d={`M ${node.x - 8} ${node.y} L ${node.x - 2} ${node.y + 6} L ${node.x + 10} ${node.y - 6}`}
                                        stroke="white"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5 / animationSpeed }}
                                    />
                                )}

                                {/* Step label */}
                                <text
                                    x={node.x}
                                    y={node.y + 35}
                                    fill="#e2e8f0"
                                    fontSize="11"
                                    fontWeight="500"
                                    textAnchor="middle"
                                    className="pointer-events-none"
                                >
                                    {node.step.title.length > 25
                                        ? node.step.title.substring(0, 25) + '...'
                                        : node.step.title}
                                </text>
                            </motion.g>
                        );
                    })}

                    {/* Current time indicator */}
                    <motion.line
                        x1={currentYear * (1200 / 11)}
                        y1={0}
                        x2={currentYear * (1200 / 11)}
                        y2={800}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>
            </motion.div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button
                    onClick={() => setScale((prev) => Math.min(3, prev * 1.2))}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    onClick={() => setScale((prev) => Math.max(0.5, prev * 0.8))}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors"
                    aria-label="Zoom out"
                >
                    −
                </button>
                <button
                    onClick={() => {
                        setScale(1);
                        setPan({ x: 0, y: 0 });
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors text-sm"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
