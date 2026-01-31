// API route for Tavus CVI live interview integration

import { NextRequest, NextResponse } from 'next/server';
import { TavusInterviewRequest, TavusInterviewResponse } from '@/types/migration';

export async function POST(request: NextRequest) {
    try {
        const body: TavusInterviewRequest = await request.json();

        const { userId, interviewType, context, metadata } = body;

        // Validate required fields
        if (!userId || !interviewType) {
            return NextResponse.json(
                { error: 'Missing required fields: userId and interviewType' },
                { status: 400 }
            );
        }

        const apiKey = process.env.TAVUS_API_KEY;

        if (!apiKey) {
            // Return mock response if no API key is configured
            console.warn('No Tavus API key configured. Returning mock response.');

            const mockResponse: TavusInterviewResponse = {
                sessionId: `mock_session_${Date.now()}`,
                streamUrl: 'https://mock-tavus-stream.example.com',
                status: 'initiated',
                estimatedDuration: 15,
            };

            return NextResponse.json(mockResponse);
        }

        // Call Tavus API to initiate interview
        // Note: This is a placeholder implementation - adjust based on actual Tavus API
        const tavusResponse = await fetch('https://api.tavus.io/v1/interviews', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                interview_type: interviewType,
                context: context,
                metadata: metadata,
            }),
        });

        if (!tavusResponse.ok) {
            throw new Error(`Tavus API error: ${tavusResponse.statusText}`);
        }

        const data = await tavusResponse.json();

        const response: TavusInterviewResponse = {
            sessionId: data.session_id || data.sessionId,
            streamUrl: data.stream_url || data.streamUrl,
            status: data.status || 'initiated',
            estimatedDuration: data.estimated_duration || data.estimatedDuration || 15,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Error in /api/tavus/interview:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to initiate interview' },
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
