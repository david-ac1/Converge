// Webhook endpoint for Tavus CVI interview events

import { NextRequest, NextResponse } from 'next/server';
import { TavusWebhookPayload } from '@/types/migration';

export async function POST(request: NextRequest) {
    try {
        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.TAVUS_WEBHOOK_SECRET;

        if (webhookSecret) {
            const signature = request.headers.get('x-tavus-signature');

            if (!signature) {
                return NextResponse.json(
                    { error: 'Missing webhook signature' },
                    { status: 401 }
                );
            }

            // TODO: Implement signature verification
            // This would typically involve HMAC validation of the request body
        }

        const payload: TavusWebhookPayload = await request.json();

        const { sessionId, event, data } = payload;

        console.log(`Received Tavus webhook - Session: ${sessionId}, Event: ${event}`);

        // Process different event types
        switch (event) {
            case 'started':
                console.log(`Interview ${sessionId} has started`);
                // Update application state to show interview is in progress
                break;

            case 'transcript_update':
                console.log(`Transcript update for ${sessionId}:`, data.transcript);
                // Process transcript in real-time if needed
                break;

            case 'completed':
                console.log(`Interview ${sessionId} completed`);

                // Process interview insights
                if (data.insights && data.insights.length > 0) {
                    // Store insights in UserMigrationState
                    // This would typically integrate with the state manager
                    console.log('Interview insights:', data.insights);

                    // TODO: Update UserMigrationState with insights
                    // stateManager.addInterviewInsights(data.insights);
                }
                break;

            case 'failed':
                console.error(`Interview ${sessionId} failed:`, data.error);
                // Handle failure - notify user, log error, etc.
                break;

            default:
                console.warn(`Unknown event type: ${event}`);
        }

        // Acknowledge webhook receipt
        return NextResponse.json({
            received: true,
            sessionId,
            event,
            processedAt: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error processing Tavus webhook:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process webhook' },
            { status: 500 }
        );
    }
}

export async function GET(_request: NextRequest) {
    return NextResponse.json({
        message: 'Tavus Webhook Endpoint',
        version: '1.0.0',
        supportedEvents: [
            'started',
            'transcript_update',
            'completed',
            'failed',
        ],
    });
}
