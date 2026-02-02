// API route for Gemini 3 migration planning

import { NextRequest, NextResponse } from 'next/server';
import { GeminiPlanRequest } from '@/types/migration';

// Mock migration plan for demo mode
function getMockPlan(currentState: any, goalState: any, timeframe: number) {
    const currentYear = new Date().getFullYear();
    const milestones = [];

    for (let i = 0; i <= timeframe; i += 2) {
        milestones.push({
            year: currentYear + i,
            title: i === 0 ? 'Begin Preparation' :
                i === 2 ? 'Submit Applications' :
                    i === 4 ? 'Secure Work Permit' :
                        i === 6 ? 'Establish Residency' :
                            i === 8 ? 'Apply for Permanent Residency' :
                                'Target Citizenship',
            description: `Strategic milestone for your ${currentState?.location || 'current'} → ${goalState?.location || 'target'} migration pathway.`,
            status: i === 0 ? 'current' : 'upcoming',
            requirements: ['Financial documentation', 'Background check', 'Language certification'],
            estimatedCost: 5000 + (i * 2500)
        });
    }

    return {
        plan: {
            origin: currentState?.location || 'Current Location',
            destination: goalState?.location || 'Target Destination',
            pathway: 'Skilled Worker → Residency → Citizenship',
            totalDuration: `${timeframe} years`,
            milestones,
            successProbability: 0.78,
            _thoughtSignature: 'Demo mode - Pre-computed migration pathway.'
        },
        reasoning: 'Demo mode - AI planning temporarily unavailable.',
        thoughtSignature: 'Demo mode - Pre-computed migration pathway.',
        alternativeStrategies: [
            { name: 'Investment Route', duration: '3-5 years', cost: '$250,000+' },
            { name: 'Digital Nomad Visa', duration: '1-2 years', cost: '$5,000' }
        ],
        risks: [
            { factor: 'Policy Changes', impact: 'medium', mitigation: 'Monitor legislative updates' },
            { factor: 'Economic Conditions', impact: 'low', mitigation: 'Maintain emergency funds' }
        ],
        confidence: 0.78
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: GeminiPlanRequest = await request.json();
        const { currentState, goalState, timeframe } = body;

        // Validate required fields
        if (!currentState || !goalState) {
            return NextResponse.json(
                { error: 'Missing required fields: currentState and goalState' },
                { status: 400 }
            );
        }

        // Check if API key exists
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log('Gemini Plan API: No API key, using demo mode');
            return NextResponse.json(getMockPlan(currentState, goalState, timeframe || 10));
        }

        // Try the real engine
        try {
            const { MigrationEngine } = await import('@/logic/migrationEngine');
            const engine = new MigrationEngine(apiKey);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const plan = await engine.generateMigrationPlan(
                currentState,
                goalState,
                timeframe || 10
            ) as any;

            const response = {
                plan,
                reasoning: plan._thoughtSignature || 'Generated using Gemini 3 API',
                thoughtSignature: plan._thoughtSignature,
                alternativeStrategies: [],
                risks: [],
                confidence: plan.successProbability || 0.75,
            };

            return NextResponse.json(response);
        } catch (engineError: any) {
            console.error('Migration Engine Error:', engineError.message);
            // Fall back to mock on any engine error
            console.log('Gemini Plan API: Falling back to demo mode');
            return NextResponse.json(getMockPlan(currentState, goalState, timeframe || 10));
        }

    } catch (error: any) {
        console.error('Error in /api/gemini/plan:', error);
        // Return mock plan on any error
        return NextResponse.json(getMockPlan({}, {}, 10));
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Gemini Planning API',
        version: '1.0.0',
        status: 'demo_mode_available',
        endpoints: {
            POST: 'Generate migration plan from current state to goal state',
        },
    });
}
