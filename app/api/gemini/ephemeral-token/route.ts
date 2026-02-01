import { NextResponse } from 'next/server';

/**
 * Ephemeral Token Generator for Gemini Live API
 * 
 * Returns the API key for browser clients to connect to Gemini Live API.
 * In production, implement proper ephemeral token exchange.
 */

export async function POST() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Return token directly without validation call to preserve quota
        // The Live API connection will validate the key
        return NextResponse.json({
            token: apiKey,
            expiresIn: 3600, // 1 hour
            model: 'gemini-2.0-flash-live-001',
        });

    } catch (error) {
        console.error('Ephemeral token error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
