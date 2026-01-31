'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface TavusContextType {
    conversationUrl: string | null;
    conversationId: string | null;
    startConversation: (context?: ConversationContext) => Promise<void>;
    endConversation: () => void;
    updateContext: (context: Record<string, any>) => void;
    isReady: boolean;
}

interface ConversationContext {
    userName?: string;
    thoughtSignature?: string;
    geopoliticalProfile?: any;
    focusedYear?: number;
    planSummary?: string;
}

const TavusContext = createContext<TavusContextType | null>(null);

export function useTavus() {
    const context = useContext(TavusContext);
    if (!context) {
        throw new Error('useTavus must be used within a TavusProvider');
    }
    return context;
}

export function TavusProvider({ children }: { children: React.ReactNode }) {
    const [conversationUrl, setConversationUrl] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    const startConversation = useCallback(async (context?: ConversationContext) => {
        try {
            // Build conversational context for the Tavus persona
            let conversationalContext = '';

            if (context?.thoughtSignature) {
                conversationalContext += `Migration Analysis Reasoning: ${context.thoughtSignature}\n`;
            }
            if (context?.geopoliticalProfile) {
                conversationalContext += `Geopolitical Risk Score: ${context.geopoliticalProfile.reputationScore}/100\n`;
                conversationalContext += `Risk Factors: ${context.geopoliticalProfile.riskFactors?.join(', ') || 'None identified'}\n`;
            }
            if (context?.planSummary) {
                conversationalContext += `Plan Summary: ${context.planSummary}\n`;
            }

            const res = await fetch('/api/tavus/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: {
                        userName: context?.userName || 'User',
                        focusedYear: context?.focusedYear || 0
                    },
                    conversationalContext: conversationalContext || 'You are a CONVERGE migration advisor helping users plan their global mobility strategy.'
                })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.url) {
                setConversationUrl(data.url);
                setConversationId(data.conversation_id);
                setIsReady(true);
            } else {
                throw new Error('No conversation URL received');
            }
        } catch (error) {
            console.error('Failed to start Tavus conversation:', error);
            throw error;
        }
    }, []);

    const endConversation = useCallback(() => {
        setConversationUrl(null);
        setConversationId(null);
        setIsReady(false);
    }, []);

    const updateContext = useCallback((context: Record<string, any>) => {
        // Log context updates for the active conversation
        console.log('Tavus Context Update:', context);

        // In an advanced implementation, we could use Tavus's real-time API
        // to update the persona's context mid-conversation
        if (conversationUrl && conversationId) {
            // Future: Send context update via Tavus webhook or iframe postMessage
        }
    }, [conversationUrl, conversationId]);

    return (
        <TavusContext.Provider value={{
            conversationUrl,
            conversationId,
            startConversation,
            endConversation,
            updateContext,
            isReady
        }}>
            {children}
        </TavusContext.Provider>
    );
}
