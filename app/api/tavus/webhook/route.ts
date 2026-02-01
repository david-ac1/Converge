// Webhook endpoint for Tavus CVI interview events

import { NextRequest, NextResponse } from 'next/server';
import { TavusWebhookPayload } from '@/types/migration';
import { onboardingProcessor } from '@/lib/onboardingProcessor';

// Store for conversation transcripts (in production, use a database)
const conversationStore: Map<string, { transcript: string; status: string; onboardingData?: any }> = new Map();

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

        // Get or create conversation record
        let conversation = conversationStore.get(sessionId) || { transcript: '', status: 'started' };

        // Process different event types
        switch (event) {
            case 'started':
                console.log(`Interview ${sessionId} has started`);
                conversation.status = 'in_progress';
                conversationStore.set(sessionId, conversation);
                break;

            case 'transcript_update':
                console.log(`Transcript update for ${sessionId}:`, data.transcript);
                // Accumulate transcript
                if (data.transcript) {
                    conversation.transcript += '\n' + data.transcript;
                    conversationStore.set(sessionId, conversation);
                }
                break;

            case 'completed':
                console.log(`Interview ${sessionId} completed`);
                conversation.status = 'completed';

                // Parse the transcript to extract onboarding data
                if (conversation.transcript) {
                    try {
                        const onboardingData = await onboardingProcessor.parseTranscript(conversation.transcript);
                        conversation.onboardingData = onboardingData;
                        console.log('Extracted onboarding data:', onboardingData);

                        // Convert to migration snapshot format
                        const { currentState, goalState } = onboardingProcessor.toMigrationSnapshot(onboardingData);

                        // Store for retrieval by the client
                        conversationStore.set(sessionId, {
                            ...conversation,
                            onboardingData: {
                                ...onboardingData,
                                currentState,
                                goalState
                            }
                        });
                    } catch (parseError) {
                        console.error('Failed to parse transcript:', parseError);
                    }
                }

                // Process interview insights if provided
                if (data.insights && data.insights.length > 0) {
                    console.log('Interview insights:', data.insights);
                }
                break;

            case 'failed':
                console.error(`Interview ${sessionId} failed:`, data.error);
                conversation.status = 'failed';
                conversationStore.set(sessionId, conversation);
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

// GET endpoint to retrieve conversation data (for client polling)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
        const conversation = conversationStore.get(sessionId);
        if (conversation) {
            return NextResponse.json({
                sessionId,
                ...conversation
            });
        }
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Return API info
    return NextResponse.json({
        message: 'Tavus Webhook Endpoint',
        version: '2.0.0',
        supportedEvents: [
            'started',
            'transcript_update',
            'completed',
            'failed',
        ],
        usage: 'GET ?sessionId=xxx to retrieve conversation data'
    });
}
