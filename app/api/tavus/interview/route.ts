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

        // Add conversational context if provided (thought signature, geopolitical data, etc.)
        if (conversationalContext) {
            conversationPayload.conversational_context = conversationalContext;
        }

        // Add custom greeting if context has user info
        if (context?.userName) {
            conversationPayload.custom_greeting = `Hello ${context.userName}, I'm your CONVERGE migration advisor. I've analyzed your passport data and have some strategic insights to share.`;
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
