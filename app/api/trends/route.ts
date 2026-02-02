/**
 * API Route: /api/trends
 * Fetches and analyzes global trends for a migration path
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock report for demo mode
function getMockReport(origin: string, destination: string) {
    return {
        origin,
        destination,
        generatedAt: new Date().toISOString(),
        riskScore: 35,
        opportunityScore: 78,
        recommendation: `The ${origin} → ${destination} corridor shows strong potential with favorable policy trends and economic stability.`,
        combinedSignals: [
            {
                type: 'policy',
                title: 'Digital Nomad Visa Expansion',
                summary: `${destination} has announced expanded digital nomad visa programs, making remote work transitions easier.`,
                impact: 'positive',
                confidence: 0.85
            },
            {
                type: 'economic',
                title: 'Currency Stability Index',
                summary: `${destination}'s currency remains stable against major benchmarks, supporting purchasing power parity.`,
                impact: 'positive',
                confidence: 0.72
            },
            {
                type: 'geopolitical',
                title: 'Bilateral Relations',
                summary: `${origin} and ${destination} maintain strong diplomatic ties with active trade agreements.`,
                impact: 'neutral',
                confidence: 0.68
            },
            {
                type: 'bilateral',
                title: 'Visa Agreement Updates',
                summary: 'Recent bilateral visa agreements have streamlined the application process for skilled workers.',
                impact: 'positive',
                confidence: 0.81
            }
        ],
        thoughtSignature: 'Demo mode - AI analysis temporarily unavailable.'
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { origin, destination, includeSearchGrounding = true } = body;

        if (!origin || !destination) {
            return NextResponse.json(
                { error: 'Origin and destination countries are required' },
                { status: 400 }
            );
        }

        console.log(`Trends API: Generating report for ${origin} → ${destination}`);

        // Check if API key exists
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log('Trends API: No API key, using demo mode');
            return NextResponse.json(getMockReport(origin, destination));
        }

        // Try the real engine, but catch errors and fall back to mock
        try {
            const { globalTrendsEngine } = await import('@/lib/globalTrendsEngine');
            const report = await globalTrendsEngine.generateReport(
                origin,
                destination,
                includeSearchGrounding
            );
            return NextResponse.json(report);
        } catch (engineError: any) {
            console.error('Trends Engine Error:', engineError.message);
            // Fall back to mock on any engine error (including rate limits)
            console.log('Trends API: Falling back to demo mode');
            return NextResponse.json(getMockReport(origin, destination));
        }

    } catch (error: any) {
        console.error('Trends API Error:', error);
        // Return mock data on any error
        return NextResponse.json(getMockReport('USA', 'Switzerland'));
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'USA';
    const destination = searchParams.get('destination') || 'Switzerland';

    // Always return mock data for GET (health check)
    return NextResponse.json({
        summary: {
            riskScore: 35,
            opportunityScore: 78,
            recommendation: `The ${origin} → ${destination} corridor shows strong potential.`,
            signalCount: 4
        }
    });
}
