/**
 * API Route: /api/trends
 * Fetches and analyzes global trends for a migration path
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalTrendsEngine } from '@/lib/globalTrendsEngine';

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

        const report = await globalTrendsEngine.generateReport(
            origin,
            destination,
            includeSearchGrounding
        );

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('Trends API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate trends report' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Quick health check / demo endpoint
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'USA';
    const destination = searchParams.get('destination') || 'Switzerland';

    try {
        const report = await globalTrendsEngine.generateReport(origin, destination, false);
        return NextResponse.json({
            summary: {
                riskScore: report.riskScore,
                opportunityScore: report.opportunityScore,
                recommendation: report.recommendation,
                signalCount: report.combinedSignals.length
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
