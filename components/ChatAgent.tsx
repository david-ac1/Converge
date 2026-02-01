'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AvatarVisualizer } from './AvatarVisualizer';

interface ChatAgentProps {
    onOnboardingComplete?: (data: any) => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `You are an experienced Migration Expert with deep knowledge of immigration law, visa processes, and relocation logistics. You're empathetic yet pragmatic. You are The Strategic Harbor, the primary expert for CONVERGE.

You are conducting an intake interview. Ask these questions ONE AT A TIME:
1. Start with a warm greeting and ask for their name
2. Ask where they're currently located and what passport they hold
3. Ask about their migration goal (citizenship, residency, work visa, study, investment)
4. Ask their age
5. Ask their approximate income range
6. Ask where they'd like to relocate

Keep responses SHORT and conversational. After collecting all info, say you'll analyze their trajectory.

IMPORTANT: You are currently in the greeting phase. Greet the user warmly and ask for their name.`;

/**
 * ChatAgent - Text-based chat interface for onboarding
 * Uses regular Gemini API (more reliable than Live API with quota limits)
 */
export function ChatAgent({ onOnboardingComplete }: ChatAgentProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [agentStatus, setAgentStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (userMessage?: string) => {
        const messageToSend = userMessage || input.trim();
        if (!messageToSend && isStarted) return;

        setIsLoading(true);
        setAgentStatus('processing');

        const newMessages = isStarted
            ? [...messages, { role: 'user' as const, content: messageToSend }]
            : messages;

        if (isStarted) {
            setMessages(newMessages);
            setInput('');
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    systemPrompt: SYSTEM_PROMPT,
                    isFirstMessage: !isStarted,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error details:', errorData);
                throw new Error(errorData.details || 'Failed to get response');
            }

            const data = await response.json();

            setAgentStatus('speaking');
            setMessages([...newMessages, { role: 'assistant', content: data.response }]);
            setIsStarted(true);

            // Check if onboarding is complete
            if (data.onboardingData) {
                onOnboardingComplete?.(data.onboardingData);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting. Please try again."
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => setAgentStatus('listening'), 1000);
        }
    };

    const handleStart = () => {
        sendMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Avatar */}
            <div className="flex-shrink-0 flex justify-center py-4">
                <AvatarVisualizer status={agentStatus} audioLevel={isLoading ? 0.5 : 0} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 min-h-[200px]">
                {!isStarted ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="font-mono text-xs text-primary/60 uppercase tracking-wider mb-4">
                            CONVERGENCE_READY
                        </div>
                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="px-8 py-3 bg-primary/10 border border-primary/40 text-primary font-mono text-sm uppercase tracking-wider hover:bg-primary/20 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Initializing...' : 'Start Interview'}
                        </button>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user'
                                    ? 'bg-primary/20 text-white'
                                    : 'bg-black/40 border border-primary/20 text-primary'
                                    }`}
                            >
                                <div className="font-mono text-[9px] text-primary/40 mb-1">
                                    {msg.role === 'user' ? 'YOU' : 'CONVERGENCE'}
                                </div>
                                <div className="text-sm">{msg.content}</div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {isStarted && (
                <div className="flex-shrink-0 p-4 border-t border-primary/10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            placeholder="Type your response..."
                            className="flex-1 bg-black/40 border border-primary/20 px-4 py-2 text-white font-mono text-sm placeholder:text-primary/30 focus:outline-none focus:border-primary/50"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-primary/20 border border-primary/40 text-primary font-mono text-sm uppercase hover:bg-primary/30 transition-all disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatAgent;
