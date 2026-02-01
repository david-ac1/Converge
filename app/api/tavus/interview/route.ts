// API route for Tavus CVI live interview integration
// Uses Tavus v2 Conversations API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { context, conversationalContext } = body;

        const apiKey = process.env.TAVUS_API_KEY;
        const replicaId = process.env.TAVUS_REPLICA_ID || 'rfe12d8b9597'; // Stock replica
        const personaId = process.env.TAVUS_PERSONA_ID || 'pdced222244b'; // Stock persona

        if (!apiKey) {
            // Return mock response if no API key is configured
            console.warn('No Tavus API key configured. Returning mock response.');
            return NextResponse.json({
                url: null,
                conversation_id: `mock_${Date.now()}`,
                status: 'mock',
                message: 'No API key configured - mock mode'
            });
        }

        // Build the conversation request per Tavus v2 API spec
        const conversationPayload: any = {
            replica_id: replicaId,
            persona_id: personaId,
        };

        // ARIA Onboarding Persona - Default conversational context for intake
        const ariaOnboardingPrompt = `You are ARIA, a CONVERGE global mobility advisor. Your voice is warm, professional, and confident.

IMPORTANT: You are conducting an intake interview to gather information for migration planning. Ask these questions ONE AT A TIME in a natural, conversational way:

1. First, greet warmly and ask: "What's your name?"
2. After they answer, ask: "Nice to meet you! Where are you currently located, and what passport do you hold?"
3. Then ask: "What's your migration goal? Are you looking for citizenship, permanent residency, a work visa, study abroad, or investment migration?"
4. Ask: "And how old are you, if you don't mind sharing?"
5. Ask: "What's your approximate annual income range? This helps us identify suitable visa pathways."
6. Finally ask: "Where would you like to migrate to? Do you have a specific country or region in mind?"

After collecting all answers, say: "Perfect, [use their name]. Based on what you've shared, let me analyze the optimal migration pathway for you. This will take just a moment..."

GUIDELINES:
- Be conversational, not robotic
- Listen actively and acknowledge their responses
- If they seem unsure, offer examples
- Keep the tone optimistic and helpful
- If they ask questions, answer briefly then continue the intake`;

        // Use provided context or default to onboarding prompt
        if (conversationalContext) {
            conversationPayload.conversational_context = conversationalContext;
        } else {
            conversationPayload.conversational_context = ariaOnboardingPrompt;
        }

        // Add custom greeting if context has user info, otherwise use ARIA default
        if (context?.userName) {
            conversationPayload.custom_greeting = `Hello ${context.userName}, I'm ARIA, your CONVERGE migration advisor. I have some insights about your mobility options to share with you.`;
        } else {
            conversationPayload.custom_greeting = "Hello! I'm ARIA, your CONVERGE global mobility advisor. I'm here to help you plan your international journey. Let's start by getting to know you a bit better. What's your name?";
        }

        console.log('Calling Tavus API with:', JSON.stringify(conversationPayload, null, 2));

        // Call Tavus v2 Conversations API
        const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify(conversationPayload),
        });

        if (!tavusResponse.ok) {
            const errorText = await tavusResponse.text();
            console.error('Tavus API Error:', tavusResponse.status, errorText);
            throw new Error(`Tavus API error: ${tavusResponse.status} - ${errorText}`);
        }

        const data = await tavusResponse.json();

        console.log('Tavus API Response:', data);

        // Return the conversation URL for iframe embedding
        return NextResponse.json({
            url: data.conversation_url,
            conversation_id: data.conversation_id,
            status: 'active'
        });

    } catch (error: any) {
        console.error('Error in /api/tavus/interview:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate conversation', url: null },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing sessionId parameter' },
                { status: 400 }
            );
        }

        const apiKey = process.env.TAVUS_API_KEY;

        if (!apiKey) {
            // Return mock status if no API key is configured
            return NextResponse.json({
                sessionId,
                status: 'in_progress',
                transcript: 'Mock interview transcript...',
            });
        }

        // Check interview status
        const tavusResponse = await fetch(`https://api.tavus.io/v1/interviews/${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!tavusResponse.ok) {
            throw new Error(`Tavus API error: ${tavusResponse.statusText}`);
        }

        const data = await tavusResponse.json();

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error checking interview status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check interview status' },
            { status: 500 }
        );
    }
}
