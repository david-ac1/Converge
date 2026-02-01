// API route for Gemini 3 migration planning

import { NextRequest, NextResponse } from 'next/server';
import { MigrationEngine } from '@/logic/migrationEngine';
import { GeminiPlanRequest } from '@/types/migration';

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

        // Initialize migration engine with API key from environment
        const apiKey = process.env.GEMINI_API_KEY;
        const engine = new MigrationEngine(apiKey);

        // Generate migration plan
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plan = await engine.generateMigrationPlan(
            currentState,
            goalState,
            timeframe || 10
        ) as any;

        // Construct response
        const response = {
            plan,
            reasoning: plan._thoughtSignature || 'Generated using Gemini 3 API for goal-conditioned planning',
            thoughtSignature: plan._thoughtSignature, // Explicit thought signature field
            alternativeStrategies: [],
            risks: [],
            confidence: plan.successProbability || 0.75,
        };

        return NextResponse.json(response);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error in /api/gemini/plan:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate migration plan' },
            { status: 500 }
        );
    }
}

export async function GET(_request: NextRequest) {
    return NextResponse.json({
        message: 'Gemini Planning API',
        version: '1.0.0',
        endpoints: {
            POST: 'Generate migration plan from current state to goal state',
        },
    });
}
