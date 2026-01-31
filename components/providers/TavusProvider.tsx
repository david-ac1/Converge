'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface TavusContextType {
    conversationUrl: string | null;
    startConversation: () => Promise<void>;
    endConversation: () => void;
    updateContext: (context: Record<string, any>) => void;
    isReady: boolean;
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
    const [isReady, setIsReady] = useState(false);

    // We keep a ref to the iframe or active conversation handler if needed
    // For this implementation, we assume the URL is used by a component (ExpertHub) 
    // and we coordinate updates via state or API.

    const startConversation = useCallback(async () => {
        try {
            // In a real app, we call our API to create a conversation
            const res = await fetch('/api/tavus/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user_default', // simplified
                    interviewType: 'initial'
                })
            });
            const data = await res.json();
            if (data.url) {
                setConversationUrl(data.url);
                setIsReady(true);
            }
        } catch (error) {
            console.error('Failed to start Tavus conversation:', error);
        }
    }, []);

    const endConversation = useCallback(() => {
        setConversationUrl(null);
        setIsReady(false);
    }, []);

    const updateContext = useCallback((context: Record<string, any>) => {
        // This function sends context updates to the active Tavus conversation
        // If using an iframe, we would postMessage here.
        // Example:
        // const iframe = document.getElementById('tavus-frame') as HTMLIFrameElement;
        // iframe?.contentWindow?.postMessage({ type: 'context_update', payload: context }, '*');

        console.log('Tavus Context Update:', context);

        // Mocking the reaction for now (logging)
        if (conversationUrl) {
            // In a real implementation with valid SDK or iframe protocol:
            // This would trigger the avatar to acknowledge the change
        }
    }, [conversationUrl]);

    return (
        <TavusContext.Provider value={{ conversationUrl, startConversation, endConversation, updateContext, isReady }}>
            {children}
        </TavusContext.Provider>
    );
}
