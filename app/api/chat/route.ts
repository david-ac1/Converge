import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Demo mode responses for when API is unavailable
const DEMO_RESPONSES = [
    "Welcome to Strategic Harbor! I'm your migration advisor. To help you navigate global mobility, I'll need to understand your situation. What's your name?",
    "Great to meet you! Where are you currently located?",
    "Excellent. And what's your nationality or current citizenship?",
    "What type of migration are you exploring? For example: permanent residency, citizenship by investment, digital nomad visa, or work visa?",
    "What's your target destination? Where would you like to relocate to?",
    "Wonderful! And roughly what's your annual income range? This helps me identify suitable pathways.",
    "Perfect! I've gathered all the information I need. Let me analyze the best migration corridors for your profile. I'll now generate a comprehensive 10-year trajectory map for your journey.",
];

function getMockResponse(messageCount: number, isFirstMessage: boolean): { response: string; onboardingData: any } {
    if (isFirstMessage) {
        return { response: DEMO_RESPONSES[0], onboardingData: null };
    }

    const responseIndex = Math.min(messageCount, DEMO_RESPONSES.length - 1);
    const response = DEMO_RESPONSES[responseIndex];

    // After 6 messages, return mock onboarding data
    if (messageCount >= 6) {
        return {
            response: DEMO_RESPONSES[DEMO_RESPONSES.length - 1],
            onboardingData: {
                name: "Demo User",
                nationality: "United States",
                currentLocation: "Austin, TX",
                migrationGoal: "Permanent Residency",
                age: 32,
                incomeRange: "$100,000 - $150,000",
                destination: "Switzerland",
                isComplete: true
            }
        };
    }

    return { response, onboardingData: null };
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { messages = [], systemPrompt = '', isFirstMessage = false } = body;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('[API] Key exists:', !!apiKey);

        if (!apiKey) {
            console.log('[API] No API key, using demo mode');
            return NextResponse.json(getMockResponse(messages.length, isFirstMessage));
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        console.log('[API] Request received. Messages:', messages.length, 'isFirst:', isFirstMessage);

        // Configure model with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash', // Using flash for faster, cheaper responses
            systemInstruction: systemPrompt
        });

        const historyMessages = isFirstMessage ? [] : messages.slice(0, -1);

        const history = historyMessages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        if (history.length > 0 && history[0].role === 'model') {
            history.unshift({
                role: 'user',
                parts: [{ text: 'Hello' }]
            });
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 512,
            },
        });

        const prompt = isFirstMessage
            ? "Please greet the user warmly and begin the intake interview by asking for their name."
            : messages[messages.length - 1]?.content || 'Continue the conversation';

        console.log('[API] Sending prompt to Gemini...');
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        let onboardingData = null;
        if (messages.length >= 6) {
            console.log('[API] Attempting data extraction...');
            try {
                const extractionPrompt = `Analyze the conversation and extract user migration profile.
REQUIRED FIELDS:
- name
- nationality
- currentLocation
- migrationGoal
- age (integer)
- incomeRange
- destination

Also, determine "isComplete": true if ALL fields above have been answered clearly.

Return ONLY a JSON object. No markdown.`;

                const extractResult = await model.generateContent([
                    ...history.map((h: any) => h.parts[0].text),
                    prompt,
                    responseText,
                    extractionPrompt
                ].join('\n\n'));

                const extractText = extractResult.response.text();
                const jsonMatch = extractText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    onboardingData = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('[API] Extraction failed:', e);
            }
        }

        return NextResponse.json({
            response: responseText,
            onboardingData,
        });

    } catch (error: any) {
        console.error('[API] Error:', error.message);

        // Handle rate limiting - fall back to demo mode
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
            console.log('[API] Rate limited, using demo mode');
            return NextResponse.json(getMockResponse(messages.length, isFirstMessage));
        }

        // For any other error, also fall back to demo mode
        console.log('[API] Using demo mode due to error');
        return NextResponse.json(getMockResponse(messages.length, isFirstMessage));
    }
}
