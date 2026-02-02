/**
 * API Route: /api/convergence
 * Returns migration convergence data for the heatmap
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConvergenceEngine, TOP_15_DESTINATIONS, COUNTRY_NAMES } from '@/lib/convergenceEngine';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { originCountry = 'ng', targetCountries } = body;

        console.log(`Convergence API: Generating report for ${originCountry} passport holder`);

        const engine = getConvergenceEngine(process.env.GEMINI_API_KEY);
        const report = await engine.generateReport(originCountry, targetCountries);

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('Convergence API Error:', error);

        // Return fallback data
        const engine = getConvergenceEngine();
        const fallbackReport = await engine.generateReport('ng');

        return NextResponse.json({
            ...fallbackReport,
            _thoughtSignature: 'Fallback data due to error.'
        });
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || 'ng';

    // Quick endpoint for initial load
    const engine = getConvergenceEngine(process.env.GEMINI_API_KEY);
    const report = await engine.generateReport(origin, TOP_15_DESTINATIONS);

    return NextResponse.json({
        originCountry: COUNTRY_NAMES[origin] || origin.toUpperCase(),
        topDestinations: report.convergenceData.filter(c => c.isTop15).slice(0, 5),
        globalSignals: report.globalSignals.slice(0, 3),
        generatedAt: report.generatedAt
    });
}
