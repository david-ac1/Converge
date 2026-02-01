'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GeminiLiveClient, CONVERGENCE_PERSONA, GeminiLiveSession } from '@/lib/geminiLive';
import { AvatarVisualizer } from './AvatarVisualizer';

interface VoiceAgentProps {
    onTranscriptUpdate?: (transcript: { role: 'user' | 'model'; text: string }[]) => void;
    onSessionEnd?: (transcript: { role: 'user' | 'model'; text: string }[]) => void;
    onError?: (error: Error) => void;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type AgentStatus = 'idle' | 'listening' | 'speaking' | 'processing';

/**
 * VoiceAgent - Real-time voice conversation with Gemini Live API
 * 
 * Replaces Tavus CVI with pure Gemini voice interaction.
 * Handles mic capture, audio playback, and avatar animation.
 */
export function VoiceAgent({ onTranscriptUpdate, onSessionEnd, onError }: VoiceAgentProps) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcript, setTranscript] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const clientRef = useRef<GeminiLiveClient | null>(null);
    const sessionRef = useRef<GeminiLiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const isPlayingRef = useRef(false);

    // Initialize audio playback context lazily
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    const playAudio = useCallback(async (audioData: ArrayBuffer) => {
        try {
            const ctx = getAudioContext();

            // Convert PCM to AudioBuffer
            const pcmData = new Int16Array(audioData);
            const floatData = new Float32Array(pcmData.length);

            for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 32768;
            }

            const audioBuffer = ctx.createBuffer(1, floatData.length, 24000);
            audioBuffer.getChannelData(0).set(floatData);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;

            // Create analyser for visualization
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(ctx.destination);

            source.onended = () => {
                setAgentStatus('listening');
                isPlayingRef.current = false;
                // Play next in queue
                if (audioQueueRef.current.length > 0) {
                    const next = audioQueueRef.current.shift();
                    if (next) playAudio(next);
                }
            };

            isPlayingRef.current = true;
            setAgentStatus('speaking');
            source.start();

            // Update audio level for visualization
            const updateLevel = () => {
                if (!isPlayingRef.current) return;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
                requestAnimationFrame(updateLevel);
            };
            updateLevel();
        } catch (err) {
            console.error('[VoiceAgent] Playback error:', err);
        }
    }, [getAudioContext]);

    // Start voice session
    const startSession = useCallback(async () => {
        try {
            setError(null);
            setConnectionStatus('connecting');

            // Initialize AudioContext first (must be done on user gesture)
            const ctx = getAudioContext();
            await ctx.resume();

            // Initialize Gemini Live client
            clientRef.current = new GeminiLiveClient({
                systemInstruction: CONVERGENCE_PERSONA,
                onTranscript: (text, role) => {
                    setTranscript(prev => {
                        const updated = [...prev, { role, text }];
                        onTranscriptUpdate?.(updated);
                        return updated;
                    });
                },
                onAudioData: (data) => {
                    if (isPlayingRef.current) {
                        audioQueueRef.current.push(data);
                    } else {
                        playAudio(data);
                    }
                },
                onConnectionChange: (status) => {
                    if (status === 'connected') {
                        setConnectionStatus('connected');
                        setAgentStatus('listening');
                    } else if (status === 'disconnected') {
                        setConnectionStatus('disconnected');
                        setAgentStatus('idle');
                    } else if (status === 'error') {
                        setConnectionStatus('error');
                    }
                },
                onError: (err) => {
                    console.error('[VoiceAgent] Error:', err);
                    setError(err.message);
                    onError?.(err);
                },
            });

            // Connect to Gemini Live
            sessionRef.current = await clientRef.current.connect();

            // Request mic access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            mediaStreamRef.current = stream;

            // Create audio context for mic capture
            const micContext = new AudioContext({ sampleRate: 16000 });
            await micContext.resume();

            const source = micContext.createMediaStreamSource(stream);

            // Use ScriptProcessor for PCM capture
            const processor = micContext.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
                if (!sessionRef.current?.isConnected) return;

                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to Int16 PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                sessionRef.current.send(pcmData.buffer);
            };

            source.connect(processor);
            processor.connect(micContext.destination);

            setAgentStatus('listening');

        } catch (err) {
            console.error('[VoiceAgent] Start failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to start voice session');
            setConnectionStatus('error');
            onError?.(err instanceof Error ? err : new Error('Unknown error'));
        }
    }, [playAudio, onTranscriptUpdate, onError, getAudioContext]);

    // End voice session
    const endSession = useCallback(() => {
        // Stop mic tracks
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Close Gemini session
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }

        // Suspend audio contexts to release hardware
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.suspend();
        }

        // Get final transcript
        if (clientRef.current) {
            const finalTranscript = clientRef.current.getTranscript();
            onSessionEnd?.(finalTranscript);
            clientRef.current = null;
        }

        setConnectionStatus('disconnected');
        setAgentStatus('idle');
        setAudioLevel(0);
        isPlayingRef.current = false;
        audioQueueRef.current = [];
    }, [onSessionEnd]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            sessionRef.current?.close();
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 p-6">
            {/* Avatar Visualizer */}
            <AvatarVisualizer status={agentStatus} audioLevel={audioLevel} />

            {/* Status Display */}
            <div className="text-center space-y-2">
                <div className="font-mono text-xs text-primary/60 uppercase tracking-wider">
                    {connectionStatus === 'connected' ? 'CONVERGENCE_LIVE' :
                        connectionStatus === 'connecting' ? 'INITIALIZING...' :
                            connectionStatus === 'error' ? 'CONNECTION_ERROR' : 'STANDBY'}
                </div>

                {error && (
                    <div className="text-red-400 text-sm">{error}</div>
                )}
            </div>

            {/* Control Button */}
            <button
                onClick={connectionStatus === 'connected' ? endSession : startSession}
                disabled={connectionStatus === 'connecting'}
                className={`
                    px-8 py-3 rounded-full font-mono text-sm uppercase tracking-wider
                    transition-all duration-300 border-2
                    ${connectionStatus === 'connected'
                        ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                        : connectionStatus === 'connecting'
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 cursor-wait'
                            : 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                {connectionStatus === 'connected' ? 'End Conversation' :
                    connectionStatus === 'connecting' ? 'Connecting...' : 'Start Conversation'}
            </button>

            {/* Transcript Preview */}
            {transcript.length > 0 && (
                <div className="w-full max-w-md mt-4 p-4 bg-black/30 rounded-lg border border-primary/20 max-h-40 overflow-y-auto">
                    <div className="font-mono text-xs text-primary/40 mb-2">TRANSCRIPT</div>
                    {transcript.slice(-5).map((entry, i) => (
                        <div key={i} className={`text-sm mb-1 ${entry.role === 'model' ? 'text-primary' : 'text-white/70'}`}>
                            <span className="text-primary/40">[{entry.role === 'model' ? 'CONV' : 'USER'}]</span> {entry.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default VoiceAgent;
