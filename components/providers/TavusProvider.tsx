'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface OnboardingResult {
    name: string;
    nationality: string;
    migrationGoal: string;
    age: number | null;
    incomeRange: string;
    destination: string;
    currentState?: any;
    goalState?: any;
}

interface TavusContextType {
    conversationUrl: string | null;
    conversationId: string | null;
    onboardingResult: OnboardingResult | null;
    isPolling: boolean;
    startConversation: (context?: ConversationContext) => Promise<void>;
    endConversation: () => Promise<OnboardingResult | null>;
    updateContext: (context: Record<string, any>) => void;
    isReady: boolean;
}

interface ConversationContext {
    userName?: string;
    thoughtSignature?: string;
    geopoliticalProfile?: any;
    focusedYear?: number;
    planSummary?: string;
    trendsReport?: any;
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
    const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

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
            if (context?.trendsReport) {
                conversationalContext += `Current Trends: ${context.trendsReport.recommendation}\n`;
            }

            const res = await fetch('/api/tavus/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: {
                        userName: context?.userName,
                        focusedYear: context?.focusedYear || 0
                    },
                    // Don't pass conversationalContext to use the default ARIA onboarding prompt
                    conversationalContext: conversationalContext || undefined
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
                setOnboardingResult(null); // Reset previous results
            } else {
                throw new Error('No conversation URL received');
            }
        } catch (error) {
            console.error('Failed to start Tavus conversation:', error);
            throw error;
        }
    }, []);

    const pollForResults = useCallback(async (sessionId: string): Promise<OnboardingResult | null> => {
        setIsPolling(true);
        const maxAttempts = 30; // 30 seconds max
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const res = await fetch(`/api/tavus/webhook?sessionId=${sessionId}`);
                const data = await res.json();

                if (data.status === 'completed' && data.onboardingData) {
                    setIsPolling(false);
                    return data.onboardingData;
                }

                if (data.status === 'failed') {
                    setIsPolling(false);
                    return null;
                }

                // Wait 1 second before next poll
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            } catch (error) {
                console.error('Polling error:', error);
                attempts++;
            }
        }

        setIsPolling(false);
        return null;
    }, []);

    const endConversation = useCallback(async (): Promise<OnboardingResult | null> => {
        const currentId = conversationId;

        setConversationUrl(null);
        setConversationId(null);
        setIsReady(false);

        // Poll for onboarding results if we have a conversation ID
        if (currentId) {
            const result = await pollForResults(currentId);
            if (result) {
                setOnboardingResult(result);
                return result;
            }
        }

        return null;
    }, [conversationId, pollForResults]);

    const updateContext = useCallback((context: Record<string, any>) => {
        // Log context updates for the active conversation
        console.log('Tavus Context Update:', context);

        // In an advanced implementation, we could use Tavus's real-time API
        // to update the persona's context mid-conversation
    }, []);

    return (
        <TavusContext.Provider value={{
            conversationUrl,
            conversationId,
            onboardingResult,
            isPolling,
            startConversation,
            endConversation,
            updateContext,
            isReady
        }}>
            {children}
        </TavusContext.Provider>
    );
}

