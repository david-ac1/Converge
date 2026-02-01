'use client';

import React, { useEffect, useRef } from 'react';

interface AvatarVisualizerProps {
    status: 'idle' | 'listening' | 'speaking' | 'processing';
    audioLevel?: number; // 0-1
}

/**
 * AvatarVisualizer - Animated avatar that reacts to speech
 * 
 * Replaces Tavus video with a stylized CSS/SVG avatar that:
 * - Pulses when listening
 * - Animates waveform when speaking
 * - Shows processing state
 */
export function AvatarVisualizer({ status, audioLevel = 0 }: AvatarVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const wavePhase = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) * 0.35;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw outer glow based on status
            const glowRadius = radius + 20 + (status === 'listening' ? Math.sin(Date.now() / 200) * 10 : 0);
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, glowRadius);

            if (status === 'speaking') {
                gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            } else if (status === 'listening') {
                gradient.addColorStop(0, 'rgba(0, 200, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
            } else if (status === 'processing') {
                gradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(100, 100, 100, 0.2)');
                gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Draw main avatar circle
            const mainGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
            mainGradient.addColorStop(0, '#1a1a2e');
            mainGradient.addColorStop(1, '#16213e');

            ctx.fillStyle = mainGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw border
            ctx.strokeStyle = status === 'speaking' ? '#00ff88' : status === 'listening' ? '#00c8ff' : '#333';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw waveform when speaking
            if (status === 'speaking' || audioLevel > 0.1) {
                wavePhase.current += 0.1;
                const bars = 5;
                const barWidth = radius * 0.15;
                const maxBarHeight = radius * 0.5;
                const barSpacing = barWidth * 1.5;
                const startX = centerX - ((bars - 1) * barSpacing) / 2;

                ctx.fillStyle = '#00ff88';

                for (let i = 0; i < bars; i++) {
                    const heightMultiplier = Math.sin(wavePhase.current + i * 0.5) * 0.5 + 0.5;
                    const barHeight = maxBarHeight * heightMultiplier * Math.max(0.3, audioLevel);
                    const x = startX + i * barSpacing - barWidth / 2;
                    const y = centerY - barHeight / 2;

                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
                    ctx.fill();
                }
            }

            // Draw center icon based on status
            if (status === 'idle') {
                // Mic icon
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.arc(centerX, centerY - 10, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(centerX - 15, centerY - 10, 30, 25);
                ctx.beginPath();
                ctx.arc(centerX, centerY + 15, 15, 0, Math.PI);
                ctx.fill();
            } else if (status === 'listening') {
                // Pulsing dot
                const pulseSize = 10 + Math.sin(Date.now() / 150) * 5;
                ctx.fillStyle = '#00c8ff';
                ctx.beginPath();
                ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
                ctx.fill();
            } else if (status === 'processing') {
                // Spinning loader
                const spinAngle = (Date.now() / 200) % (Math.PI * 2);
                ctx.strokeStyle = '#ffc800';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(centerX, centerY, 20, spinAngle, spinAngle + Math.PI * 1.5);
                ctx.stroke();
            }

            // Draw status text
            ctx.fillStyle = '#888';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            const statusText = status === 'speaking' ? 'SPEAKING' :
                status === 'listening' ? 'LISTENING' :
                    status === 'processing' ? 'PROCESSING' : 'STANDBY';
            ctx.fillText(statusText, centerX, centerY + radius + 30);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [status, audioLevel]);

    return (
        <div className="relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full max-w-[300px] aspect-square"
            />
        </div>
    );
}

export default AvatarVisualizer;
