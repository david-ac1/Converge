import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('[API] Key exists:', !!apiKey);

        if (!apiKey) {
            console.error('[API] GEMINI_API_KEY is missing from environment');
            return NextResponse.json(
                { error: 'API key missing', details: 'GEMINI_API_KEY is not configured on the server.' },
                { status: 401 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const body = await request.json();
        const { messages = [], systemPrompt = '', isFirstMessage = false } = body;

        console.log('[API] Request received. Messages:', messages.length, 'isFirst:', isFirstMessage);

        // Configure model with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-preview',
            systemInstruction: systemPrompt
        });

        // Format history for Gemini SDK
        // 1. Map 'assistant' to 'model'
        // 2. Ensure alternating user/model
        // 3. History should exclude the latest message (it's sent in sendMessage)
        const historyMessages = isFirstMessage ? [] : messages.slice(0, -1);

        const history = historyMessages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Constraint: History must start with 'user'
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

        // Prompt for first message vs continuation
        const prompt = isFirstMessage
            ? "Please greet the user warmly and begin the intake interview by asking for their name."
            : messages[messages.length - 1]?.content || 'Continue the conversation';

        console.log('[API] Sending prompt to Gemini...');
        const result = await chat.sendMessage(prompt);
        const responseText = result.response.text();

        // Data extraction logic if conversation is long enough
        let onboardingData = null;
        if (messages.length >= 6) {
            console.log('[API] Attempting data extraction and completion check...');
            try {
                const extractionPrompt = `Analyze the conversation and extract user migration profile.
REQUIRED FIELDS:
- name
- nationality
- currentLocation
- migrationGoal (e.g., Citizenship, Work, Study)
- age (integer)
- incomeRange
- destination (Target country or city)

Also, determine "isComplete": true if ALL fields above have been answered clearly by the user, otherwise false.

Return ONLY a JSON object. No markdown. Example:
{"name": "...", ..., "isComplete": true}`;

                // Use a separate one-off call for extraction
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
                    console.log('[API] Extraction Result:', onboardingData);
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
        console.error('[API] Global Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process chat message',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
