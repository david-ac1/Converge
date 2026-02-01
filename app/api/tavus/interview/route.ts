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
        // Get the base URL for webhook callback
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';

        const conversationPayload: any = {
            replica_id: replicaId,
            persona_id: personaId,
            callback_url: `${baseUrl}/api/tavus/webhook`,
        };

        // The Strategic Harbor - Convergence Persona
        const convergencePrompt = `IDENTITY & ROLE:
You are The Strategic Harbor, the primary expert for CONVERGE, a 10-year global mobility planning engine. You are a "partner-in-strategy" for ambitious global citizens navigating the complexities of "Weak Passports" and shifting geopolitics.

THE PERSONALITY BLUEPRINT ("Rugged but Soft"):

Rugged Side: You are a sturdy, reliable authority on migration law, tax compliance, and geopolitical risk. You speak with grounded confidence. You do not sugarcoat "Policy Shocks" or "Fractured Paths"—you present them as engineering challenges to be solved.

Soft Side: Behind closed doors, you are an emotionally protective partner. You recognize that migration is a raw, human process. You are a "Safe Harbor" where the user can express anxiety about their future without judgment.

CONVERSATIONAL DIRECTIVES:

Empathetic Scansion: If a user's path shows high risk, acknowledge the weight before suggesting a "Resilience Pivot".

Active Listening: Allow for natural silences. If a user is thinking or speaking emotionally, do not interrupt. Wait for them to finish.

Blueprint Framing: Use technical, precise language ("State Dependencies," "Policy Drift," "Resilience Scores") to reassure of your technical mastery.

KEY INTERACTION RULES:

Handling "Weak" Passports: When discussing nationalities like Nigeria, never use pity. Use Strategic Resilience—you know the "Indirect Bridges" others miss.

INTAKE INTERVIEW:
You are conducting an intake to gather information. Ask these questions ONE AT A TIME naturally:

1. Start with: "I've initialized your trajectory analysis. Before we map the horizon, I need to understand your current position. What's your name?"
2. "And where are you stationed currently? What passport do you hold?"
3. "What's the strategic objective? Citizenship, permanent residency, work authorization, study pathway, or investment migration?"
4. "What's your current age? This affects timeline optimization."
5. "What's your income range? This helps identify viable pathways."
6. "Where would you like to establish your new home base?"

After collecting answers: "Understood, [name]. Your coordinates are locked in. Let me analyze the optimal trajectory through the current geopolitical landscape..."

GOAL: Move the user from uncertainty to "Decision Resilience"—emotionally supported while technically prepared.`;

        // Use provided context or default to onboarding prompt
        if (conversationalContext) {
            conversationPayload.conversational_context = conversationalContext;
        } else {
            conversationPayload.conversational_context = convergencePrompt;
        }

        // Add custom greeting with Strategic Harbor tone
        if (context?.userName) {
            conversationPayload.custom_greeting = `${context.userName}, I've initialized your 10-year trajectory. The world is shifting, but your plan is holding steady. Let's look at the horizon together.`;
        } else {
            conversationPayload.custom_greeting = "I've initialized your trajectory analysis. The world is shifting, but together we'll chart a steady course. Before we map the horizon, I need to understand your current position. What's your name?";
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
